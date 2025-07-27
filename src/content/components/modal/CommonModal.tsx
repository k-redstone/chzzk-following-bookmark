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
      className="bg-background/55 fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 14000,
      }}
      onClick={() => handleModalClose()}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}
