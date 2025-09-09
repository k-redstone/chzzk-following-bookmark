import type { IChzzkResponse, IMessage } from '@/types'
import type {
  IFollowingListContent,
  ILiveContent,
  IChannelContent,
} from '@/types/follow'
import type { LiveInfo, LivePlayback } from '@/types/preview-bridge'
import type { ISettingState } from '@/types/setting'

import { FETCH_FOLLOWING_URL } from '@/constants/endpoint'
import { getBookmarkState } from '@/stores/bookmarkStore'
import { getSettingState } from '@/stores/settingStore'

type LiveDetailResponse = { code: number; content: LiveInfo }

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
  const followList = await request<IFollowingListContent>(FETCH_FOLLOWING_URL)
  return followList.content
}

// 스트리머 live-status fetch
async function fetchStreamerLiveStatus(hashId: string) {
  const liveStatus = await request<ILiveContent>(
    `https://api.chzzk.naver.com/polling/v3.1/channels/${hashId}/live-status`,
  )
  return liveStatus.content
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

// 세팅값 전파
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

// 헬퍼 함수들

const messageHandlers: Record<string, (...args: string[]) => Promise<unknown>> =
  {
    fetchFollowList,
    fetchStreamerLiveStatus,
    fetchChannelStatus,
    fetchLiveDetail,
    getSettingState,
    setSettingState,
    getBookmarkState,
  }

chrome.runtime.onMessage.addListener(
  (message: unknown, _sender, sendResponse) => {
    const msg = message as IMessage
    const handler = messageHandlers[msg.type]

    if (!handler) throw new RangeError()

    handler(...msg.args)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ error: error.message }))

    return true
  },
)
