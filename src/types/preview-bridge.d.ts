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

export type OpaqueLiveSource = { readonly __brand: 'LiveSource' }

export interface CorePlayer {
  muted: boolean
  volume: number
  readyState: number
  readonly shadowRoot: HTMLElement
  srcObject: OpaqueLiveSource | undefined
  play(): Promise<void>
  pause(): void
  destroy(): void
  addEventListener?(
    type: 'loadedmetadata',
    listener: () => void,
    options?: AddEventListenerOptions,
  ): void
  removeEventListener?: (
    type: string,
    listener: (...args: unknown[]) => void,
    options?: AddEventListenerOptions,
  ) => void
}

export interface LiveProvider {
  fromJSON(
    json: LivePlayback,
    opts: {
      devt: 'HTML5_PC'
      serviceId: number
      countryCode: string
      p2pDisabled: boolean
      maxLevel: number
    },
  ): OpaqueLiveSource
}

export interface PlayerNamespace {
  CorePlayer: new () => CorePlayer
  LiveProvider: LiveProvider
}

export interface PreviewMountParams {
  containerId: string
  livePlayback: LivePlayback
  volume: number
  maxLevel?: number
  token: string
}

export interface PreviewBridge {
  fetchLiveDetail(uid: string): Promise<LiveInfo>
  mountPlayer(params: PreviewMountParams): Promise<void>
  unmountPlayer(): void
}

declare global {
  interface Window {
    __previewBridge?: PreviewBridge
  }
}
