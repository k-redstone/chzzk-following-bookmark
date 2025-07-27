import { useEffect, useRef } from 'react'

import { HEADER_CONTAINER_CLASS } from '@/constants/chzzkEl'
interface CommonModalProps {
  handleModalClose: () => void
  children: React.ReactNode
}

export default function CommonModal({
  handleModalClose,
  children,
}: CommonModalProps) {
  const originalZIndexRef = useRef<string | null>(null)
  useEffect(() => {
    const header = document.querySelector(`.${HEADER_CONTAINER_CLASS}`)

    if (header instanceof HTMLElement) {
      originalZIndexRef.current = header.style.zIndex
      header.style.setProperty('z-index', '12000', 'important')
    }

    return () => {
      if (header instanceof HTMLElement) {
        if (originalZIndexRef.current) {
          header.style.setProperty('z-index', originalZIndexRef.current)
        } else {
          header.style.removeProperty('z-index')
        }
      }
    }
  }, [])

  return (
    <div
      className="bg-background/55 fixed inset-0 z-[20000] flex items-center justify-center"
      onClick={() => handleModalClose()}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}
