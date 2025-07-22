import { useCallback } from 'react'

import {
  ASIDE_CONTENT_TARGET_CLASS,
  ASIDE_SHOW_TOOLTIP_CLASS,
} from '@/constants/chzzkEl'

export default function useShowTooltip() {
  const show = useCallback(() => {
    const target = document.querySelector(`.${ASIDE_CONTENT_TARGET_CLASS}`)
    if (target) target.classList.add(ASIDE_SHOW_TOOLTIP_CLASS)
  }, [])

  const hide = useCallback(() => {
    const target = document.querySelector(`.${ASIDE_CONTENT_TARGET_CLASS}`)
    if (target) target.classList.remove(ASIDE_SHOW_TOOLTIP_CLASS)
  }, [])

  return { show, hide }
}
