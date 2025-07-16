import {
  EllipsisVertical,
  Folder,
  Plus,
  Trash,
  Pencil,
  FolderOpen,
} from 'lucide-react'
import { useRef, useState } from 'react'

import type { BookmarkFolder } from '@/content/types/bookmark'

import DeleteFolderModal from '@/content/components/DeleteFolderModal'
import EditFolderNameModal from '@/content/components/EditFolderNameModal'
import useClickAway from '@/content/hooks/useClickAway'
interface IFolderItemProps {
  folder: BookmarkFolder
}

export default function FolderItem({ folder }: IFolderItemProps) {
  const [showPopup, setShowPopup] = useState(false)
  const [isOpenFolder, setIsOpenFolder] = useState<boolean>(false)
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] =
    useState<boolean>(false)
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] =
    useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useClickAway(menuRef, () => setShowPopup(false))

  return (
    <>
      {isDeleteFolderModalOpen && (
        <DeleteFolderModal
          handleModalClose={() => setIsDeleteFolderModalOpen(false)}
          folder={folder}
        />
      )}
      {isEditFolderModalOpen && (
        <EditFolderNameModal
          handleModalClose={() => setIsEditFolderModalOpen(false)}
          folder={folder}
        />
      )}
      <div className="hover:bg-bg-04 flex cursor-pointer items-center justify-between rounded pl-1">
        <div
          className="flex min-w-0 grow items-center space-x-2"
          onClick={() => setIsOpenFolder(!isOpenFolder)}
        >
          {isOpenFolder ? (
            <FolderOpen className="text-bg-chzzk-01 h-5 w-5" />
          ) : (
            <Folder className="h-5 w-5" />
          )}
          <p className="max-w-[105px] truncate">{folder.name}</p>
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
              console.log('showPopup')
              setShowPopup(!showPopup)
            }}
          >
            <EllipsisVertical className="h-5.5 w-5.5" />
          </button>
          {showPopup && (
            <div
              ref={menuRef}
              className="bg-bg-layer-02 absolute right-0.5 bottom-7 flex gap-x-1 rounded px-2 py-1"
            >
              <button
                className="text-bg-chzzk-01 hover:bg-bg-layer-06 cursor-pointer rounded p-2"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  setIsEditFolderModalOpen(true)
                  setShowPopup(false)
                }}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                className="hover:bg-bg-layer-06 cursor-pointer rounded p-2 text-red-500"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  setIsDeleteFolderModalOpen(true)
                  setShowPopup(false)
                }}
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isOpenFolder && (
        <div className="ml-5 flex flex-col">
          <div>
            <span>데이텅로ㅛ</span>
          </div>
          <span>데이텅로ㅛ</span>
          <span>데이텅로ㅛ</span>
        </div>
      )}
    </>
  )
}
