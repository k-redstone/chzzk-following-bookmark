import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import type { BookmarkItem } from '@/types/bookmark'

interface IContextMenuTooltipProps {
  streamer: BookmarkItem
  x: number
  y: number
  open: boolean
  onClose: () => void
  onOpenNewTab: () => void
  onDelete: (s: BookmarkItem) => void
  attachMenuEl: (el: HTMLElement | null) => void
  armInternalDownGuard: () => void
}

export default function ContextMenuTooltip({
  streamer,
  x,
  y,
  open,
  onClose,
  onOpenNewTab,
  onDelete,
  attachMenuEl,
  armInternalDownGuard,
}: IContextMenuTooltipProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number }>({
    left: x,
    top: y,
  })
  const portalTarget = useMemo(() => document.body, [])
  const [isDark, setIsDark] = useState<boolean>(true)
  const [ready, setReady] = useState<boolean>(false)

  useLayoutEffect(() => {
    if (!open) return
    setPos({ left: x, top: y })
    setReady(false)

    requestAnimationFrame(() => {
      const el = menuRef.current
      if (!el) return
      let left = x
      let top = y
      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (left + rect.width > vw) left = Math.max(0, vw - rect.width - 8)
      if (top + rect.height > vh) top = Math.max(0, vh - rect.height - 8)
      setPos({ left, top })
      setReady(true)
      el.focus()
    })
  }, [open, x, y])

  useEffect(() => {
    const root = document.documentElement

    const compute = () => root.classList.contains('theme_dark')
    setIsDark(compute())

    const observer = new MutationObserver(() => {
      setIsDark(compute())
    })

    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    attachMenuEl(menuRef.current)
    return () => attachMenuEl(null)
  }, [attachMenuEl, open])

  useEffect(() => {
    if (!open) return
    const el = menuRef.current
    if (!el) return

    const onPointerDownCapture = (e: PointerEvent) => {
      armInternalDownGuard()
      e.stopPropagation()
    }
    let hoverEl: HTMLElement | null = null
    const setHover = (next: HTMLElement | null) => {
      if (hoverEl === next) return
      if (hoverEl) hoverEl.style.background = 'transparent'
      hoverEl = next
      if (hoverEl) hoverEl.style.background = palette.hover
    }
    const onMouseOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest(
        '[data-action]',
      ) as HTMLElement | null
      setHover(t)
    }
    const onMouseOut = (e: MouseEvent) => {
      const t = (e.relatedTarget as HTMLElement | null)?.closest(
        '[data-action]',
      ) as HTMLElement | null
      if (!t) setHover(null)
    }
    const triggerAction = (ev: Event) => {
      const t = (ev.target as HTMLElement | null)?.closest(
        '[data-action]',
      ) as HTMLElement | null
      if (!t) return
      ev.stopPropagation()
      const a = t.dataset.action
      if (a === 'newtab') onOpenNewTab()
      else if (a === 'delete') onDelete(streamer)
      onClose()
    }

    const onClick = (e: MouseEvent) => triggerAction(e)
    const onMouseUp = (e: MouseEvent) => triggerAction(e)

    el.addEventListener('pointerdown', onPointerDownCapture, true)
    el.addEventListener('mouseover', onMouseOver)
    el.addEventListener('mouseout', onMouseOut)
    el.addEventListener('click', onClick)
    el.addEventListener('mouseup', onMouseUp)

    return () => {
      el.removeEventListener('pointerdown', onPointerDownCapture, true)
      el.removeEventListener('mouseover', onMouseOver)
      el.removeEventListener('mouseout', onMouseOut)
      el.removeEventListener('click', onClick)
      el.removeEventListener('mouseup', onMouseUp)
    }
  }, [open, onOpenNewTab, onDelete, onClose, streamer])

  if (!open) return null

  const palette = isDark
    ? {
        surface: 'rgba(20,20,20,1)',
        text: 'rgba(255,255,255,0.92)',
        textWarn: '#FF7878',
        border: 'rgba(255,255,255,0.08)',
        hover: 'rgba(255,255,255,0.08)',
        divider: 'rgba(255,255,255,0.12)',
        shadow: '0 8px 24px rgba(0,0,0,0.5)',
      }
    : {
        surface: '#FFFFFF',
        text: 'rgba(17,17,17,0.92)',
        textWarn: '#D93A3A',
        border: 'rgba(0,0,0,0.06)',
        hover: 'rgba(0,0,0,0.05)',
        divider: 'rgba(0,0,0,0.10)',
        shadow: '0 8px 24px rgba(0,0,0,0.15)',
      }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 2147483647,
    pointerEvents: 'none',
  }

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: pos.left,
    top: pos.top,
    pointerEvents: 'auto',
    minWidth: 160,
    borderRadius: 12,
    background: palette.surface,
    color: palette.text,
    boxShadow: palette.shadow,
    border: `1px solid ${palette.border}`,
    fontSize: 14,
    lineHeight: '20px',
    userSelect: 'none',
    visibility: ready ? 'visible' : 'hidden',
  }

  const listStyle: React.CSSProperties = {
    margin: 0,
    padding: '4px 0',
    listStyle: 'none',
  }

  const itemBaseStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'default',
  }

  const dividerStyle: React.CSSProperties = {
    height: 1,
    margin: '6px 0',
    background: palette.divider,
  }

  const dangerStyle: React.CSSProperties = {
    color: palette.textWarn,
  }

  return createPortal(
    <div style={overlayStyle}>
      <div
        ref={menuRef}
        style={menuStyle}
        tabIndex={-1}
      >
        <ul style={listStyle}>
          <li
            data-action="newtab"
            style={itemBaseStyle}
            tabIndex={0}
          >
            새 탭에서 열기
          </li>

          <div style={dividerStyle} />

          <li
            data-action="delete"
            style={{ ...itemBaseStyle, ...dangerStyle }}
            tabIndex={0}
          >
            삭제하기
          </li>
        </ul>
      </div>
    </div>,
    portalTarget,
  )
}
