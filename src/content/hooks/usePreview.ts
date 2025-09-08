import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import type { IPreviewViewProps } from '@/content/components/PreviewView'
import type { LiveInfo } from '@/types/preview-bridge'

import { ensurePageBridgeInjected } from '@/bridge/ensurePageBridgeInjected'
import {
  subscribePreviewSettings,
  getPreviewSettings,
} from '@/content/state/previewSettings'

type Milliseconds = number

function formatTS(ms: Milliseconds): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

function thumbFrom(
  info: LiveInfo,
  type: 144 | 270 | 360 | 480 | 720 | 1080 = 480,
): string {
  const src =
    info.liveImageUrl || info.livePlayback?.thumbnail?.snapshotThumbnailTemplate

  return String(src).replace('{type}', String(type))
}

export type InlinePreviewOptions = {
  delayMs?: Milliseconds // 기본 600
  volume?: number // 기본 0 (mute)
  maxLevel?: number // 기본 480
}

export function usePreview(opts?: InlinePreviewOptions) {
  const cfg = {
    delayMs: 600 as Milliseconds,
    volume: 0,
    maxLevel: 480,
    ...opts,
  }

  const [enabled, setEnabled] = useState<boolean>(
    getPreviewSettings().previewEnabled,
  )
  const [visible, setVisible] = useState<boolean>(false)
  const [thumb, setThumb] = useState<string>('')
  const [uptimeText, setUptimeText] = useState<string | undefined>(undefined)
  const [progressPct, setProgressPct] = useState<number>(0)

  const rid = useId().replace(/:/g, '_')
  const containerId = `inline_preview_host_${rid}`

  const timers = useRef<{
    raf?: number
    delay?: number
    uptime?: number
    token?: string | null
  }>({ token: null })

  // 설정 구독
  useEffect(() => {
    const unsub = subscribePreviewSettings((s) => setEnabled(s.previewEnabled))
    return () => unsub()
  }, [])

  // page-bridge 주입 + 언마운트 정리
  useEffect(() => {
    ensurePageBridgeInjected()

    return () => {
      if (timers.current.raf) cancelAnimationFrame(timers.current.raf)
      if (timers.current.delay) clearTimeout(timers.current.delay)
      if (timers.current.uptime) clearInterval(timers.current.uptime)
      timers.current.token = null
      window.dispatchEvent(new CustomEvent('preview:unmount'))
      setVisible(false)
      setProgressPct(0)
      setUptimeText(undefined)
    }
  }, [])

  const hide = useCallback(() => {
    if (timers.current.raf) cancelAnimationFrame(timers.current.raf)
    if (timers.current.delay) clearTimeout(timers.current.delay)
    if (timers.current.uptime) clearInterval(timers.current.uptime)
    timers.current.token = null
    window.dispatchEvent(new CustomEvent('preview:unmount'))
    setVisible(false)
    setProgressPct(0)
    setUptimeText(undefined)
  }, [])

  const show = useCallback(
    async (uid: string) => {
      if (!enabled) return
      const bridge = window.__previewBridge
      if (!bridge) return

      let info: LiveInfo
      try {
        info = await bridge.fetchLiveDetail(uid)
      } catch {
        return
      }
      setVisible(true)
      setThumb(thumbFrom(info, 480))

      if (info.openDate) {
        const openMs: Milliseconds = new Date(`${info.openDate}+0900`).getTime()
        setUptimeText(formatTS(Date.now() - openMs))
        timers.current.uptime = window.setInterval(() => {
          setUptimeText(formatTS(Date.now() - openMs))
        }, 1000)
      }

      const start: Milliseconds = performance.now()
      const delay: Milliseconds = cfg.delayMs
      const token = `${uid}_${Date.now()}`
      timers.current.token = token

      const tick = (t: number): void => {
        const p = Math.min(1, (t - start) / delay)
        setProgressPct(p * 100)
        if (p < 1 && timers.current.token === token) {
          timers.current.raf = requestAnimationFrame(tick)
        }
      }
      timers.current.raf = requestAnimationFrame(tick)

      timers.current.delay = window.setTimeout(async () => {
        if (timers.current.token !== token) return
        if (!info.livePlayback) return

        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        )

        try {
          window.dispatchEvent(
            new CustomEvent('preview:mount', {
              detail: {
                containerId,
                livePlayback: info.livePlayback,
                volume: cfg.volume,
                maxLevel: cfg.maxLevel,
                token,
              },
            }),
          )
          setProgressPct(100)
        } catch {
          // 썸네일만 유지
        }
      }, delay)
    },
    [cfg.delayMs, cfg.maxLevel, cfg.volume, enabled, containerId],
  )

  const viewProps: IPreviewViewProps = useMemo(
    () => ({ visible, containerId, thumb, progressPct, uptimeText }),
    [visible, containerId, thumb, progressPct, uptimeText],
  )

  return { show, hide, enabled, viewProps }
}
