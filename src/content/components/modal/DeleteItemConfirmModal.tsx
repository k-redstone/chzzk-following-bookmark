import type { BookmarkItem } from '@/types/bookmark'

import CommonModal from '@/content/components/modal/CommonModal'
import useBookmarkState from '@/content/hooks/queries/useBookmarkState'
import { removeBookmarkItem } from '@/stores/bookmarkStore'

interface IDeleteItemConfirmModalProps {
  handleModalClose: () => void
  streamer: BookmarkItem
}
export default function DeleteItemConfirmModal({
  handleModalClose,
  streamer,
}: IDeleteItemConfirmModalProps) {
  const { invalidate } = useBookmarkState()

  const handleRemoveItem = async () => {
    await removeBookmarkItem(streamer.id)
    invalidate()
  }

  return (
    <CommonModal handleModalClose={handleModalClose}>
      <div className="bg-foreground flex w-[32rem] flex-col gap-y-6 rounded-xl px-6 py-4 text-sm">
        <div className="flex justify-center">
          <h1 className="text-base font-extrabold">북마크 삭제 안내</h1>
        </div>
        <div className="bg-bg-04 h-0.5 w-full" />
        <div className="flex flex-col items-center justify-between">
          <span>[{streamer.name}]</span>
          <span>북마크를 삭제 하시겠습니까?</span>
        </div>
        <div className="flex justify-center gap-x-2 p-5">
          <button
            type="button"
            className="bg-bg-04 hover:bg-bg-05 w-full cursor-pointer rounded-2xl px-5 py-3 font-semibold text-white"
            onClick={handleModalClose}
          >
            취소
          </button>
          <button
            type="button"
            className="bg-bg-chzzk-01 hover:bg-bg-chzzk-03 w-full cursor-pointer rounded-2xl px-5 py-3 font-semibold text-black"
            onClick={() => handleRemoveItem()}
          >
            삭제
          </button>
        </div>
      </div>
    </CommonModal>
  )
}
