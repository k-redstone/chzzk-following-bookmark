import type { ISettingState } from '@/types/setting'

export const SHADOW_HOST_ID = 'chzzk-following-folder-shadow-host'

export const DB_NAME = 'chzzk-following-bookmark'
export const STORE_NAME = 'bookmark'
export const KEY = 'bookmark-key'

export const SETTING_KEY = 'setting-key'
export const SETTING_STORE_NAME = 'setting'

export const DEFAULT_IMAGE_URL =
  'https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png?type=f120_120_na'

export const TAB_INDEX: Record<
  keyof Omit<ISettingState, 'chatting_power'>,
  number
> = {
  following: 2,
  category: 3,
  partner: 4,
  service: 5,
}
