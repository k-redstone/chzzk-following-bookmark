import { useEffect } from 'react'

export default function useLightDomHost(
  containerId: string,
  anchorEl: HTMLElement | null,
  active: boolean,
  width?: number,
) {
  useEffect(() => {
    if (!containerId || !anchorEl || !active) return

    const getOrCreateHost = (id: string): HTMLDivElement => {
      const found = document.getElementById(id)
      if (found instanceof HTMLDivElement) return found

      const el = document.createElement('div')
      el.id = id
      el.style.position = 'fixed'
      el.style.zIndex = '2147483647'
      el.style.pointerEvents = 'none'
      document.body.appendChild(el)
      return el
    }

    const host = getOrCreateHost(containerId)
    const style = host.style

    // 16:9 유지
    const w = typeof width === 'number' ? width : 380
    style.width = `${w}px`

    const supportsAspect =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('aspect-ratio', '16/9')

    if (supportsAspect) {
      style.setProperty('aspect-ratio', '16 / 9')
      style.removeProperty('height')
    } else {
      style.removeProperty('aspect-ratio')
      style.height = `${Math.round((w * 9) / 16)}px`
    }

    // rAF 루프로 위치 동기화 (33ms ≈ 30fps)
    let raf = 0
    let last = 0
    const sync = (t: number) => {
      if (t - last >= 33) {
        last = t
        const r = anchorEl.getBoundingClientRect()
        host.style.left = `${Math.round(r.left)}px`
        host.style.top = `${Math.round(r.top)}px`
      }
      raf = requestAnimationFrame(sync)
    }
    raf = requestAnimationFrame(sync)

    return () => {
      cancelAnimationFrame(raf)
      host.remove()
    }
  }, [containerId, anchorEl, active, width])
}
