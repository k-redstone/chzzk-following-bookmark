import { useEffect, useState } from 'react'

import { NAV_TARGET_CLASS, NAV_TARGET_ID } from '@/constants/chzzkEl'

export default function useNavExpanded(
  targetId = NAV_TARGET_ID,
  expandedClass = NAV_TARGET_CLASS,
) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  useEffect(() => {
    const nav = document.getElementById(targetId)
    if (!nav) return

    setIsExpanded(nav.classList.contains(expandedClass))

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          setIsExpanded(nav.classList.contains(expandedClass))
        }
      }
    })

    observer.observe(nav, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [targetId, expandedClass])

  return isExpanded
}
