import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import styles from '../index.css?inline'

import type { ISettingState } from '@/types/setting'

import { TAB_INDEX } from '@/constants'
import { ASIDE_CONTENT_TARGET_CLASS } from '@/constants/chzzkEl'
import App from '@/content/views/App'
import { getBookmarkState, saveBookmarkState } from '@/stores/bookmarkStore'
import { handleLiveChatPower } from '@/utils/chatPowerAutoClick'
import createShadowRoot from '@/utils/createShadowRoot'
import { sendRuntimeMessage } from '@/utils/helper'
import { observeTabList } from '@/utils/mutationObserver'
import { applyTabVisibility } from '@/utils/tabvisibility'
;(async () => {
  const target = document.querySelector(`.${ASIDE_CONTENT_TARGET_CLASS}`)
  if (!target) return

  const shadowRoot = createShadowRoot(target, [styles])
  const queryClient = new QueryClient()

  async function syncAllFeatures() {
    console.log('debug: syncAllFeatures')
    const setting = await sendRuntimeMessage<ISettingState>('getSettingState')
    if (target) {
      applyTabVisibility(setting, target, TAB_INDEX)
      handleLiveChatPower(Boolean(setting.chatting_power))
    }
  }

  syncAllFeatures()

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'UPDATE_SETTING' && msg.state) {
      applyTabVisibility(msg.state, target, TAB_INDEX)
      handleLiveChatPower(Boolean(msg.state.chatting_power))
    }

    if (msg.type === 'EXPORT_BOOKMARK_DATA') {
      getBookmarkState().then((data) => {
        sendResponse(data)
      })
      return true
    }
    if (msg.type === 'IMPORT_BOOKMARK_DATA') {
      saveBookmarkState(msg.data).then(() => {
        sendResponse({ ok: true })
      })
      return true
    }
  })

  const observer = observeTabList(target, syncAllFeatures)
  window.addEventListener('unload', () => observer.disconnect())

  createRoot(shadowRoot.children[0]).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
})()
