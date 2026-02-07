export interface ISettingState {
  following: boolean
  category: boolean
  partner: boolean
  service: boolean
  live_schedule: boolean
  chatting_power: boolean
  preview: boolean
  preview_view_width: number
  preview_volume: number
  show_live_first: boolean
  hide_offline_streamers: boolean
}

export interface IImportMsg {
  message: string
  variant: 'error' | 'success'
}

export interface ISettingSliderOnChangeOptions {
  debounceMs?: number
  onSaved?: (state: ISettingState) => void | Promise<void>
  onLocal?: (next: number) => void
}
