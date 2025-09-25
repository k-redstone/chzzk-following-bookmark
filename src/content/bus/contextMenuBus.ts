type TContextMenuState = {
  open: boolean
  hashId: string | null
}

const bus = new EventTarget()

let state: TContextMenuState = { open: false, hashId: null }

export function getContextMenuState(): TContextMenuState {
  return state
}

export function openContextMenu(hashId: string) {
  state = { open: true, hashId }
  bus.dispatchEvent(
    new CustomEvent<TContextMenuState>('ctm:change', { detail: state }),
  )
}
export function closeContextMenu() {
  state = { open: false, hashId: null }
  bus.dispatchEvent(
    new CustomEvent<TContextMenuState>('ctm:change', { detail: state }),
  )
}

export function subscribeContextMenu(fn: (s: TContextMenuState) => void) {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<TContextMenuState>
    fn(customEvent.detail)
  }

  bus.addEventListener('ctm:change', handler)
  fn(state)

  return () => bus.removeEventListener('ctm:change', handler)
}
