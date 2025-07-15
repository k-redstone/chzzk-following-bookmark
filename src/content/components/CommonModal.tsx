interface CommonModalProps {
  handleModalClose: () => void
  children: React.ReactNode
}

export default function CommonModal({
  handleModalClose,
  children,
}: CommonModalProps) {
  return (
    <div
      className="bg-background/55 fixed inset-0 z-9999 flex items-center justify-center"
      onClick={() => handleModalClose()}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}
