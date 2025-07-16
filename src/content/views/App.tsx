import { addBookmarkFolder, getBookmarkState } from '@content/storages/bookmark'
import {
  Plus,
  ChevronDown,
  FolderPlus,
  // Minus,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import type { BookmarkState } from '@/content/types/bookmark'

import CreateFolderModal from '@/content/components/CreateFolderModal'
import FolderItem from '@/content/components/FolderItem'
import useIsViewportWide1200 from '@/content/hooks/useIsViewportWide1200'

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

          <div className={``}>
            <h2 className={``}>팔로잉 북마크</h2>
            <div className="flex gap-x-1">
              <button
                type="button"
                className={``}
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                type="button"
                className={``}
              >
                <FolderPlus
                  className="h-5 w-5"
                  onClick={() => setCreateFolderModalOpen(true)}
                />
              </button>
              <button
                type="button"
                className={``}
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className={``}>
            {bookmarkData?.folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
              />
            ))}
            <a className={``}>asdfasdf</a>
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
