type ChannelId = string

type DateTimeString = string

export interface IChannelBase {
  channelId: ChannelId
  channelName: string
  channelImageUrl: string
  verifiedMark: boolean
  activatedChannelBadgeIds: string[]
}

// 팔로우 정보
export interface IFollowingInfo {
  following: boolean
  notification: boolean
  followDate: DateTimeString
}

// 개인화 데이터
export interface IPersonalData {
  following: FollowingInfo
  privateUserBlock: boolean
}

// 채널 상세 정보
export interface IChannel extends IChannelBase {
  personalData: IPersonalData
}

// 스트리머 상태
export interface IStreamerStatus {
  openLive: boolean
}

// 방송 상태 정보
export interface ILiveInfo {
  liveTitle: string | null
  concurrentUserCount: number
  liveCategoryValue: string
}

// 팔로잉 목록 아이템
export interface IFollowingItem {
  channelId: ChannelId
  channel: IChannel
  streamer: IStreamerStatus
  liveInfo: ILiveInfo
}

// 서버 Response
export interface IFollowingListContent {
  totalCount: number
  totalPage: number
  followingList: IFollowingItem[]
}

// livestatus
export interface ILiveContent {
  channelId: string
  liveTitle: string
  status: 'OPEN' | 'CLOSE'
  concurrentUserCount: number
  liveCategoryValue: string
}

export interface IChannelContent {
  channelId: string
  channelName: string
  channelImageUrl: string
}
