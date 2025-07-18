import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import styles from '../index.css?inline'

import { NAV_TARGET_ID } from '@/constants/chzzkEl'
import App from '@/content/views/App'
import createShadowRoot from '@/utils/createShadowRoot'

const target = document.querySelector(`#${NAV_TARGET_ID}`)
if (target) {
  const shadowRoot = createShadowRoot(target, [styles])

  target.appendChild(shadowRoot)

  const queryClient = new QueryClient()
  createRoot(shadowRoot).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
}
