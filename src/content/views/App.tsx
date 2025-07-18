import {
  Plus,
  ChevronDown,
  FolderPlus,
  // Minus,
} from 'lucide-react'

import StreamerItem from '@/content/components/card/StreamerItem'
import FolderItem from '@/content/components/FolderItem'
import AddItemModal from '@/content/components/modal/AddItemModal'
import CreateFolderModal from '@/content/components/modal/CreateFolderModal'
import useBookmarkState from '@/content/hooks/queries/useBookmarkState'
import useIsViewportWide1200 from '@/content/hooks/useIsViewportWide1200'
import useModal from '@/content/hooks/useModal'

export default function App() {
  const isWide = useIsViewportWide1200()
  const { data: bookmarkData } = useBookmarkState()

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
      {isWide ? (
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

          <div className="text-content-05 flex items-center justify-between px-2">
            <h2 className={`text-xs font-extrabold`}>팔로잉 북마크</h2>
            <div className="flex gap-x-1">
              <button
                type="button"
                className="hover:bg-bg-layer-06 cursor-pointer rounded p-1"
              >
                <Plus
                  className="h-4.5 w-4.5 hover:text-white"
                  onClick={() => openAddItemModal()}
                />
              </button>
              <button
                type="button"
                className="hover:bg-bg-layer-06 cursor-pointer rounded p-1"
              >
                <FolderPlus
                  className="h-4.5 w-4.5 hover:text-white"
                  onClick={() => openCreateFolderModal()}
                />
              </button>
              <button
                type="button"
                className="hover:bg-bg-layer-06 cursor-pointer rounded p-1"
              >
                <ChevronDown className="h-4.5 w-4.5 hover:text-white" />
              </button>
            </div>
          </div>
          <div className={`flex flex-col gap-y-1`}>
            {bookmarkData?.root.map((node) => {
              if (node.type === 'folder') {
                return (
                  <FolderItem
                    key={node.id}
                    folder={node}
                  />
                )
              }
            })}

            {bookmarkData?.root.map((node) => {
              if (node.type === 'item') {
                return (
                  <StreamerItem
                    key={node.id}
                    streamer={node}
                    compact={false}
                  />
                )
              }
            })}
          </div>
        </>
      ) : (
        <>
          <h2 className={``}>북마크</h2>
          <div className={``}>
            <a className={``}>asdf</a>
            <a className={``}>asdfasdf</a>
            <a className={``}>asdfasdfdfasdf</a>
          </div>
        </>
      )}
    </>
  )
}
