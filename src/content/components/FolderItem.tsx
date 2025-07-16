import { EllipsisVertical, Folder, Plus, Trash, Pencil } from 'lucide-react'
import { NAV_BTN_CLASS, NAV_ITEM_CLASS } from '@/constants/chzzkEl'

import { useRef, useState } from 'react'
import useClickAway from '@/content/hooks/useClickAway'
import type { BookmarkFolder } from '@/content/types/bookmark'

interface IFolderItemProps {
  folder: BookmarkFolder
}

export default function FolderItem({ folder }: IFolderItemProps) {
  const [showPopup, setShowPopup] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useClickAway(menuRef, () => setShowPopup(false))

  return (
    <div className={`${NAV_ITEM_CLASS}`}>
      <div className="grow space-x-2">
        <Folder className="h-5 w-5" />
        <span>{folder.name}</span>
      </div>

      <div className="flex gap-x-1">
        <button
          type="button"
          className={`${NAV_BTN_CLASS}`}
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          type="button"
          className={`${NAV_BTN_CLASS}`}
          onClick={() => {
            setShowPopup(!showPopup)
          }}
        >
          <EllipsisVertical className="h-5 w-5" />
        </button>
      </div>

      {showPopup && (
        <div
          ref={menuRef}
          className="border-background absolute top-0.5 -right-30 z-9999 flex w-32 flex-col gap-y-2 rounded border bg-[#1d1f22] py-1 shadow-lg"
        >
          <button
            className="profile_layer_area__dPqpR"
            onClick={() => {
              setShowPopup(false)
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            <span>이름 수정</span>
          </button>
          <button
            className="profile_layer_area__dPqpR text-red-500"
            onClick={() => {
              setShowPopup(false)
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            <span>삭제</span>
          </button>
        </div>
      )}
    </div>
  )
}
