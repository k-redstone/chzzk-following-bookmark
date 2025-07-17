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
      <div className="bg-foreground flex w-[32rem] flex-col gap-y-6 rounded-xl px-6 py-4 text-sm">
        <div className="flex justify-center">
          <h1 className="text-base font-extrabold">폴더 추가</h1>
        </div>
        <div className="bg-bg-04 h-0.5 w-full" />
        <div className="flex justify-center">
          <input
            className={`border-border-chzzk-04 caret-bg-chzzk-04 w-full rounded-2xl border px-4 py-2 focus:outline-none`}
            placeholder="폴더명을 입력해주세요."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </div>
        <div className="flex justify-center gap-x-2 p-5">
          <button
            type="button"
            className="bg-bg-04 hover:bg-bg-05 w-full cursor-pointer rounded-2xl px-5 py-3 font-semibold text-white"
            onClick={() => handleModalClose()}
          >
            취소
          </button>
          <button
            type="button"
            className="bg-bg-chzzk-01 hover:bg-bg-chzzk-03 w-full cursor-pointer rounded-2xl px-5 py-3 font-semibold text-black"
            onClick={() => handleFolderAdded()}
          >
            추가
          </button>
        </div>
      </div>
    </CommonModal>
  )
}
