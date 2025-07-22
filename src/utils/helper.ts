import type {
  BookmarkItem,
  BookmarkState,
  BookmarkFolder,
} from '@/types/bookmark'
import type { IFollowingItem, IChannelContent } from '@/types/follow'

import { moveRootNode, moveItemInFolder } from '@/stores/bookmarkStore'

type TransBookmarkDataInput = IFollowingItem | IChannelContent

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

export function transBookmarkData(
  item: TransBookmarkDataInput,
): Omit<BookmarkItem, 'id' | 'createdAt' | 'folderId' | 'type'> {
  if ('channel' in item) {
    return {
      hashId: item.channelId,
      name: item.channel.channelName,
      profileImageUrl: item.channel.channelImageUrl,
    }
  }
  return {
    hashId: item.channelId,
    name: item.channelName,
    profileImageUrl: item.channelImageUrl,
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

export function moveInArray<T>(
  array: T[],
  fromIdx: number,
  toIdx: number,
): T[] {
  const arr = [...array]
  const [removed] = arr.splice(fromIdx, 1)
  arr.splice(toIdx, 0, removed)
  return arr
}

// 아이템/폴더 이동
export async function moveDnDNode(
  from: { type: 'root' | 'folder'; parentId?: string; index: number },
  to: { type: 'root' | 'folder'; parentId?: string; index: number },
) {
  // root → root (폴더/아이템 위치변경)
  if (from.type === 'root' && to.type === 'root') {
    await moveRootNode(from.index, to.index)
    return null
  }

  // // root → 폴더 (아이템만 이동)
  // if (from.type === 'root' && to.type === 'folder' && to.parentId) {
  //   const node = rootList[from.index]
  //   if (node.type !== 'item') return state
  //   // 폴더에서 아이템 삽입
  //   rootList = [...rootList]
  //   rootList.splice(from.index, 1)
  //   const folderIdx = rootList.findIndex(
  //     (f) => f.type === 'folder' && f.id === to.parentId,
  //   )
  //   if (folderIdx === -1) return state
  //   const folder = rootList[folderIdx] as BookmarkFolder
  //   const newFolder = { ...folder, items: [...folder.items] }
  //   newFolder.items.splice(to.index, 0, node)
  //   rootList[folderIdx] = newFolder
  //   return { root: rootList }
  // }

  // // 폴더 → root (아이템만 이동)
  // if (from.type === 'folder' && from.parentId && to.type === 'root') {
  //   const folderIdx = rootList.findIndex(
  //     (f) => f.type === 'folder' && f.id === from.parentId,
  //   )
  //   if (folderIdx === -1) return state
  //   const folder = rootList[folderIdx] as BookmarkFolder
  //   const item = folder.items[from.index]
  //   const newFolder = { ...folder, items: [...folder.items] }
  //   newFolder.items.splice(from.index, 1)
  //   rootList = [...rootList]
  //   rootList[folderIdx] = newFolder
  //   rootList.splice(to.index, 0, item)
  //   return { root: rootList }
  // }

  // // 폴더 → 폴더 (아이템만 이동)
  if (
    from.type === 'folder' &&
    from.parentId &&
    to.type === 'folder' &&
    to.parentId
  ) {
    // 같은 폴더에서 이동: 순서만 변경
    if (from.parentId === to.parentId) {
      await moveItemInFolder(from.parentId, from.index, to.index)
      return
    }

    //   // 서로 다른 폴더 간 이동
    //   const fromFolderIdx = rootList.findIndex(
    //     (f) => f.type === 'folder' && f.id === from.parentId,
    //   )
    //   const toFolderIdx = rootList.findIndex(
    //     (f) => f.type === 'folder' && f.id === to.parentId,
    //   )
    //   if (fromFolderIdx === -1 || toFolderIdx === -1) return state
    //   const fromFolder = rootList[fromFolderIdx] as BookmarkFolder
    //   const toFolder = rootList[toFolderIdx] as BookmarkFolder
    //   const item = fromFolder.items[from.index]
    //   const newFromFolder = { ...fromFolder, items: [...fromFolder.items] }
    //   newFromFolder.items.splice(from.index, 1)
    //   const newToFolder = { ...toFolder, items: [...toFolder.items] }
    //   newToFolder.items.splice(to.index, 0, item)
    //   rootList = [...rootList]
    //   rootList[fromFolderIdx] = newFromFolder
    //   rootList[toFolderIdx] = newToFolder
    //   return { root: rootList }
  }
  return
}
