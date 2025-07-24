import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import styles from '../index.css?inline'

import type { ISettingState } from '@/types/setting'

import { TAB_INDEX } from '@/constants'
import {
  ASIDE_CONTENT_TARGET_CLASS,
  NAV_WRAPPER_CLASS,
} from '@/constants/chzzkEl'
import App from '@/content/views/App'
import createShadowRoot from '@/utils/createShadowRoot'
import { sendRuntimeMessage } from '@/utils/helper'
;(async () => {
  const target = document.querySelector(`.${ASIDE_CONTENT_TARGET_CLASS}`)
  if (!target) return

  const shadowRoot = createShadowRoot(target, [styles])
  const queryClient = new QueryClient()

  // 탭 상태 적용 함수
  const updateTabs = async () => {
    const setting = await sendRuntimeMessage<ISettingState>('getSettingState')
    const tabList = target.querySelectorAll(`.${NAV_WRAPPER_CLASS}`)
    applyTabVisibility(setting, tabList)
  }

  // 최초 적용
  await updateTabs()

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'UPDATE_SETTING' && msg.state) {
      const tabList = target.querySelectorAll(`.${NAV_WRAPPER_CLASS}`)
      applyTabVisibility(msg.state, tabList)
    }
  })

  const observer = observeTabList(target, updateTabs)

  createRoot(shadowRoot).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
  window.addEventListener('unload', () => observer.disconnect())
})()

function observeTabList(
  target: Element,
  applySetting: () => void,
): MutationObserver {
  const observer = new MutationObserver(() => {
    applySetting()
  })
  observer.observe(target, { childList: true, subtree: false })
  return observer
}

function applyTabVisibility(
  setting: ISettingState,
  tabList: NodeListOf<Element>,
) {
  Object.entries(setting).forEach(([key, value]) => {
    if (key in TAB_INDEX) {
      const idx = TAB_INDEX[key as keyof typeof TAB_INDEX]
      const tab = tabList[idx]
      if (tab instanceof HTMLElement) {
        tab.style.display = value ? '' : 'none'
      }
    }
  })
}
