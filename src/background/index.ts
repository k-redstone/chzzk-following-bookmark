import type { IChzzkResponse, IMessage } from '@/types'
import type {
  IFollowingListContent,
  ILiveContent,
  IChannelContent,
} from '@/types/follow'
import type { LiveInfo, LivePlayback } from '@/types/preview-bridge'
import type { ISettingState } from '@/types/setting'
import type { OpenTabErr, OpenTabResp } from '@/utils/openTab'

import { FETCH_FOLLOWING_URL } from '@/constants/endpoint'
import { getBookmarkState } from '@/stores/bookmarkStore'
import { getSettingState } from '@/stores/settingStore'
import { mapWithConcurrency } from '@/utils/liveStatus'

// ---------------------------------------------
// Types
// ---------------------------------------------

type LiveDetailResponse = { code: number; content: LiveInfo }
type TOpenTabMsg = {
  type: 'OPEN_TAB'
  url: string
  active?: boolean
  nextToCurrent?: boolean
}

// ---------------------------------------------
// Fetch helpers
// ---------------------------------------------

async function request<T>(path: string): Promise<IChzzkResponse<T>> {
  const url = new URL(path)

  const request = new Request(url, {
    cache: 'no-cache',
  })

  const response = await fetch(request)

  if (response.ok) {
    return response.json()
  }

  throw new Error(`${response.status}: ${response.statusText}`)
}

// 치지직 API

// 팔로우 목록 fetch
async function fetchFollowList() {
  const PAGE_SIZE = 505
  const CONCURRENCY = 4

  const fetchPage = async (page: number): Promise<IFollowingListContent> => {
    const url = new URL(FETCH_FOLLOWING_URL)
    url.searchParams.set('page', String(page))
    url.searchParams.set('size', String(PAGE_SIZE))
    url.searchParams.set('sortType', 'FOLLOW')
    const res = await request<IFollowingListContent>(url.toString())
    return (
      res?.content ?? {
        totalCount: 0,
        totalPage: 0,
        followingList: [],
      }
    )
  }

  const first = await fetchPage(0)
  const items = [...first.followingList]

  const totalCount = first.totalCount ?? items.length
  const totalPages =
    first.totalPage && first.totalPage > 0
      ? first.totalPage
      : Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  if (totalPages <= 1) {
    return Array.from(new Map(items.map((i) => [i.channelId, i])).values())
  }

  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 1)

  const chunk = <T>(arr: T[], n: number): T[][] => {
    const out: T[][] = []
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
    return out
  }

  for (const pages of chunk(remainingPages, CONCURRENCY)) {
    const results = await Promise.all(pages.map((p) => fetchPage(p)))
    for (const r of results) items.push(...r.followingList)
  }

  const deduped = Array.from(
    new Map(items.map((i) => [i.channelId, i])).values(),
  )

  return deduped.slice(0, totalCount || deduped.length)
}

// 스트리머 live-status fetch
async function fetchStreamerLiveStatus(hashId: string) {
  const liveStatus = await request<ILiveContent>(
    `https://api.chzzk.naver.com/polling/v3.1/channels/${hashId}/live-status`,
  )
  return liveStatus.content
}

// 스트리머 live-status batch fetch
async function fetchStreamerLiveStatusBatch(
  ids: string[],
  concurrency?: number,
) {
  if (!ids.length) return { ok: true, items: [], failedIds: [] }

  const results = await mapWithConcurrency(
    ids,
    async (id) => {
      try {
        const item = await fetchStreamerLiveStatus(id)
        return { id, item }
      } catch {
        return { id, item: null }
      }
    },
    concurrency,
  )

  const items = results
    .filter((r) => r.item)
    .map((r) => ({ id: r.id, ...(r.item as ILiveContent) }))

  const okSet = new Set(
    items.map((i) => (i.channelId ? String(i.channelId) : i.id)),
  )
  const failedIds = results
    .filter((r) => !r.item)
    .map((r) => r.id)
    .filter((id) => !okSet.has(id))

  return { ok: true, items, failedIds }
}

// 스트리머 채널 fetch
async function fetchChannelStatus(hashId: string) {
  const channelStatus = await request<IChannelContent>(
    `https://api.chzzk.naver.com/service/v1/channels/${hashId}`,
  )
  if (channelStatus.content?.channelId === null) return null
  return channelStatus.content
}

