import { useEffect } from 'react'

export default function useClickAway<T extends HTMLElement | null>(
  ref: React.RefObject<T>,
  onAway: () => void,
) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onAway()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onAway])
}
