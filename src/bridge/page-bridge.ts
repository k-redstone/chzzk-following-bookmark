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

const LOG_PREFIX = '[preview-bridge]'

function reportError(
  where: string,
  err: unknown,
  extra?: Record<string, unknown>,
) {
  try {
    const payload = {
      where,
      message: err instanceof Error ? err.message : String(err),
      name: err instanceof Error ? err.name : undefined,
      extra,
    }
    console.error(LOG_PREFIX, payload)
  } catch {
    // ignore Logging
  }
}

type LiveDetailResponse = { code: number; content: LiveInfo }

function isPlayerNamespace(ns: unknown): ns is PlayerNamespace {
  if (!ns || typeof ns !== 'object') return false
  const obj = ns as Record<string, unknown>
  const cp = obj['CorePlayer']
  const lp = obj['LiveProvider']
  const fromJSON = (lp as Record<string, unknown> | undefined)?.['fromJSON']
  return typeof cp === 'function' && typeof fromJSON === 'function'
}

async function resolvePlayerNamespace(): Promise<PlayerNamespace> {
  const __r: WebpackRequireFn = await getWebpackRequire()
  const ids = Object.keys(__r.m) as Array<WebpackModuleId>
  const candidates = ids.filter((id) => {
    try {
      const src = __r.m[id].toString()
      return src.includes('CorePlayer') || src.includes('LiveProvider.fromJSON')
    } catch {
      return false
    }
  })

  for (const id of candidates) {
    const mod = __r(id)

    if (isPlayerNamespace(mod)) return mod
  }
  throw new Error('Player namespace not found')
}

async function fetchLiveDetail(uid: string): Promise<LiveInfo> {
  const r = await fetch(
    `https://api.chzzk.naver.com/service/v3.2/channels/${uid}/live-detail`,
    { credentials: 'include' },
  )
  if (!r.ok) throw new Error('live-detail fetch failed')
  const j: unknown = await r.json()

  if (!j || typeof j !== 'object' || !('code' in j)) {
    throw new Error('invalid live-detail response')
  }
  const res = j as LiveDetailResponse
  if (res.code !== 200) throw new Error('live-detail code != 200')

  const info = res.content
  if (
    !info.livePlayback &&
    'livePlaybackJson' in (res.content as Record<string, unknown>)
  ) {
    const raw = (res.content as Record<string, unknown>).livePlaybackJson
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as LivePlayback
        info.livePlayback = parsed
      } catch {
        // ignore parse error
      }
    }
  }
  return info
}

let mounted: {
  player: any | null
  container: HTMLElement | null
  token: string | null
  cleanup: Array<() => void>
} = { player: null, container: null, token: null, cleanup: [] }

function callIf(obj: any, name: string) {
  const fn = obj?.[name]
  if (typeof fn === 'function') {
    try {
      fn.call(obj)
    } catch (e) {
      reportError(`callIf:${name}`, e)
    }
  }
}

async function mountPlayer(params: PreviewMountParams): Promise<void> {
  const { containerId, livePlayback, volume, maxLevel = 480, token } = params

  const ns = await resolvePlayerNamespace()
  const container = document.getElementById(containerId)
  if (!container) throw new Error('container not found')

  if (mounted.cleanup?.length) {
    mounted.cleanup.forEach((fn) => fn())
  }
  mounted = { player: null, container: null, token: null, cleanup: [] }

  mounted.container = container
  mounted.token = token

  const previewPlayer = new ns.CorePlayer()
  container.innerHTML = ''
  container.appendChild(previewPlayer.shadowRoot)
  previewPlayer.muted = true
  previewPlayer.volume = volume
  previewPlayer.shadowRoot.style.visibility = 'hidden'

  const src = ns.LiveProvider.fromJSON(livePlayback, {
    devt: 'HTML5_PC',
    serviceId: 2099,
    countryCode: 'kr',
    p2pDisabled: true,
    maxLevel,
  })

  const onReady = async () => {
    if (mounted.token !== token) return
    try {
      if (previewPlayer.shadowRoot?.style)
        previewPlayer.shadowRoot.style.visibility = ''
    } catch {
      // ignore
    }
    try {
      if (typeof previewPlayer.play === 'function') await previewPlayer.play()
      else previewPlayer.shadowRoot?.querySelector?.('video')?.play?.()
    } catch {
      // ignore
    }
  }

  try {
    previewPlayer.addEventListener?.('loadedmetadata', onReady, { once: true })
  } catch (e) {
    reportError(`loadedmetadata`, e)
  }

  previewPlayer.srcObject = src

  requestAnimationFrame(() => onReady())

  mounted.cleanup.push(
    () => {
      try {
        previewPlayer.removeEventListener?.('loadedmetadata', onReady)
      } catch (e) {
        reportError(`loadedmetadata`, e)
      }
    },
    () => {
      try {
        previewPlayer.removeEventListener?.('canplay', onReady)
      } catch (e) {
        reportError(`remove canplay`, e)
      }
    },
    () => {
      try {
        if ('src' in previewPlayer) previewPlayer.src = ''
      } catch (e) {
        reportError(`init src`, e)
      }
    },
    () => {
      callIf(previewPlayer, 'pause')
    },
    () => {
      callIf(previewPlayer, 'stop')
    },
    () => {
      callIf(previewPlayer, 'destroy')
    },
    () => {
      callIf(previewPlayer, 'dispose')
    },
    () => {
      callIf(previewPlayer, 'unload')
    },
    () => {
      try {
        if (mounted.container) mounted.container.innerHTML = ''
      } catch (e) {
        reportError(`init container`, e)
      }
    },
  )
  mounted.player = previewPlayer
}

function unmountPlayer(): void {
  const fns = mounted.cleanup || []
  for (const fn of fns) {
    try {
      fn()
    } catch (e) {
      reportError(`unmount Error`, e)
    }
  }
  mounted = { player: null, container: null, token: null, cleanup: [] }
}

;(window as any).__previewBridge = {
  fetchLiveDetail,
  mountPlayer,
  unmountPlayer,
}

// ===== RPC listener (content → page) =====
type PreviewRPCRequest =
  | {
      __previewRPC: true
      id: string
      method: 'fetchLiveDetail'
      args: [string]
    }
  | {
      __previewRPC: true
      id: string
      method: 'mountPlayer'
      args: [PreviewMountParams]
    }
  | { __previewRPC: true; id: string; method: 'unmountPlayer'; args: [] }

type PreviewRPCResponse =
  | { __previewRPC: true; id: string; ok: true; result: unknown }
  | { __previewRPC: true; id: string; ok: false; error: string }

const api = { fetchLiveDetail, mountPlayer, unmountPlayer } as const

window.addEventListener('message', async (ev: MessageEvent) => {
  const data = ev.data as PreviewRPCRequest | undefined
  if (!data || (data as any).__previewRPC !== true) return
  if (ev.source !== window) return

  const { id, method, args } = data
  try {
    if (!(method in api)) throw new Error('unknown method')
    // @ts-expect-error 좁은 union
    const result = await api[method](...(args ?? []))
    const res: PreviewRPCResponse = { __previewRPC: true, id, ok: true, result }
    window.postMessage(res, '*')
  } catch (e) {
    const res: PreviewRPCResponse = {
      __previewRPC: true,
      id,
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    }
    window.postMessage(res, '*')
  }
})
