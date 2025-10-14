import '@/content/previewBridgeProxy'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import styles from '../index.css?inline'

import type { ISettingState } from '@/types/setting'

import { TAB_INDEX } from '@/constants'
import { SHADOW_HOST_ID } from '@/constants'
import { ASIDE_CONTENT_TARGET_CLASS } from '@/constants/chzzkEl'
import { setPopupState } from '@/content/state/PopupSettings'
import App from '@/content/views/App'
import { getBookmarkState, saveBookmarkState } from '@/stores/bookmarkStore'
import { handleLiveChatPower } from '@/utils/chatPowerAutoClick'
import createShadowRoot from '@/utils/createShadowRoot'
import { sendRuntimeMessage } from '@/utils/helper'
import { observeTabList } from '@/utils/mutationObserver'
import { applyTabVisibility } from '@/utils/tabvisibility'
;(async () => {
  const targetSelector = `.${ASIDE_CONTENT_TARGET_CLASS}`

  const mountApp = (target: Element) => {
    if (document.getElementById(SHADOW_HOST_ID)) return

    const shadowRoot = createShadowRoot(target, [styles])
    const queryClient = new QueryClient()

    createRoot(shadowRoot.children[0]).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </StrictMode>,
    )

    const observer = observeTabList(target, syncAllFeatures)
    window.addEventListener('unload', () => observer.disconnect())
  }

  const syncAllFeatures = async () => {
    const setting = await sendRuntimeMessage<ISettingState>('getSettingState')
    const target = document.querySelector(targetSelector)
    if (target) {
      applyTabVisibility(setting, target, TAB_INDEX)
      handleLiveChatPower(Boolean(setting.chatting_power))
      setPopupState(
        Boolean(setting.preview),
        Boolean(setting.show_live_first),
        setting.preview_view_width,
        setting.preview_volume,
      )
    }
  }

  const observeTarget = () => {
    const observer = new MutationObserver(() => {
      const target = document.querySelector(targetSelector)

      if (target && !document.getElementById(SHADOW_HOST_ID)) {
        mountApp(target)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }
  const initialTarget = document.querySelector(targetSelector)

  if (initialTarget && !document.getElementById(SHADOW_HOST_ID)) {
    mountApp(initialTarget)
  }

  observeTarget()
  syncAllFeatures()

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    const target = document.querySelector(targetSelector)

    if (msg.type === 'UPDATE_SETTING' && msg.state && target) {
      applyTabVisibility(msg.state, target, TAB_INDEX)
      handleLiveChatPower(Boolean(msg.state.chatting_power))
      setPopupState(
        Boolean(msg.state.preview),
        Boolean(msg.state.show_live_first),
        msg.state.preview_view_width,
        msg.state.preview_volume,
      )
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
})()
