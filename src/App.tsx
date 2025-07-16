import { Plus, ChevronDown, FolderPlus, Folder, Minus } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  NAV_TITLE_CLASS,
  NAV_HEADER_CLASS,
  NAV_LIST_CLASS,
  NAV_ITEM_CLASS,
  NAV_BTN_CLASS,
} from './constants/chzzkEl'
import CreateFolderModal from './content/components/CreateFolderModal'
import useIsViewportWide1200 from './content/hooks/useIsViewportWide1200'
import {
  addBookmarkFolder,
  getBookmarkState,
} from './content/storages/bookmark'

import type { BookmarkState } from './content/types/bookmark'

export default function App() {
  const isWide = useIsViewportWide1200()
  const [bookmarkData, setBookmarkData] = useState<BookmarkState | null>(null)
  const [isCreateFolderModalOpen, setCreateFolderModalOpen] =
    useState<boolean>(false)

  const handleCreateFolderOff = () => {
    setCreateFolderModalOpen(false)
  }

  const fetchBookmarkData = async () => {
    const data = await getBookmarkState()
    setBookmarkData(data)
  }

  useEffect(() => {
    fetchBookmarkData()
  }, [])

  const handleFolderAdded = async (folderName: string) => {
    await addBookmarkFolder(folderName)
    await fetchBookmarkData()
    setCreateFolderModalOpen(false)
  }

  return (
    <div className="bg-background h-screen w-screen text-white">
      {isWide ? (
        <>
          {isCreateFolderModalOpen && (
            <CreateFolderModal
              handleModalClose={handleCreateFolderOff}
              onSubmit={handleFolderAdded}
            />
          )}

          <div className={`${NAV_HEADER_CLASS}`}>
            <h2 className={`${NAV_TITLE_CLASS}`}>팔로잉 북마크</h2>
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
              >
                <FolderPlus
                  className="h-5 w-5"
                  onClick={() => setCreateFolderModalOpen(true)}
                />
              </button>
              <button
                type="button"
                className={`${NAV_BTN_CLASS}`}
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className={`${NAV_LIST_CLASS}`}>
            <div className={`${NAV_ITEM_CLASS}`}>
              {bookmarkData?.folders.map((folder) => (
                <div className={`${NAV_HEADER_CLASS}`}>
                  <div className="flex gap-x-2">
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
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className={`${NAV_BTN_CLASS}`}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className={`${NAV_TITLE_CLASS}`}>북마크</h2>
          <div className={`${NAV_LIST_CLASS}`}>
            <a className={`${NAV_ITEM_CLASS}`}>asdf</a>
            <a className={`${NAV_ITEM_CLASS}`}>asdfasdf</a>
            <a className={`${NAV_ITEM_CLASS}`}>asdfasdfdfasdf</a>
          </div>
        </>
      )}
    </div>
  )
}
