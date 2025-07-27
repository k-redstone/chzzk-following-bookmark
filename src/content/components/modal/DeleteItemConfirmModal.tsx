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
      <div className="dark:bg-foreground flex w-[32rem] flex-col gap-y-6 rounded-xl bg-white px-6 py-4 text-sm">
        <div className="flex justify-center">
          <h1 className="text-base font-extrabold">북마크 삭제 안내</h1>
        </div>
        <div className="dark:bg-bg-04 bg-content-hover-01 h-0.5 w-full" />
        <div className="flex flex-col items-center justify-between">
          <span>[{streamer.name}]</span>
          <span>북마크를 삭제 하시겠습니까?</span>
        </div>
        <div className="flex justify-center gap-x-2 p-5">
          <button
            type="button"
            className="dark:dark:bg-bg-04 dark:hover:bg-bg-05 bg-content-hover-02 hover:bg-content-hover-03 w-full cursor-pointer rounded-2xl px-5 py-3 font-semibold"
            onClick={handleModalClose}
          >
            취소
          </button>
          <button
            type="button"
            className="dark:bg-bg-chzzk-01 dark:hover:bg-bg-chzzk-03 bg-bg-chzzk-light-01 hover:bg-bg-chzzk-light-02 w-full cursor-pointer rounded-2xl border px-5 py-3 font-semibold text-white dark:text-black"
            onClick={() => handleRemoveItem()}
          >
            삭제
          </button>
        </div>
      </div>
    </CommonModal>
  )
}
