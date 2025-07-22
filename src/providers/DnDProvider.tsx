import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import type { BookmarkNode } from '@/types/bookmark'

import { moveDnDNode } from '@/utils/helper'

type DragInfo = {
  type: 'root' | 'folder'
  parentId?: string
  index: number
  data: BookmarkNode
} | null

interface DnDContextType {
  dragging: DragInfo
  dropTarget: DragInfo
  mousePos: { x: number; y: number }
  justDragged: boolean
  onMouseDown: (info: NonNullable<DragInfo>, e: React.MouseEvent) => void
  onMouseEnter: (info: NonNullable<DragInfo>) => void
  onDrop: () => void
}

const DnDContext = createContext<DnDContextType | undefined>(undefined)

export function DnDProvider({ children }: { children: React.ReactNode }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [pendingDrag, setPendingDrag] = useState<NonNullable<DragInfo> | null>(
    null,
  )
  const [dragging, setDragging] = useState<DragInfo>(null)
  const [dropTarget, setDropTarget] = useState<DragInfo>(null)
  const [justDragged, setJustDragged] = useState(false)

  const pendingDragRef = useRef(pendingDrag)
  const draggingRef = useRef(dragging)

  useEffect(() => {
    pendingDragRef.current = pendingDrag
  }, [pendingDrag])

  useEffect(() => {
    draggingRef.current = dragging
  }, [dragging])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })

    if (!draggingRef.current && pendingDragRef.current) {
      setDragging(pendingDragRef.current)
      setPendingDrag(null)
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    setDragging(null)
    setDropTarget(null)
    setPendingDrag(null)
    setMousePos({ x: 0, y: 0 })
  }, [handleMouseMove])

  const onMouseDown = useCallback(
    (info: NonNullable<DragInfo>, e: React.MouseEvent) => {
      e.preventDefault()
      setPendingDrag(info)
      setMousePos({ x: e.clientX, y: e.clientY })
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [handleMouseMove, handleMouseUp],
  )

  const onMouseEnter = useCallback(
    (info: NonNullable<DragInfo>) => {
      if (dragging) setDropTarget(info)
    },
    [dragging],
  )

  const onDrop = useCallback(async () => {
    if (dragging && dropTarget) {
      await moveDnDNode(dragging, dropTarget)
      setDragging(null)
      setDropTarget(null)
    }

    setJustDragged(true)
    setTimeout(() => setJustDragged(false), 0)
  }, [dragging, dropTarget])

  return (
    <DnDContext.Provider
      value={{
        dragging,
        dropTarget,
        mousePos,
        justDragged,
        onMouseDown,
        onMouseEnter,
        onDrop,
      }}
    >
      {children}
    </DnDContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDnDContext() {
  const ctx = useContext(DnDContext)
  if (!ctx) throw new Error('useDnDContext must be used within DnDProvider')
  return ctx
}
