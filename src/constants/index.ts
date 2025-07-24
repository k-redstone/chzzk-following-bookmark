import type { ISettingState } from '@/types/setting'

export const SHADOW_HOST_ID = 'chzzk-following-folder-shadow-host'

export const DB_NAME = 'chzzk-following-bookmark'
export const STORE_NAME = 'bookmark'
export const KEY = 'bookmark-key'

export const SETTING_KEY = 'setting-key'
export const SETTING_STORE_NAME = 'setting'

export const TAB_INDEX: Record<
  keyof Omit<ISettingState, 'chatting_power'>,
  number
> = {
  following: 2,
  category: 3,
  partner: 4,
  service: 5,
}
