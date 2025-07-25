import type { ISettingState } from '@/types/setting'

import { NAV_WRAPPER_CLASS } from '@/constants/chzzkEl'

export function applyTabVisibility(
  setting: ISettingState,
  target: Element,
  tabIndex: Record<string, number>,
) {
  const tabList = target.querySelectorAll(`.${NAV_WRAPPER_CLASS}`)
  Object.entries(setting).forEach(([key, value]) => {
    if (key in tabIndex) {
      const idx = tabIndex[key]
      const tab = tabList[idx]
      if (tab instanceof HTMLElement) {
        tab.style.display = value ? '' : 'none'
      }
    }
  })
}
