export type TPreviewSettingsState = {
  previewEnabled: boolean
  previewWidth: number
  previewVolume: number
}

type Listener = (state: TPreviewSettingsState) => void

const state: TPreviewSettingsState = {
  previewEnabled: false,
  previewWidth: 380,
  previewVolume: 10,
}
const listeners = new Set<Listener>()

export function getPreviewSettings(): TPreviewSettingsState {
  return { ...state }
}

export function setPreviewState(
  previewEnabled: boolean,
  previewWidth: number,
  previewVolume: number,
): void {
  state.previewEnabled = previewEnabled
  state.previewWidth = previewWidth
  state.previewVolume = previewVolume
  for (const listener of listeners) listener(getPreviewSettings())
}

export function subscribePreviewSettings(listener: Listener): () => void {
  listeners.add(listener)
  listener(getPreviewSettings())
  return () => listeners.delete(listener)
}
