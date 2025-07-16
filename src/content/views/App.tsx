import type { BookmarkState } from '../types/bookmark'

import {
  Plus,
  ChevronDown,
  FolderPlus,
  // Minus,
} from 'lucide-react'
import useIsViewportWide1200 from '../hooks/useIsViewportWide1200'
import {
  NAV_TITLE_CLASS,
  NAV_HEADER_CLASS,
  NAV_LIST_CLASS,
  NAV_ITEM_CLASS,
  NAV_BTN_CLASS,
} from '../../constants/chzzkEl'
import { useEffect, useState } from 'react'
import CreateFolderModal from '../components/CreateFolderModal'
import { addBookmarkFolder, getBookmarkState } from '../storages/bookmark'

import FolderItem from '../components/FolderItem'

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
    <>
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
            {bookmarkData?.folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
              />
            ))}
            <a className={`${NAV_ITEM_CLASS}`}>asdfasdf</a>
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
    </>
  )
}
