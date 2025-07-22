import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Plus, ChevronDown, FolderPlus, ChevronUp } from 'lucide-react'
import { useState } from 'react'

import BookmarkList from '@/content/components/BookmarkList'
import AddItemModal from '@/content/components/modal/AddItemModal'
import CreateFolderModal from '@/content/components/modal/CreateFolderModal'
import useBookmarkState from '@/content/hooks/queries/useBookmarkState'
import useModal from '@/content/hooks/useModal'
import useNavExpanded from '@/content/hooks/useNavExpanded'
import { handleDragEnd } from '@/utils/helper'

export default function App() {
  const isNavExpanded = useNavExpanded()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )
  const {
    data: bookmarkData,
    isSuccess,
    isFetching,
    invalidate,
  } = useBookmarkState()
  const [isOpenBookmark, setOpenBookbark] = useState<boolean>(true)

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

  return (
    <>
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
        <div className="text-content-05 flex items-center justify-between px-2">
          <h2 className={`text-xs font-extrabold`}>팔로잉 북마크</h2>
          <div className="flex gap-x-1">
            <button
              type="button"
              className="hover:bg-bg-layer-06 cursor-pointer rounded p-1 hover:text-white"
              onClick={() => openAddItemModal()}
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              className="hover:bg-bg-layer-06 cursor-pointer rounded p-1 hover:text-white"
              onClick={() => openCreateFolderModal()}
            >
              <FolderPlus className="h-4.5 w-4.5 hover:text-white" />
            </button>
            <button
              type="button"
              className="hover:bg-bg-layer-06 cursor-pointer rounded p-1 hover:text-white"
              onClick={() => setOpenBookbark(!isOpenBookmark)}
            >
              {isOpenBookmark ? (
                <ChevronUp className="h-4.5 w-4.5" />
              ) : (
                <ChevronDown className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-content-05 mb-2 flex items-center justify-center">
          <h2 className={`text-xs font-extrabold`}>북마크</h2>
        </div>
      )}

      {isOpenBookmark && isSuccess && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={async (event) => {
            await handleDragEnd(event)
            invalidate()
          }}
        >
          <BookmarkList />
        </DndContext>
      )}
    </>
  )
}
