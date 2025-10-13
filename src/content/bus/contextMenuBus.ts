type TContextMenuState = {
  open: boolean
  x: number | null
  y: number | null
}

const bus = new EventTarget()

let state: TContextMenuState = { open: false, x: null, y: null }

export function getContextMenuState(): TContextMenuState {
  return state
}

export function openContextMenu(x: number, y: number) {
  state = { open: true, x, y }
  bus.dispatchEvent(
    new CustomEvent<TContextMenuState>('ctm:change', { detail: state }),
  )
}
export function closeContextMenu() {
  state = { open: false, x: null, y: null }
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
