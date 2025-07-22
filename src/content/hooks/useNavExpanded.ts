import { useEffect, useState } from 'react'

import {
  ASIDE_CONTAINER_EXPANDED_CLASS,
  ASIDE_CONTAINER_CLASS,
} from '@/constants/chzzkEl'

export default function useNavExpanded(
  targetClass = ASIDE_CONTAINER_CLASS,
  expandedClass = ASIDE_CONTAINER_EXPANDED_CLASS,
) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  useEffect(() => {
    const nav = document.querySelector(`.${targetClass}`)
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
  }, [targetClass, expandedClass])

  return isExpanded
}
