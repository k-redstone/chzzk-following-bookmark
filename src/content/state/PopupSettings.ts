export type TPopupSettingsState = {
  previewEnabled: boolean
  showLiveFirst: boolean
  previewWidth: number
  previewVolume: number
}

type Listener = (state: TPopupSettingsState) => void

const state: TPopupSettingsState = {
  previewEnabled: false,
  previewWidth: 380,
  previewVolume: 10,
  showLiveFirst: false,
}
const listeners = new Set<Listener>()

export function getPopupSettings(): TPopupSettingsState {
  return { ...state }
}

export function setPopupState(
  previewEnabled: boolean,
  showLiveFirst: boolean,
  previewWidth: number,
  previewVolume: number,
): void {
  state.previewEnabled = previewEnabled
  state.previewWidth = previewWidth
  state.previewVolume = previewVolume
  state.showLiveFirst = showLiveFirst
  for (const listener of listeners) listener(getPopupSettings())
}

export function subscribePopupSettings(listener: Listener): () => void {
  listeners.add(listener)
  listener(getPopupSettings())
  return () => listeners.delete(listener)
}
