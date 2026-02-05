import styles from '../index.css?inline'

import { SHADOW_HOST_ID } from '@/constants'
import { createShadowRoot } from '@/utils/createShadowRoot'
import { syncDarkModeWithHost } from '@/utils/syncDarkModeWithHost'

const OVERLAY_HOST_ID = `${SHADOW_HOST_ID}__overlay`

export function ensureOverlayHost() {
  if (document.getElementById(OVERLAY_HOST_ID)) return

  const { wrapper } = createShadowRoot({
    hostId: OVERLAY_HOST_ID,
    hostTag: 'div',
    styles: [styles],
    mountTo: document.body,
    hostStyle: {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      pointerEvents: 'none',
    },
  })

  wrapper.style.pointerEvents = 'auto'

  syncDarkModeWithHost(wrapper)
  ;(
    window as unknown as { __MY_EXT_OVERLAY_MOUNT?: HTMLElement }
  ).__MY_EXT_OVERLAY_MOUNT = wrapper
}
