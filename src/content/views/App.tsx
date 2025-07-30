import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  Plus,
  ChevronDown,
  FolderPlus,
  ChevronUp,
  RotateCw,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import type { IImportMsg } from '@/types/setting'

import BookmarkList from '@/content/components/BookmarkList'
import AddItemModal from '@/content/components/modal/AddItemModal'
import CreateFolderModal from '@/content/components/modal/CreateFolderModal'
import ImportErrorModal from '@/content/components/modal/ImportErrorModal'
import useBookmarkState from '@/content/hooks/queries/useBookmarkState'
import useStreamerLiveStatus from '@/content/hooks/queries/useStreamerLiveStatus'
import useModal from '@/content/hooks/useModal'
import useNavExpanded from '@/content/hooks/useNavExpanded'
import { handleDragEnd } from '@/utils/helper'

export default function App() {
  const isNavExpanded = useNavExpanded()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  )
  const { data: bookmarkData, isSuccess, invalidate } = useBookmarkState()
  const { invalidateAll: invalidateAllLiveStatus } = useStreamerLiveStatus()
  const [isOpenBookmark, setOpenBookbark] = useState<boolean>(true)
  const [isRotating, setIsRotating] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<IImportMsg>()

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const {
    isOpen: isOpenCreateFolderModal,
    openModal: openCreateFolderModal,
    closeModal: closeCreateFolderModal,
  } = useModal()
  const {
    isOpen: isOpenAddItemModal,
    openModal: openAddItemModal,
    closeModal: closeAddItemModall,
  } = useModal()
  const {
    isOpen: isImportErrorModal,
    openModal: openImportErrorModal,
    closeModal: closeImportErrorModal,
  } = useModal()

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'IMPORT_ERROR' && msg.payload) {
        openImportErrorModal()
        setErrorMsg(msg.payload)
      }
    })
  }, [])

  return (
    <>
      {isImportErrorModal && (
        <ImportErrorModal
          handleModalClose={closeImportErrorModal}
          payload={errorMsg}
        />
      )}
      {isOpenCreateFolderModal && (
        <CreateFolderModal handleModalClose={closeCreateFolderModal} />
      )}
      {isOpenAddItemModal && (
        <AddItemModal
          handleModalClose={closeAddItemModall}
          root={bookmarkData?.root.filter((item) => item.type === 'item')}
        />
      )}

      {isNavExpanded ? (
        <div className="text-content-05 flex items-center justify-between p-[5px]">
          <h2 className={`text-xs font-extrabold`}>팔로잉 북마크</h2>
          <div className="flex gap-x-1">
            <button
              type="button"
              className="dark:hover:bg-bg-layer-06 hover:bg-content-hover-01 cursor-pointer rounded p-[3px] dark:hover:text-white"
              onClick={() => openAddItemModal()}
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="dark:hover:bg-bg-layer-06 hover:bg-content-hover-01 cursor-pointer rounded p-[3px] dark:hover:text-white"
              onClick={() => openCreateFolderModal()}
            >
              <FolderPlus className="w h-4" />
            </button>
            <button
              type="button"
              className="dark:hover:bg-bg-layer-06 hover:bg-content-hover-01 cursor-pointer rounded p-[3px] dark:hover:text-white"
              onClick={() => {
                setIsRotating(true)
                invalidateAllLiveStatus()

                setTimeout(() => {
                  setIsRotating(false)
                }, 1000)
              }}
            >
              <RotateCw
                className={`h-3.5 w-3.5 ${isRotating && `animate-spin-once`}`}
              />
            </button>
            <button
              type="button"
              className="dark:hover:bg-bg-layer-06 hover:bg-content-hover-01 cursor-pointer rounded dark:hover:text-white"
              onClick={() => setOpenBookbark(!isOpenBookmark)}
            >
              {isOpenBookmark ? (
                <ChevronDown className="h-[17px] w-[17px]" />
              ) : (
                <ChevronUp className="h-[17px] w-[17px]" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-content-05 flex items-center justify-center">
          <h2 className={`text-[11px] font-bold`}>북마크</h2>
        </div>
      )}

      {isSuccess && bookmarkData.root.length === 0 ? (
        <div>
          <p className="text-content-04 text-center text-xs">
            추가된 북마크가 없습니다.
          </p>
        </div>
      ) : (
        isOpenBookmark && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => setActiveId(event.active.id)}
            onDragEnd={async (event) => {
              await handleDragEnd(event)
              invalidate()
            }}
          >
            <div className={`${isOpenBookmark ? 'mt-[5px]' : `mt-2.5`}`}>
              <BookmarkList />
              <DragOverlay>{activeId && null}</DragOverlay>
            </div>
          </DndContext>
        )
      )}
    </>
  )
}
