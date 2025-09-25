import { useCallback, useEffect, useRef, useState } from 'react'

import type { BookmarkItem } from '@/types/bookmark'

import { openContextMenu, closeContextMenu } from '@/content/bus/contextMenuBus'

export type IRightClickMenuPayload = {
  x: number
  y: number
  streamer: BookmarkItem
  inFolder: boolean
  isNavExpanded: boolean
}

export default function useRightClickMenu() {
  const [open, setOpen] = useState(false)
  const [payload, setPayload] = useState<IRightClickMenuPayload | null>(null)
  const menuElRef = useRef<HTMLElement | null>(null)
  const ignoreUntil = useRef<number>(0)

  const attachMenuEl = useCallback((el: HTMLElement | null) => {
    menuElRef.current = el
  }, [])

  const armInternalDownGuard = useCallback(() => {
    ignoreUntil.current = performance.now() + 80
  }, [])

  const show = useCallback((p: IRightClickMenuPayload) => {
    setPayload(p)
    setOpen(true)
    ignoreUntil.current = performance.now() + 30
    openContextMenu(p.streamer.hashId)
  }, [])

  const hide = useCallback(() => {
    setOpen(false)
    setPayload(null)
    closeContextMenu()
  }, [])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent | MouseEvent) => {
      if (performance.now() < ignoreUntil.current) return
      const target = e.target as Node | null
      const menuEl = menuElRef.current
      if (menuEl && target && menuEl.contains(target)) return
      hide()
    }

    const onWheel = () => hide()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide()
    }
    const onScroll = () => hide()
    const onContextMenu = (e: MouseEvent) => {
      const target = e.target as Node | null
      const menuEl = menuElRef.current
      if (menuEl && target && menuEl.contains(target)) return
      hide()
    }

    window.addEventListener('mousedown', onPointerDown, true)
    window.addEventListener('wheel', onWheel, { passive: true, capture: true })
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('contextmenu', onContextMenu, true)

    return () => {
      window.removeEventListener('mousedown', onPointerDown, true)
      window.removeEventListener('wheel', onWheel, true)
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('contextmenu', onContextMenu, true)
    }
  }, [open, hide])

  return { open, payload, show, hide, attachMenuEl, armInternalDownGuard }
}