// 라이브 디테일 fetch
async function fetchLiveDetail(uid: string): Promise<LiveInfo> {
  const r = await fetch(
    `https://api.chzzk.naver.com/service/v3.2/channels/${uid}/live-detail`,
    { credentials: 'include', cache: 'no-cache' },
  )
  if (!r.ok) throw new Error(`live-detail fetch failed: ${r.status}`)

  const j: unknown = await r.json()
  if (!j || typeof j !== 'object' || !('code' in j)) {
    throw new Error('invalid live-detail response')
  }

  const res = j as LiveDetailResponse
  if (res.code !== 200) throw new Error(`live-detail code != 200: ${res.code}`)

  const info = res.content
  const raw = (res.content as Record<string, unknown>)['livePlaybackJson']
  if (!info.livePlayback && typeof raw === 'string') {
    try {
      info.livePlayback = JSON.parse(raw) as LivePlayback
    } catch {
      /* ignore */
    }
  }
  return info
}

// ---------------------------------------------
// Settings broadcast
// ---------------------------------------------

async function setSettingState(rawState: string): Promise<boolean> {
  const newState: ISettingState = JSON.parse(rawState)
  // 모든 탭에 변경사항 브로드캐스트

  const tabs = await chrome.tabs.query({
    url: ['https://chzzk.naver.com/*'],
  })
  for (const tab of tabs) {
    if (tab.id !== undefined) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'UPDATE_SETTING',
        state: newState,
      })
    }
  }
  return true
}

// ---------------------------------------------
// Tab creation (Chrome 전용)
// ---------------------------------------------

function resolveToAbsolute(
  raw: string,
  sender: chrome.runtime.MessageSender,
): string {
  const base =
    typeof sender.tab?.url === 'string'
      ? sender.tab.url
      : 'https://chzzk.naver.com/'
  try {
    return new URL(raw, base).toString()
  } catch {
    return raw
  }
}

function createTabChrome(
  msg: TOpenTabMsg,
  cb: (resp: OpenTabResp) => void,
): void {
  const opts: chrome.tabs.CreateProperties = {
    url: msg.url,
    active: Boolean(msg.active),
  }
  const finish = (tab?: chrome.tabs.Tab) => {
    const tabId = typeof tab?.id === 'number' ? tab.id : null
    cb({ ok: true, tabId })
  }

  if (msg.nextToCurrent) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const idx = tabs[0]?.index
      if (typeof idx === 'number') opts.index = idx + 1
      chrome.tabs.create(opts, finish)
    })
  } else {
    chrome.tabs.create(opts, finish)
  }
}

// ---------------------------------------------
// Message router
// ---------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const messageHandlers: Record<string, (...args: any[]) => Promise<unknown>> = {
  fetchFollowList,
  fetchStreamerLiveStatus,
  fetchStreamerLiveStatusBatch,
  fetchChannelStatus,
  fetchLiveDetail,
  getSettingState,
  setSettingState,
  getBookmarkState,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isOpenTabMsg(value: unknown): value is TOpenTabMsg {
  if (!isRecord(value)) return false
  return (
    value.type === 'OPEN_TAB' &&
    typeof value.url === 'string' &&
    (value.active === undefined || typeof value.active === 'boolean') &&
    (value.nextToCurrent === undefined ||
      typeof value.nextToCurrent === 'boolean')
  )
}

function isIMessageLike(value: unknown): value is IMessage {
  if (!isRecord(value)) return false
  const typeOk = typeof (value as { type?: unknown }).type === 'string'
  const argsOk = Array.isArray((value as { args?: unknown }).args)
  return typeOk && argsOk
}

chrome.runtime.onMessage.addListener(
  (message: unknown, sender, sendResponse) => {
    if (isOpenTabMsg(message)) {
      try {
        const absoluteUrl = resolveToAbsolute(message.url, sender)
        const fixed: TOpenTabMsg = { ...message, url: absoluteUrl }
        createTabChrome(fixed, (resp) => sendResponse(resp))
        return true
      } catch (e) {
        const err: OpenTabErr = {
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        }
        sendResponse(err)
        return false
      }
    }

    if (isIMessageLike(message)) {
      const msg = message as IMessage
      const handler = messageHandlers[msg.type]
      if (!handler) throw new RangeError()

      handler(...msg.args)
        .then((result) => sendResponse(result))
        .catch((error: unknown) => {
          const errObj = {
            error: error instanceof Error ? error.message : String(error),
          }
          sendResponse(errObj)
        })

      return true
    }
    return false
  },
)
