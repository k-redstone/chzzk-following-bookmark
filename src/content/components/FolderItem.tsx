import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Folder, FolderOpen } from 'lucide-react'
import { useState, useEffect } from 'react'

import type { EnrichedFolder } from '@/types/bookmark'

import StreamerItem from '@/content/components/card/StreamerItem'
import FolderContextMenuTooltip from '@/content/components/FolderContextMenuTooltip'
import FolderTooltip from '@/content/components/FolderTooltip'
import AddItemModal from '@/content/components/modal/AddItemModal'
import DeleteFolderModal from '@/content/components/modal/DeleteFolderModal'
import EditFolderNameModal from '@/content/components/modal/EditFolderNameModal'
import useDndStyle from '@/content/hooks/useDndStyle'
import useFolderStateMap from '@/content/hooks/useFolderStateMap'
import useModal from '@/content/hooks/useModal'
import useNavExpanded from '@/content/hooks/useNavExpanded'
import useRightClickMenu from '@/content/hooks/useRightClickMenu'
import useShowTooltip from '@/content/hooks/useShowTooltip'
import { toggleFolderState } from '@/stores/folderStateStore'

interface IFolderItemProps {
  folder: EnrichedFolder
}

export default function FolderItem({ folder }: IFolderItemProps) {
  const isNavExpanded = useNavExpanded()
  // const [isOpenFolder, setIsOpenFolder] = useState<boolean>(false)

  const { data: folderStateMap, invalidate } = useFolderStateMap()

  const [isOpenFolder, setIsOpenFolder] = useState<boolean>(
    folderStateMap?.[folder.id] ?? false,
  )

  useEffect(() => {
    if (folderStateMap) {
      setIsOpenFolder(folderStateMap[folder.id] ?? false)
    }
  }, [folderStateMap, folder.id])

  const handleToggle = async () => {
    const newState = await toggleFolderState(folder.id)
    setIsOpenFolder(newState)
    invalidate()
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id })
  const {
    open: contextMenuOpen,
    payload,
    show: showContextMenu,
    hide: hideContextMenu,
    attachMenuEl,
    armInternalDownGuard,
  } = useRightClickMenu()

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

  const handleFolderContextMenuOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    showContextMenu({
      x: e.clientX,
      y: e.clientY,
      inFolder: false,
      isNavExpanded,
    })
  }
  if (!isNavExpanded) {
    return (
      <div
        className={`mb-1 ${isOpenFolder && `dark:bg-bg-04 bg-content-hover-02 rounded`} ${isDragging && `dark:bg-bg-04 bg-content-hover-02 opacity-50`}`}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <div className="flex cursor-pointer items-center justify-between">
          <div
            className="dark:hover:bg-bg-04 hover:bg-content-hover-02 relative flex w-full items-center justify-center rounded p-1"
            onClick={handleToggle}
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
              <FolderOpen className="dark:text-bg-chzzk-01 text-bg-chzzk-light-02 h-5 w-5" />
            ) : (
              <Folder className="h-5 w-5" />
            )}
            {isOpenItemTooltip && <FolderTooltip folderName={folder.name} />}
          </div>
        </div>

        {isOpenFolder &&
          (() => {
            if (folder?.type === 'folder') {
              return (
                <SortableContext
                  items={folder.items}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className={`flex flex-col`}>
                    {folder.items.length === 0 ? (
                      <div className="p-[5px]">
                        <p className="text-center text-[13px] text-white">
                          추가된 스트리머가 없습니다.
                        </p>
                      </div>
                    ) : (
                      folder.items.map((item) => (
                        <li key={item.id}>
                          <StreamerItem
                            isNavExpanded={isNavExpanded}
                            streamer={item}
                            inFolder={true}
                          />
                        </li>
                      ))
                    )}
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
          className={`dark:hover:bg-bg-04 dark:bg-bg-01 hover:bg-content-hover-02 flex cursor-pointer items-center justify-between rounded bg-white pt-1 pb-1 pl-1 ${isDragging && `dark:bg-bg-04 bg-content-hover-02 opacity-50`}`}
          onClick={handleToggle}
          onContextMenu={handleFolderContextMenuOpen}
        >
          <div
            className="flex min-w-0 grow items-center space-x-2"
            {...listeners}
          >
            {isOpenFolder ? (
              <FolderOpen className="dark:text-bg-chzzk-01 text-bg-chzzk-light-02 h-5 w-5" />
            ) : (
              <Folder className="h-5 w-5" />
            )}
            <p className="max-w-[118px] truncate">{folder.name}</p>
          </div>

          <div className="relative flex items-center gap-x-0.5">
            {/* 라이브 중인 스트리머 숫자 카운트  */}
            <span className="dark:text-content-04 text-bg-05 pr-1.5 text-xs font-semibold">
              ({folder.meta.liveCount}/{folder.items.length})
            </span>
            {/* 플러스 버튼 코드는 향후 삭제 예정 */}
            {/* <button
              type="button"
              className={`dark:hover:bg-bg-layer-03 hover:bg-content-hover-01 cursor-pointer rounded p-1`}
              onMouseDown={(e) => {
                e.stopPropagation()
                OpenAddItemModal()
              }}
            >
              <Plus className="h-4 w-4" />
            </button> */}
          </div>
        </div>
        {isOpenFolder &&
          (() => {
            if (folder?.type === 'folder') {
              return (
                <SortableContext
                  items={folder.items}
                  strategy={verticalListSortingStrategy}
                >
                  <ul
                    className={`dark:border-l-bg-chzzk-04 border-l-bg-chzzk-light-01 ml-4 flex flex-col border-l-2 ${isDragging && `dark:bg-bg-04 bg-content-hover-02 opacity-50`}`}
                  >
                    {folder.items.length === 0 ? (
                      <div className="p-[5px]">
                        <p className="text-content-05 text-center text-[13px]">
                          추가된 스트리머가 없습니다.
                        </p>
                      </div>
                    ) : (
                      folder.items.map((item) => (
                        <li key={item.id}>
                          <StreamerItem
                            isNavExpanded={isNavExpanded}
                            streamer={item}
                            inFolder={true}
                          />
                        </li>
                      ))
                    )}
                  </ul>
                </SortableContext>
              )
            }
            return null
          })()}

        <FolderContextMenuTooltip
          x={payload?.x ?? 0}
          y={payload?.y ?? 0}
          open={contextMenuOpen}
          onClose={hideContextMenu}
          onEditFolderName={openEditFolderModal}
          onDeleteFolder={openDeleteFolderModal}
          onAddFolderItem={OpenAddItemModal}
          attachMenuEl={attachMenuEl}
          armInternalDownGuard={armInternalDownGuard}
        />
      </div>
    </>
  )
}
