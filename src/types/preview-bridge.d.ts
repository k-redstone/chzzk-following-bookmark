export {}

export type Milliseconds = number

export interface LivePlaybackThumbnail {
  snapshotThumbnailTemplate?: string
}

export interface LivePlayback {
  media?: Array<{
    mediaId: 'HLS' | 'LLHLS'
    protocol: 'HLS'
    path: string // master m3u8
  }>
  thumbnail?: LivePlaybackThumbnail
}

export interface LiveInfo {
  liveImageUrl?: string
  adult?: boolean
  openDate?: string
  livePlayback?: LivePlayback
}

export interface PreviewBridge {
  fetchLiveDetail(uid: string): Promise<LiveInfo>
}

declare global {
  interface Window {
    __previewBridge?: PreviewBridge
  }
}
