import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  EllipsisVertical,
  Folder,
  Plus,
  Trash,
  Pencil,
  FolderOpen,
} from 'lucide-react'
import { useRef, useState } from 'react'

import type { BookmarkFolder } from '@/types/bookmark'

import StreamerItem from '@/content/components/card/StreamerItem'
import FolderTooltip from '@/content/components/FolderTooltip'
import AddItemModal from '@/content/components/modal/AddItemModal'
import DeleteFolderModal from '@/content/components/modal/DeleteFolderModal'
import EditFolderNameModal from '@/content/components/modal/EditFolderNameModal'
import useBookmarkState from '@/content/hooks/queries/useBookmarkState'
import useClickAway from '@/content/hooks/useClickAway'
import useDndStyle from '@/content/hooks/useDndStyle'
import useModal from '@/content/hooks/useModal'
import useNavExpanded from '@/content/hooks/useNavExpanded'
import useShowTooltip from '@/content/hooks/useShowTooltip'

interface IFolderItemProps {
  folder: BookmarkFolder
}

export default function FolderItem({ folder }: IFolderItemProps) {
  const menuRef = useRef<HTMLDivElement | null>(null)
  useClickAway(menuRef, () => setShowPopup(false))
  const isNavExpanded = useNavExpanded()
  const [showPopup, setShowPopup] = useState(false)
  const [isOpenFolder, setIsOpenFolder] = useState<boolean>(false)

  const { data: bookmarkData } = useBookmarkState()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id })

  const { style } = useDndStyle(transform, transition)
  const {
    isOpen: isOpenDeleteFolderModal,
    openModal: openDeleteFolderModal,
    closeModal: closeDeleteFolderModal,
  } = useModal()
  const {
    isOpen: isOpenEditFolderModal,
    openModal: openEditFolderModal,
    closeModal: closeEditFolderModal,
  } = useModal()

  const {
    isOpen: isOpenAddItemModal,
    openModal: OpenAddItemModal,
    closeModal: closeAddItemModal,
  } = useModal()

  const {
    isOpen: isOpenItemTooltip,
    closeModal: closeItemTooltip,
    openModal: openItemTooltip,
  } = useModal()

  const { show: showToolTipSection, hide: hideTooltipSection } =
    useShowTooltip()

  if (!isNavExpanded) {
    return (
      <div
        className={`${isOpenFolder && `bg-bg-04 rounded`} ${isDragging && `bg-bg-04 opacity-50`}`}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <div className="flex cursor-pointer items-center justify-between">
          <div
            className="hover:bg-bg-04 relative flex w-full items-center justify-center rounded p-1"
            onClick={() => setIsOpenFolder(!isOpenFolder)}
            onMouseEnter={() => {
              openItemTooltip()
              showToolTipSection()
            }}
            onMouseLeave={() => {
              closeItemTooltip()
              hideTooltipSection()
            }}
          >
            {isOpenFolder ? (
              <FolderOpen className="text-bg-chzzk-01 h-5 w-5" />
            ) : (
              <Folder className="h-5 w-5" />
            )}
            {isOpenItemTooltip && <FolderTooltip folderName={folder.name} />}
          </div>
        </div>

        {isOpenFolder &&
          (() => {
            const node = bookmarkData?.root.find(
              (data) => data.id === folder.id,
            )
            if (node?.type === 'folder') {
              return (
                <SortableContext
                  items={node.items}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className={`flex flex-col gap-y-1`}>
                    {node.items.map((item) => (
                      <li key={item.id}>
                        <StreamerItem
                          streamer={item}
                          inFolder={true}
                        />
                      </li>
                    ))}
                  </ul>
                </SortableContext>
              )
            }
            return null
          })()}
      </div>
    )
  }

  return (
    <>
      {isOpenDeleteFolderModal && (
        <DeleteFolderModal
          handleModalClose={() => closeDeleteFolderModal()}
          folder={folder}
        />
      )}

      {isOpenEditFolderModal && (
        <EditFolderNameModal
          handleModalClose={() => closeEditFolderModal()}
          folder={folder}
        />
      )}

      {isOpenAddItemModal && (
        <AddItemModal
          handleModalClose={closeAddItemModal}
          folder={folder}
        />
      )}

      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
      >
        <div
          className={`hover:bg-bg-04 flex cursor-pointer items-center justify-between rounded pl-1 ${isDragging && `bg-bg-04 opacity-50`}`}
        >
          <div
            className="flex min-w-0 grow items-center space-x-2"
            {...listeners}
            onClick={() => {
              setIsOpenFolder(!isOpenFolder)
            }}
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
              onMouseDown={(e) => {
                e.stopPropagation()
                OpenAddItemModal()
              }}
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
                className="bg-bg-layer-02 absolute right-0.5 bottom-7 flex gap-x-1 rounded px-2 py-1"
              >
                <button
                  className="text-bg-chzzk-01 hover:bg-bg-layer-06 cursor-pointer rounded p-2"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    openEditFolderModal()
                    setShowPopup(false)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="hover:bg-bg-layer-06 cursor-pointer rounded p-2 text-red-500"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    openDeleteFolderModal()
                    setShowPopup(false)
                  }}
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        {isOpenFolder &&
          (() => {
            const node = bookmarkData?.root.find(
              (data) => data.id === folder.id,
            )
            if (node?.type === 'folder') {
              return (
                <SortableContext
                  items={node.items}
                  strategy={verticalListSortingStrategy}
                >
                  <ul
                    className={`border-l-bg-chzzk-04 ${isDragging && `bg-bg-04 opacity-50`} ml-4 flex flex-col gap-y-1 border-l-2`}
                  >
                    {node.items.map((item) => (
                      <li key={item.id}>
                        <StreamerItem
                          streamer={item}
                          inFolder={true}
                        />
                      </li>
                    ))}
                  </ul>
                </SortableContext>
              )
            }
            return null
          })()}
      </div>
    </>
  )
}
