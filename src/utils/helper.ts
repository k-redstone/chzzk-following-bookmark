import type { BookmarkItem } from '@/types/bookmark'
import type { IFollowingItem } from '@/types/follow'

export function sendRuntimeMessage<T>(
  type: string,
  ...args: unknown[]
): Promise<T> {
  return chrome.runtime.sendMessage({ type, args }) as Promise<T>
}

// 아이템 추가 관련 헬퍼 함수들

export function searchStreamerToFollowList(
  followList: IFollowingItem[] | undefined,
  name: string,
) {
  if (!followList) return []

  const list = followList || []

  if (name.trim() === '') return list

  return list.filter((item) =>
    item.channel.channelName.toLowerCase().includes(name.trim().toLowerCase()),
  )
}

export function isStreamerAlreadySelected(
  selected: Omit<BookmarkItem, 'id' | 'createdAt' | 'folderId' | 'type'>[],
  channelId: string,
): boolean {
  return selected.some((streamer) => streamer.hashId === channelId)
}

export function transBookmarkData(item: IFollowingItem) {
  return {
    hashId: item.channelId,
    name: item.channel.channelName,
    profileImageUrl: item.channel.channelImageUrl,
  }
}

export function filterNotInFolder(
  followingList: IFollowingItem[] | undefined,
  folderItems: BookmarkItem[] | undefined,
) {
  const hashSet = new Set((folderItems ?? []).map((item) => item.hashId))
  return (followingList ?? []).filter(
    (follow) => !hashSet.has(follow.channelId),
  )
}
