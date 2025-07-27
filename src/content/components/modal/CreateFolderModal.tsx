import { useState } from 'react'

import CommonModal from '@/content/components/modal/CommonModal'
import useBookmarkState from '@/content/hooks/queries/useBookmarkState'
import { addBookmarkFolder } from '@/stores/bookmarkStore'
interface CreateFolderModalProps {
  handleModalClose: () => void
}

export default function CreateFolderModal({
  handleModalClose,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState<string>('')
  const { invalidate } = useBookmarkState()

  const handleFolderAdded = async () => {
    await addBookmarkFolder(folderName)
    invalidate()
    handleModalClose()
  }
  return (
    <CommonModal handleModalClose={handleModalClose}>
      <div className="dark:bg-foreground flex w-[32rem] flex-col gap-y-6 rounded-xl bg-white px-6 py-4 text-sm">
        <div className="flex justify-center">
          <h1 className="text-base font-extrabold">폴더 추가</h1>
        </div>
        <div className="dark:bg-bg-04 bg-content-hover-01 h-0.5 w-full" />
        <div className="flex justify-center">
          <input
            className={`dark:border-border-chzzk-04 dark:caret-bg-chzzk-04 border-bg-chzzk-light-01 caret-bg-chzzk-light-01 w-full rounded-2xl border px-4 py-2 focus:outline-none`}
            placeholder="폴더명을 입력해주세요."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </div>
        <div className="flex justify-center gap-x-2 p-5">
          <button
            type="button"
            className="dark:dark:bg-bg-04 dark:hover:bg-bg-05 bg-content-hover-02 hover:bg-content-hover-03 w-full cursor-pointer rounded-2xl px-5 py-3 font-semibold"
            onClick={() => handleModalClose()}
          >
            취소
          </button>
          <button
            type="button"
            className="dark:bg-bg-chzzk-01 dark:hover:bg-bg-chzzk-03 bg-bg-chzzk-light-01 hover:bg-bg-chzzk-light-02 w-full cursor-pointer rounded-2xl border px-5 py-3 font-semibold text-white dark:text-black"
            onClick={() => handleFolderAdded()}
          >
            추가
          </button>
        </div>
      </div>
    </CommonModal>
  )
}
