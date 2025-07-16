import { EllipsisVertical, Folder, Plus, Trash, Pencil } from 'lucide-react'
import { useRef, useState } from 'react'

import type { BookmarkFolder } from '@/content/types/bookmark'

import useClickAway from '@/content/hooks/useClickAway'

interface IFolderItemProps {
  folder: BookmarkFolder
}

export default function FolderItem({ folder }: IFolderItemProps) {
  const [showPopup, setShowPopup] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useClickAway(menuRef, () => setShowPopup(false))

  return (
    <div className="flex items-center justify-between py-2 pl-1">
      <div className="flex grow items-center space-x-2">
        <Folder className="h-5 w-5" />
        <span>{folder.name}</span>
      </div>

      <div className="relative flex gap-x-1">
        <button
          type="button"
          className={`hover:bg-bg-layer-03 cursor-pointer rounded p-1`}
        >
          <Plus className="h-5.5 w-5.5" />
        </button>
        <button
          type="button"
          className={`hover:bg-bg-layer-03 cursor-pointer rounded p-1`}
          onMouseDown={(e) => {
            e.stopPropagation()
            setShowPopup(!showPopup)
          }}
        >
          <EllipsisVertical className="h-5.5 w-5.5" />
        </button>
        {showPopup && (
          <div
            ref={menuRef}
            className="bg-bg-layer-02 absolute right-1 bottom-6.5 flex gap-x-1 rounded px-2 py-1"
          >
            <button
              className="text-bg-chzzk-01 hover:bg-bg-layer-06 cursor-pointer rounded p-2"
              onClick={() => {
                setShowPopup(false)
              }}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className="hover:bg-bg-layer-06 cursor-pointer rounded p-2 text-red-500"
              onClick={() => {
                setShowPopup(false)
              }}
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
