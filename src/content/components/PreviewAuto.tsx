import { useEffect, useRef } from 'react'

import PreviewView from '@/content/components/PreviewView'
import { usePreview } from '@/content/hooks/usePreview'

type InlinePreviewOptions = {
  delayMs?: number
  volume?: number
  maxLevel?: number
}

type Props = {
  hashId: string
  opts?: InlinePreviewOptions
}

export default function PreviewAuto({ hashId, opts }: Props) {
  const { show, hide, viewProps } = usePreview(opts)
  const started = useRef(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (started.current) return
      started.current = true
      void show(hashId)
    })
    return () => {
      cancelAnimationFrame(raf)
      hide()
      started.current = false
    }
  }, [hashId, show, hide])

  return <PreviewView {...viewProps} />
}
