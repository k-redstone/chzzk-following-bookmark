import { useState, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import StreamerItem from '@/content/components/card/StreamerItem'
import FolderItem from '@/content/components/FolderItem'
import useNavExpanded from '@/content/hooks/useNavExpanded'
import { useShadowRoot } from '@/content/hooks/useShadowRoot'
import { useDnDContext } from '@/providers/DnDProvider'

export default function DragMirror() {
  const { dragging, mousePos } = useDnDContext()
  const shadowRoot = useShadowRoot()
  const mirrorRef = useRef<HTMLDivElement>(null)
  const [mirrorSize, setMirrorSize] = useState({ width: 0, height: 0 })
  const isNavExpanded = useNavExpanded()

  useLayoutEffect(() => {
    if (mirrorRef.current) {
      const rect = mirrorRef.current.getBoundingClientRect()
      setMirrorSize({ width: rect.width, height: rect.height })
    }
  }, [dragging])

  if (!dragging) return null

  if (shadowRoot) {
    return createPortal(
      <div
        ref={mirrorRef}
        className={`bg-bg-04 pointer-events-none fixed z-[9999] rounded select-none ${isNavExpanded ? 'min-w-[204px]' : 'min-w-[38px]'}`}
        style={{
          top: mousePos.y - mirrorSize.height / 2,
          left: mousePos.x - mirrorSize.width / 2,
        }}
      >
        {dragging.data.type === 'item' ? (
          <StreamerItem
            streamer={dragging.data}
            inFolder={false}
          />
        ) : (
          <FolderItem folder={dragging.data} />
        )}
      </div>,
      shadowRoot,
    )
  }
}
