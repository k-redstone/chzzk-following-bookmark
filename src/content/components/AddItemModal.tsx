import { Trash } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { BookmarkItem, BookmarkFolder } from '@/types/bookmark'
import type { IFollowingListContent, IFollowingItem } from '@/types/follow'

import CommonModal from '@/content/components/CommonModal'
import { addItemToFolder, addRootBookmarkItem } from '@/stores/bookmarkStore'
import { sendRuntimeMessage } from '@/utils/helper'

interface IAddItemModalProps {
  handleModalClose: () => void
  folder?: BookmarkFolder
}
export default function AddItemModal({
  handleModalClose,
  folder,
}: IAddItemModalProps) {
  const [searchStreamerName, setSearchStreamerName] = useState<string>('')
  const [followData, setFollowData] = useState<IFollowingListContent | null>(
    null,
  )
  const [selectedStreamer, setSelectedStreamer] = useState<
    Omit<BookmarkItem, 'id' | 'createdAt' | 'folderId' | 'type'>[]
  >([])
  const fetchFollowingList = async () => {
    const result =
      await sendRuntimeMessage<IFollowingListContent>('fetchFollowList')

    setFollowData(result)
  }

  const filterStreamerList = (name: string) => {
    if (!followData) return []

    const list = followData.followingList || []

    if (name.trim() === '') return list

    return list.filter((item) =>
      item.channel.channelName
        .toLowerCase()
        .includes(name.trim().toLowerCase()),
    )
  }
  const filteredList = filterStreamerList(searchStreamerName)

  const handleAddSelectStreamer = (item: IFollowingItem) => {
    if (
      selectedStreamer.some((streamer) => streamer.hashId === item.channelId)
    ) {
      return null
    }
    const data = {
      hashId: item.channelId,
      name: item.channel.channelName,
      profileImageUrl: item.channel.channelImageUrl,
    }
    setSelectedStreamer((prev) => {
      return [data, ...prev]
    })
  }

  const handleRemoveSelectStreamer = (
    streamer: Omit<BookmarkItem, 'id' | 'createdAt' | 'folderId' | 'type'>,
  ) => {
    setSelectedStreamer((prev) => {
      return prev.filter((item) => item.hashId !== streamer.hashId)
    })
  }

  const handleAddItemToBookmark = () => {
    if (folder) {
      addItemToFolder(folder.id, selectedStreamer)
      handleModalClose()
      return
    }

    addRootBookmarkItem(selectedStreamer)
    handleModalClose()
    return
  }

  useEffect(() => {
    fetchFollowingList()
  }, [])

  return (
    <CommonModal handleModalClose={handleModalClose}>
      <div className="bg-foreground flex h-[550px] w-[40rem] flex-col gap-y-6 rounded-xl px-6 py-4 text-sm">
        <div className="flex justify-center">
          <h1 className="text-base font-extrabold">스트리머 추가</h1>
        </div>
        <div className="bg-bg-04 h-0.5 w-full" />

        {/* 메인 창 */}
        <div className="flex gap-x-3">
          {/* 왼쪽 */}
          <div className="flex flex-col gap-y-3">
            <p className="text-center font-extrabold">나의 팔로잉 목록</p>
            <div className="flex justify-center">
              <input
                className={`border-border-chzzk-04 caret-bg-chzzk-04 w-full rounded-2xl border px-4 py-2 focus:outline-none`}
                placeholder="스트리머 검색"
                value={searchStreamerName}
                onChange={(e) => setSearchStreamerName(e.target.value)}
              />
            </div>
            <div className="flex h-[250px] flex-col gap-y-4 overflow-y-scroll px-2">
              {filteredList.map((follow) => (
                <div
                  key={follow.channelId}
                  className="hover:bg-bg-04 flex cursor-pointer items-center gap-x-2 rounded-2xl p-1"
                  onClick={() => handleAddSelectStreamer(follow)}
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full">
                    <img
                      className="h-full w-full object-cover"
                      src={follow.channel.channelImageUrl}
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
            <div className="flex justify-center">
              <input
                className={`border-border-chzzk-04 caret-bg-chzzk-04 w-full rounded-2xl border px-4 py-2 focus:outline-none`}
                placeholder="uuid로 추가"
              />
            </div>
            <div className="flex h-[250px] flex-col gap-y-4 overflow-y-scroll px-2">
              {selectedStreamer.map((streamer) => (
                <div
                  key={streamer.hashId}
                  className="bg-bg-04 flex cursor-pointer items-center justify-between rounded-2xl p-1"
                >
                  <div className="flex items-center gap-x-2">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <img
                        className="h-full w-full object-cover"
                        src={streamer.profileImageUrl}
                        alt={streamer.name}
                      />
                    </div>
                    <span>{streamer.name}</span>
                  </div>
                  <Trash
                    className="text-red-500 hover:text-red-300"
                    onClick={() => handleRemoveSelectStreamer(streamer)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* footer 버튼 */}
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
            onClick={() => handleAddItemToBookmark()}
          >
            추가
          </button>
        </div>
      </div>
    </CommonModal>
  )
}
