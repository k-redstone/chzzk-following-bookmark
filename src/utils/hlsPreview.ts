import Hls from 'hls.js'

import type { LivePlayback } from '@/types/preview-bridge'

interface MountHlsPreviewParams {
  container: HTMLElement
  livePlayback: LivePlayback
  volume: number
  token: string
}

let currentHls: Hls | null = null
let currentToken: string | null = null

function pickHlsUrl(livePlayback: LivePlayback): string | null {
  const media = livePlayback.media ?? []
  const target =
    media.find((m) => m.mediaId === 'LLHLS') ??
    media.find((m) => m.mediaId === 'HLS') ??
    media[0]
  return target?.path ?? null
}

function destroyCurrent(): void {
  if (currentHls) {
    try {
      currentHls.destroy()
    } catch {
      /* ignore */
    }
    currentHls = null
  }
}

export function unmountHlsPreview(): void {
  currentToken = null
  destroyCurrent()
}

export function mountHlsPreview({
  container,
  livePlayback,
  volume,
  token,
}: MountHlsPreviewParams): void {
  destroyCurrent()
  currentToken = token

  const url = pickHlsUrl(livePlayback)
  if (!url) return

  const vol = Math.min(1, Math.max(0, volume / 100))

  container.innerHTML = ''
  const video = document.createElement('video')
  video.autoplay = true
  video.playsInline = true
  video.muted = vol === 0
  video.volume = vol
  video.style.width = '100%'
  video.style.height = '100%'
  video.style.objectFit = 'cover'
  container.appendChild(video)

  if (Hls.isSupported()) {
    const hls = new Hls({ capLevelToPlayerSize: true })
    currentHls = hls
    hls.loadSource(url)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (currentToken !== token) return
      void video.play().catch(() => {})
    })
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal && currentHls === hls) destroyCurrent()
    })
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    void video.play().catch(() => {})
  }
}
