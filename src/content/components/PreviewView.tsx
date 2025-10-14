import { useRef, type JSX } from 'react'

import useLightDomHost from '@/content/hooks/useLightDomHost'
import { getPopupSettings } from '@/content/state/PopupSettings'

export interface IPreviewViewProps {
  visible: boolean
  containerId: string
  thumb: string
  uptimeText?: string
  progressPct: number
}

export default function PreviewView({
  visible,
  containerId,
  thumb,
  uptimeText,
  progressPct,
}: IPreviewViewProps): JSX.Element | null {
  const anchorRef = useRef<HTMLDivElement>(null)
  useLightDomHost(
    containerId,
    anchorRef.current,
    visible,
    getPopupSettings().previewWidth,
  )
  if (!visible) return null

  return (
    <div
      ref={anchorRef}
      className="w-50 overflow-hidden rounded-xl bg-black text-white"
    >
      <div className="relative w-full">
        <img
          src={thumb}
          alt="썸네일"
          className="block aspect-video w-full object-cover"
        />
        {uptimeText && (
          <div className="absolute right-3 bottom-2 rounded-md bg-black/60 px-2 py-1 text-[12px] font-semibold">
            {uptimeText}
          </div>
        )}
        <div
          className="absolute bottom-0 left-0 h-[3px] bg-emerald-500"
          style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
        />
      </div>
    </div>
  )
}
