import { useEffect } from 'react'

export default function useLightDomHost(
  containerId: string,
  anchorEl: HTMLElement | null,
) {
  useEffect(() => {
    if (!containerId || !anchorEl) return
    let el = document.getElementById(containerId) as HTMLDivElement | null
    let appended = false
    if (!el) {
      el = document.createElement('div')
      el.id = containerId
      el.style.position = 'fixed'
      el.style.zIndex = '2147483647'
      el.style.pointerEvents = 'none'
      el.style.width = '380px'
      el.style.height = '214px'
      document.body.appendChild(el)
      appended = true
    } else {
      // 기존 엘리먼트가 있으면 사이즈만 강제
      el.style.position = 'fixed'
      el.style.width = '380px'
      el.style.height = '214px'
      el.style.zIndex = '2147483647'
      el.style.pointerEvents = 'none'
    }

    let raf = 0
    const sync = () => {
      if (!anchorEl || !el) return
      const r = anchorEl.getBoundingClientRect()
      // fixed 좌표이므로 scroll 보정 없음
      el.style.left = `${Math.round(r.left)}px`
      el.style.top = `${Math.round(r.top)}px`
      raf = requestAnimationFrame(sync)
    }
    raf = requestAnimationFrame(sync)

    return () => {
      cancelAnimationFrame(raf)
      if (appended) el!.remove()
    }
  }, [containerId, anchorEl])
}
