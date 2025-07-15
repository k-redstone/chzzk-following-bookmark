import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './views/App'
import '../index.css'

import { NAV_TARGET_CLASS, NAV_WRAPPER_CLASS } from '../constants/chzzkEl'

const target = document.querySelector(`.${NAV_TARGET_CLASS}`)

console.log(target)
if (target) {
  const container = document.createElement('div')
  container.id = 'chzzk-following-folder'
  container.className = NAV_WRAPPER_CLASS
  target.prepend(container)

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
