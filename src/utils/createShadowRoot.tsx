import { SHADOW_HOST_ID } from '../constants'
import { NAV_WRAPPER_CLASS } from '../constants/chzzkEl'

export default function createShadowRoot(
  target: Element,
  styles: string[],
): ShadowRoot {
  const host = document.createElement('div')
  host.setAttribute('id', SHADOW_HOST_ID)
  host.className = NAV_WRAPPER_CLASS
  const shadowRoot = host.attachShadow({ mode: 'open' })

  const globalStyleSheet = new CSSStyleSheet()
  globalStyleSheet.replaceSync(styles.join('\n'))

  shadowRoot.adoptedStyleSheets = [globalStyleSheet]

  target.prepend(host)

  return shadowRoot
}
