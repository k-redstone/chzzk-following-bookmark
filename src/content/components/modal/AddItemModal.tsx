import { Trash, Search, X } from 'lucide-react'
import { useState } from 'react'

import type { BookmarkItem, BookmarkFolder } from '@/types/bookmark'
import type { IFollowingItem, IChannelContent } from '@/types/follow'

import { DEFAULT_IMAGE_URL } from '@/constants'
import CommonModal from '@/content/components/modal/CommonModal'
import useBookmarkState from '@/content/hooks/queries/useBookmarkState'
import useFollowList from '@/content/hooks/queries/useFollowList'
import { addItemToFolder, addRootBookmarkItem } from '@/stores/bookmarkStore'
import {
  searchStreamerToFollowList,
  isStreamerAlreadySelected,
  transBookmarkData,
  filterNotInFolder,
  sendRuntimeMessage,
} from '@/utils/helper'

interface IAddItemModalProps {
  handleModalClose: () => void
  folder?: BookmarkFolder
  root?: BookmarkItem[]
}
export default function AddItemModal({
  handleModalClose,
  folder,
  root,
}: IAddItemModalProps) {
  const { data: followData } = useFollowList()
  const { invalidate } = useBookmarkState()
  const [searchStreamerName, setSearchStreamerName] = useState<string>('')
  const [searchUUID, setSearchUUID] = useState<string>('')
  const [searchUUIDErr, setSearchUUIDErr] = useState<boolean>(false)
  const [searchUUIDMsg, setSearchUUIDMsg] = useState<string>('')

  const [selectedStreamer, setSelectedStreamer] = useState<
    Omit<BookmarkItem, 'id' | 'createdAt' | 'folderId' | 'type'>[]
  >([])

  const filteredList = filterNotInFolder(
    followData,
    folder ? folder?.items : root,
  )

  const searchList = searchStreamerToFollowList(
    filteredList,
    searchStreamerName,
  )

  const handleSearchStreamerByUUID = async () => {
    if (searchUUID.trim() === '') return

    const result: IChannelContent = await sendRuntimeMessage(
      'fetchChannelStatus',
      searchUUID,
    )

    if (result === null) {
      setSearchUUIDErr(true)
      setSearchUUIDMsg('UUID로 스트리머를 찾지 못했습니다.')
      setSearchUUID('')
      return
    }

    handleDeleteUUIDSeearch()
    handleAddSelectStreamer(result)
  }

  const handleAddSelectStreamer = (item: IFollowingItem | IChannelContent) => {
    if (isStreamerAlreadySelected(selectedStreamer, item.channelId)) return null

    setSelectedStreamer((prev) => [transBookmarkData(item), ...prev])
  }

  const handleRemoveSelectStreamer = (
    streamer: Omit<BookmarkItem, 'id' | 'createdAt' | 'folderId' | 'type'>,
  ) => {
    setSelectedStreamer((prev) => {
      return prev.filter((item) => item.hashId !== streamer.hashId)
    })
  }

  const handleAddItemToBookmark = async () => {
    if (searchUUID.trim() !== '') {
      setSearchUUIDErr(true)
      setSearchUUIDMsg(
        'UUID로 추가하지 않은 항목이 있습니다. Enter 또는 검색 아이콘을 눌러 추가해주세요.',
      )
      return
    }

    if (folder) {
      await addItemToFolder(folder.id, selectedStreamer)
      invalidate()
      handleModalClose()
      return
    }

    await addRootBookmarkItem(selectedStreamer)
    invalidate()
    handleModalClose()
    return
  }

  const handleDeleteUUIDSeearch = () => {
    setSearchUUID('')
    setSearchUUIDMsg('')
    setSearchUUIDErr(false)
  }

  return (
    <CommonModal handleModalClose={handleModalClose}>
      <div className="dark:bg-foreground flex h-[550px] w-[40rem] flex-col gap-y-6 rounded-xl bg-white px-6 py-4 text-sm">
        <div className="flex justify-center">
          <h1 className="text-base font-extrabold">스트리머 추가</h1>
        </div>
        <div className="dark:bg-bg-04 bg-content-hover-01 h-0.5 w-full" />

        {/* 메인 창 */}
        <div className="flex gap-x-3">
          {/* 왼쪽 */}
          <div className="flex flex-col gap-y-3">
            <p className="text-center font-extrabold">나의 팔로잉 목록</p>
            <div className="flex justify-center">
              <input
                className={`dark:border-border-chzzk-04 dark:caret-bg-chzzk-04 border-bg-chzzk-light-01 caret-bg-chzzk-light-01 w-full rounded-2xl border px-4 py-2 focus:outline-none`}
                placeholder="스트리머 검색"
                value={searchStreamerName}
                onChange={(e) => setSearchStreamerName(e.target.value)}
              />
            </div>
            <div className="flex h-[250px] flex-col gap-y-4 overflow-y-scroll px-2">
              {searchList.map((follow) => (
                <div
                  key={follow.channelId}
                  className="dark:hover:bg-bg-04 hover:bg-content-hover-02 flex cursor-pointer items-center gap-x-2 rounded-2xl p-1"
                  onClick={() => handleAddSelectStreamer(follow)}
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full">
                    <img
                      className="h-full w-full object-cover"
                      src={
                        follow.channel.channelImageUrl === ''
                          ? DEFAULT_IMAGE_URL
                          : follow.channel.channelImageUrl
                      }
                      alt={follow.channel.channelName}
                    />
                  </div>
                  <span>{follow.channel.channelName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽 */}
          <div className="flex grow flex-col gap-y-3">
            <p className="text-center font-extrabold">추가된 목록</p>
            <form
              className="relative flex items-center justify-center"
              onSubmit={(e) => {
                e.preventDefault()
                handleSearchStreamerByUUID()
              }}
            >
              <input
                className={`dark:border-border-chzzk-04 dark:caret-bg-chzzk-04 border-bg-chzzk-light-01 caret-bg-chzzk-light-01 w-full rounded-2xl border px-4 py-2 focus:outline-none`}
                placeholder="uuid로 추가"
                value={searchUUID}
                onChange={(e) => setSearchUUID(e.target.value)}
              />
              <div className="absolute right-5 flex h-3 w-11 gap-x-2">
                <Search
                  onClick={() => handleSearchStreamerByUUID()}
                  className="text-bg-chzzk-light-01 cursor-pointer"
                />
                <X
                  onClick={() => handleDeleteUUIDSeearch()}
                  className="cursor-pointer text-red-400"
                />
              </div>
            </form>
            <div className="flex h-[250px] flex-col gap-y-4 overflow-y-scroll px-2">
              {selectedStreamer.map((streamer) => (
                <div
                  key={streamer.hashId}
                  className="dark:bg-bg-04 bg-content-hover-02 flex cursor-pointer items-center justify-between rounded-2xl p-1"
                >
                  <div className="flex items-center gap-x-2">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <img
                        className="h-full w-full object-cover"
                        src={
                          streamer.profileImageUrl === ''
                            ? DEFAULT_IMAGE_URL
                            : streamer.profileImageUrl
                        }
                        alt={streamer.name}
                      />
                    </div>
                    <span>{streamer.name}</span>
                  </div>
                  <Trash
                    className="text-warn-light hover:text-red-300 dark:text-red-500"
                    onClick={() => handleRemoveSelectStreamer(streamer)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* footer 버튼 */}
        <div className="flex-col gap-y-4">
          <div className="flex items-center justify-center">
            <span className="text-red-300">
              {searchUUIDErr && `${searchUUIDMsg}`}
            </span>
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
              onClick={() => handleAddItemToBookmark()}
            >
              완료 ({selectedStreamer.length}명)
            </button>
          </div>
        </div>
      </div>
    </CommonModal>
  )
}
