import type {
  BookmarkItem,
  BookmarkState,
  BookmarkFolder,
  BookmarkNode,
} from '@/types/bookmark'
import type { IFollowingItem, IChannelContent } from '@/types/follow'
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core'

import {
  moveRootNode,
  moveItemInFolder,
  getBookmarkState,
  moveItemToOtherFolder,
  moveItemToRoot,
  moveItemToFolder,
} from '@/stores/bookmarkStore'

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

export function findNodeLocation(
  state: BookmarkState,
  id: UniqueIdentifier,
): {
  node: BookmarkNode | null
  parent: BookmarkFolder | null
  index: number
} {
  // 루트에서 직접 찾기
  const rootIdx = state.root.findIndex((n) => n.id === id)
  if (rootIdx !== -1) {
    return { node: state.root[rootIdx], parent: null, index: rootIdx }
  }

  // 폴더 내부에서 찾기
  for (const node of state.root) {
    if (node.type === 'folder') {
      const itemIdx = node.items.findIndex((item) => item.id === id)
      if (itemIdx !== -1) {
        return { node: node.items[itemIdx], parent: node, index: itemIdx }
      }
    }
  }
  return { node: null, parent: null, index: -1 }
}

export async function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over || active.id === over.id) return

  const state = await getBookmarkState()

  // active/over 위치 정보
  const activeLoc = findNodeLocation(state, active.id)
  const overLoc = findNodeLocation(state, over.id)

  if (!activeLoc.node || !overLoc.node) return

  // (1) 폴더 이동 (폴더는 루트에서만 이동 가능)
  if (
    activeLoc.node.type === 'folder' &&
    !activeLoc.parent &&
    !overLoc.parent
  ) {
    // 루트에서 위치 이동
    await moveRootNode(activeLoc.index, overLoc.index)
    return
  }

  // (2) 아이템 이동
  if (activeLoc.node.type === 'item') {
    // case 1: 같은 폴더 내 위치 이동
    if (
      activeLoc.parent &&
      overLoc.parent &&
      activeLoc.parent.id === overLoc.parent.id
    ) {
      await moveItemInFolder(
        activeLoc.parent.id,
        activeLoc.index,
        overLoc.index,
      )
      return
    }
    // case 2: 폴더 → 다른 폴더
    if (
      activeLoc.parent &&
      overLoc.parent &&
      activeLoc.parent.id !== overLoc.parent.id
    ) {
      await moveItemToOtherFolder(
        activeLoc.parent.id,
        overLoc.parent.id,
        activeLoc.index,
        overLoc.index,
      )
      return
    }
    // case 3: 폴더 → 루트
    if (activeLoc.parent && !overLoc.parent) {
      await moveItemToRoot(activeLoc.parent.id, activeLoc.index, overLoc.index)
      return
    }
    // case 4: 루트 → 폴더
    if (!activeLoc.parent && overLoc.parent) {
      await moveItemToFolder(activeLoc.index, overLoc.parent.id, overLoc.index)
      return
    }
    // case 5: 루트 내 위치 이동 (아이템)
    if (!activeLoc.parent && !overLoc.parent) {
      await moveRootNode(activeLoc.index, overLoc.index)
      return
    }
  }
}
