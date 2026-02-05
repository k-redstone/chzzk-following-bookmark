import { createPortal } from 'react-dom'

interface CommonModalProps {
  handleModalClose: () => void
  children: React.ReactNode
}

function getOverlayMount(): HTMLElement | null {
  const w = window as unknown as { __MY_EXT_OVERLAY_MOUNT?: HTMLElement }
  return w.__MY_EXT_OVERLAY_MOUNT ?? null
}

export default function CommonModal({
  handleModalClose,
  children,
}: CommonModalProps) {
  const mount = getOverlayMount()

  if (!mount) {
    return (
      <div
        className="bg-background/55 fixed inset-0 z-[20000] items-center justify-center"
        onClick={handleModalClose}
      >
        <div onClick={(e) => e.stopPropagation()}>{children}</div>
      </div>
    )
  }

  return createPortal(
    <div
      className="bg-background/55 fixed inset-0 z-[2147483647] flex items-center justify-center"
      onClick={handleModalClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    mount,
  )
}
