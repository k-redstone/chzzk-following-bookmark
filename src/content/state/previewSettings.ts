export type TPreviewSettingsState = {
  previewEnabled: boolean
}

type Listener = (state: TPreviewSettingsState) => void

const state: TPreviewSettingsState = { previewEnabled: false }
const listeners = new Set<Listener>()

export function getPreviewSettings(): TPreviewSettingsState {
  return { ...state }
}

export function setPreviewEnabled(enabled: boolean): void {
  state.previewEnabled = enabled
  for (const l of listeners) l(getPreviewSettings())
}

export function subscribePreviewSettings(listener: Listener): () => void {
  listeners.add(listener)
  listener(getPreviewSettings())
  return () => listeners.delete(listener)
}
