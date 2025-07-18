import { useCallback } from 'react'

import {
  HEADER_SECTION_CLASS,
  HEADER_SHOW_TOOLTIP_CLASS,
} from '@/constants/chzzkEl'

export default function useShowTooltip() {
  const show = useCallback(() => {
    const target = document.querySelector(`.${HEADER_SECTION_CLASS}`)
    if (target) target.classList.add(HEADER_SHOW_TOOLTIP_CLASS)
  }, [])

  const hide = useCallback(() => {
    const target = document.querySelector(`.${HEADER_SECTION_CLASS}`)
    if (target) target.classList.remove(HEADER_SHOW_TOOLTIP_CLASS)
  }, [])

  return { show, hide }
}
