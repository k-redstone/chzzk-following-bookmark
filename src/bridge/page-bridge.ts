/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getWebpackRequire,
  type WebpackRequireFn,
  type WebpackModuleId,
} from './getwebpackRequire'

import type {
  LiveInfo,
  LivePlayback,
  PlayerNamespace,
  PreviewMountParams,
} from '@/types/preview-bridge'

const LOG_PREFIX = '[preview-bridge:min]'
const isDev =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
/** ───────────────────────── utils ───────────────────────── */
const logError = (
  where: string,
  err: unknown,
  extra?: Record<string, unknown>,
) => {
  if (!isDev) return
  try {
    const payload = {
      where,
      message: err instanceof Error ? err.message : String(err),
      name: err instanceof Error ? err.name : undefined,
      extra,
    }
    console.error(LOG_PREFIX, payload)
  } catch {}
}

const isPlayerNs = (ns: unknown): ns is PlayerNamespace => {
  if (!ns || typeof ns !== 'object') return false
  const o = ns as Record<string, unknown>
  return (
    typeof o['CorePlayer'] === 'function' &&
    typeof (o['LiveProvider'] as any)?.['fromJSON'] === 'function'
  )
}

const getRoot = (
  p: {
    shadowRoot?: HTMLElement
    root?: HTMLElement
    el?: HTMLElement
    element?: HTMLElement
  } | null,
): HTMLElement | null => p?.shadowRoot ?? p?.root ?? p?.el ?? p?.element ?? null

const stopHtmlVideo = (root: HTMLElement | null): void => {
  const v = root?.querySelector?.('video') as HTMLVideoElement | null
  if (!v) return
  try {
    v.pause()
  } catch (e) {
    logError('video.pause', e)
  }
  try {
    v.removeAttribute('src')
  } catch (e) {
    logError('video.removeSrc', e)
  }
  try {
    v.load()
  } catch (e) {
    logError('video.load', e)
  }
}

/** ───────────────────────── player ns ───────────────────────── */
async function resolvePlayerNamespace(): Promise<PlayerNamespace> {
  const __r: WebpackRequireFn = await getWebpackRequire()
  const ids = Object.keys(__r.m) as Array<WebpackModuleId>
  for (const id of ids) {
    try {
      const src = __r.m[id].toString()
      if (!src.includes('CorePlayer') && !src.includes('LiveProvider.fromJSON'))
        continue
      const mod = __r(id)
      if (isPlayerNs(mod)) return mod
    } catch {}
  }
  throw new Error('Player namespace not found')
}

/** ───────────────────────── data fetch ───────────────────────── */
type LiveDetailResponse = { code: number; content: LiveInfo }
async function fetchLiveDetail(uid: string): Promise<LiveInfo> {
  const r = await fetch(
    `https://api.chzzk.naver.com/service/v3.2/channels/${uid}/live-detail`,
    { credentials: 'include' },
  )
  if (!r.ok) throw new Error('live-detail fetch failed')
  const j = (await r.json()) as unknown
  if (!j || typeof j !== 'object' || !('code' in j))
    throw new Error('invalid live-detail response')

  const res = j as LiveDetailResponse
  if (res.code !== 200) throw new Error('live-detail code != 200')

  const info = res.content
  if (!info.livePlayback && (info as any).livePlaybackJson) {
    try {
      info.livePlayback = JSON.parse(
        (info as any).livePlaybackJson,
      ) as LivePlayback
    } catch {}
  }
  return info
}

/** ───────────────────────── minimal state ───────────────────────── */
const state: {
  ns: PlayerNamespace | null
  player: unknown | null
  container: HTMLElement | null
  token: string | null
} = {
  ns: null,
  player: null,
  container: null,
  token: null,
}

/** ───────────────────────── core: mount/unmount ───────────────────────── */

async function mountPlayer(params: PreviewMountParams): Promise<void> {
  const { containerId, livePlayback, volume, maxLevel = 480, token } = params
  state.token = token

  const ns = await resolvePlayerNamespace()
  const container = document.getElementById(containerId)
  if (!container) throw new Error('container not found')

  // ───────── 플레이어 생성/재사용 ─────────
  let player = state.player
  if (!player) {
    player = new ns.CorePlayer()
    state.player = player
    state.container = container
  }
  container.innerHTML = ''
  const root = getRoot(player as any)
  if (root) {
    try {
      root.style.visibility = 'hidden'
    } catch {}
    container.appendChild(root)
  }

  // ───────── 기본 속성 ─────────
  try {
    // ;(player as any).muted = true
    if (typeof volume === 'number') (player as any).volume = volume / 100
  } catch (e) {
    logError('player.props', e)
  }

  // ───────── 소스 생성 & 주입 ─────────
  const src = ns.LiveProvider.fromJSON(livePlayback, {
    devt: 'HTML5_PC',
    serviceId: 2099,
    countryCode: 'kr',
    p2pDisabled: true,
    maxLevel,
  })
  try {
    ;(player as any).srcObject = src
  } catch (e) {
    logError('player.srcObject', e)
  }

  // ───────── 이벤트 기반 재생 ─────────
  const onReady = async () => {
    if (state.token !== token) return
    const root = getRoot(player as any)
    if (root) root.style.visibility = ''

    const video = root?.querySelector?.('video') as HTMLVideoElement | null
    try {
      // readyState 확인 후 play
      if (video ? video.readyState >= 3 : true) {
        if (typeof (player as any).play === 'function') {
          await (player as any).play()
        } else {
          await video?.play()
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        logError('player.play', e)
      }
    }
  }

  try {
    ;(player as any).addEventListener?.('canplay', onReady, { once: true })
  } catch (e) {
    logError('addEventListener.canplay', e)
  }
}

function unmountPlayer(): void {
  state.token = null

  const player = state.player
  const container = state.container

  // 내부 <video> 파이프라인만 안전 정지
  try {
    stopHtmlVideo(getRoot(player as any))
  } catch (e) {
    logError('unmount.stopVideo', e)
  }

  // srcObject/src 해제(있을 때만)
  try {
    if (player && 'srcObject' in (player as any))
      (player as any).srcObject = null
    if (player && 'src' in (player as any)) (player as any).src = ''
  } catch (e) {
    logError('unmount.srcReset', e)
  }

  // DOM 정리
  try {
    container && (container.innerHTML = '')
  } catch (e) {
    logError('unmount.container', e)
  }
}

/** ───────────────────────── window 이벤트 진입점 ─────────────────────────

 */
declare global {
  interface WindowEventMap {
    'preview:mount': CustomEvent<PreviewMountParams>
    'preview:unmount': CustomEvent<void>
  }
}

window.addEventListener('preview:mount', (ev) => {
  // 이벤트 진입점은 비동기 오류를 삼켜버리기 쉬우니 안전 처리
  void mountPlayer(ev.detail).catch((e) => logError('event.mount', e))
})

window.addEventListener('preview:unmount', () => {
  try {
    unmountPlayer()
  } catch (e) {
    logError('event.unmount', e)
  }
})

/** ───────────────────────── 선택: RPC 래퍼(호환) ───────────────────────── */
;(window as any).__previewBridge = {
  fetchLiveDetail,
  mountPlayer,
  unmountPlayer,
}
