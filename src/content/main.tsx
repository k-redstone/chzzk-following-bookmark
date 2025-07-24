import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import styles from '../index.css?inline'

import type { ISettingState } from '@/types/setting'

import { TAB_INDEX } from '@/constants'
import { ASIDE_CONTENT_TARGET_CLASS } from '@/constants/chzzkEl'
import App from '@/content/views/App'
import createShadowRoot from '@/utils/createShadowRoot'
import { sendRuntimeMessage } from '@/utils/helper'

const target = document.querySelector(`.${ASIDE_CONTENT_TARGET_CLASS}`)
if (target) {
  const shadowRoot = createShadowRoot(target, [styles])

  const queryClient = new QueryClient()
  const setting = await sendRuntimeMessage<ISettingState>('getSettingState')

  Object.entries(setting).forEach(([key, value]) => {
    if (!value && key in TAB_INDEX) {
      const idx = TAB_INDEX[key as keyof Omit<ISettingState, 'chatting_power'>]
      const tab = target.children[idx]
      if (tab instanceof HTMLElement) tab.style.display = 'none'
    }
  })

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'UPDATE_SETTING' && msg.state) {
      Object.entries(msg.state).forEach(([key, value]) => {
        if (key in TAB_INDEX) {
          const idx =
            TAB_INDEX[key as keyof Omit<ISettingState, 'chatting_power'>]
          const tab = target.children[idx]
          if (tab instanceof HTMLElement) {
            tab.style.display = value ? '' : 'none'
          }
        }
      })
    }
  })

  createRoot(shadowRoot).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
}
