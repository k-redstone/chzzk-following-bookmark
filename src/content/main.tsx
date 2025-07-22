import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import styles from '../index.css?inline'

import { ASIDE_CONTENT_TARGET_CLASS } from '@/constants/chzzkEl'
import App from '@/content/views/App'
import createShadowRoot from '@/utils/createShadowRoot'

const target = document.querySelector(`.${ASIDE_CONTENT_TARGET_CLASS}`)
if (target) {
  const shadowRoot = createShadowRoot(target, [styles])

  const queryClient = new QueryClient()
  createRoot(shadowRoot).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
}
