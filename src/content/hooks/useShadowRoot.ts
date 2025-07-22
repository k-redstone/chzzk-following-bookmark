import { useMemo } from 'react'

import { SHADOW_HOST_ID } from '@/constants'

export function useShadowRoot(): ShadowRoot | null {
  return useMemo(() => {
    const host = document.getElementById(SHADOW_HOST_ID)
    return host?.shadowRoot ?? null
  }, [])
}
