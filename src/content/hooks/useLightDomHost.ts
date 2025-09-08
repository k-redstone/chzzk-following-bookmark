import { useEffect } from 'react'

export default function useLightDomHost(
  containerId: string,
  anchorEl: HTMLElement | null,
  active: boolean,
) {
  useEffect(() => {
    if (!containerId || !anchorEl || !active) return

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
      el.style.contain = 'layout paint size style'
      document.body.appendChild(el)
      appended = true
    }

    let raf = 0
    let last = 0
    const sync = (t: number) => {
      if (t - last >= 33) {
        last = t
        const r = anchorEl.getBoundingClientRect()
        el.style.left = `${Math.round(r.left)}px`
        el.style.top = `${Math.round(r.top)}px`
      }
      raf = requestAnimationFrame(sync)
    }
    raf = requestAnimationFrame(sync)

    return () => {
      cancelAnimationFrame(raf)
      if (appended) el!.remove()
    }
  }, [containerId, anchorEl, active])
}
