import type { IChzzkResponse, IMessage } from '@/types'
import type {
  IFollowingListContent,
  ILiveContent,
  IChannelContent,
} from '@/types/follow'
import type { ISettingState } from '@/types/setting'

import { FETCH_FOLLOWING_URL } from '@/constants/endpoint'
import { getSettingState } from '@/stores/settingStore'

console.log('bg loaded')

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
  console.log(followList.content)
  return followList.content
}

// 스트리머 live-status fetch
async function fetchStreamerLiveStatus(hashId: string) {
  const liveStatus = await request<ILiveContent>(
    `https://api.chzzk.naver.com/polling/v3.1/channels/${hashId}/live-status`,
  )
  console.log(liveStatus)
  return liveStatus.content
}

// 스트리머 채널 fetch
async function fetchChannelStatus(hashId: string) {
  const channelStatus = await request<IChannelContent>(
    `https://api.chzzk.naver.com/service/v1/channels/${hashId}`,
  )
  console.log(channelStatus)
  if (channelStatus.content?.channelId === null) return null
  return channelStatus.content
}

// 세팅값 전파
async function setSettingState(rawState: string): Promise<boolean> {
  const newState: ISettingState = JSON.parse(rawState)
  // 모든 탭에 변경사항 브로드캐스트
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'UPDATE_SETTING',
          state: newState,
        })
      }
    })
  })
  return true
}

// 헬퍼 함수들

const messageHandlers: Record<string, (...args: string[]) => Promise<unknown>> =
  {
    fetchFollowList,
    fetchStreamerLiveStatus,
    fetchChannelStatus,
    getSettingState,
    setSettingState,
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
