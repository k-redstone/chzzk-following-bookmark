import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/content/views/App'
import styles from '../index.css?inline'

import { NAV_TARGET_CLASS } from '@/constants/chzzkEl'
import createShadowRoot from '@/utils/createShadowRoot'

const target = document.querySelector(`.${NAV_TARGET_CLASS}`)

console.log(target)
if (target) {
  const shadowRoot = createShadowRoot(target, [styles])
  target.appendChild(shadowRoot)

  createRoot(shadowRoot).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
