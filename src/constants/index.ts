import type { ISettingState } from '@/types/setting'

export const SHADOW_HOST_ID = 'chzzk-following-folder-shadow-host'

export const DB_NAME = 'chzzk-following-bookmark'
export const DB_VERSION = 2
export const STORE_NAME = 'bookmark'
export const KEY = 'bookmark-key'

export const SETTING_KEY = 'setting-key'
export const SETTING_STORE_NAME = 'setting'

export const FOLDER_STATE_KEY = 'folder-state-key'
export const FOLDER_STATE_STORE_NAME = 'folder-state'

export const DEFAULT_IMAGE_URL =
  'https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png?type=f120_120_na'

export const TAB_INDEX: Record<
  keyof Omit<
    ISettingState,
    | 'chatting_power'
    | 'preview'
    | 'preview_view_width'
    | 'preview_volume'
    | 'show_live_first'
  >,
  number
> = {
  following: 2,
  category: 3,
  live_schedule: 4,
  partner: 5,
  service: 6,
}
