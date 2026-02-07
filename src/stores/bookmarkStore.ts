import type {
  BookmarkFolder,
  BookmarkItem,
  BookmarkState,
} from '@/types/bookmark'

import { KEY, STORE_NAME } from '@/constants'
import { removeFolderState } from '@/stores/folderStateStore'
import { openDB } from '@/utils/db'

async function getState(): Promise<BookmarkState> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const req = store.get(KEY)
        req.onsuccess = () => resolve(req.result ?? { root: [] })
        req.onerror = () => reject(req.error)
      }),
  )
}

async function setState(state: BookmarkState): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const req = store.put(state, KEY)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      }),
  )
}

// 전체 데이터 불러오기
export async function getBookmarkState(): Promise<BookmarkState> {
  return getState()
}

// 전체 데이터 저장
export async function saveBookmarkState(state: BookmarkState): Promise<void> {
  await setState(state)
}

// 루트에 폴더 추가
export async function addBookmarkFolder(name: string): Promise<BookmarkFolder> {
  const state = await getBookmarkState()
  const folder: BookmarkFolder = {
    id: crypto.randomUUID(),
    type: 'folder',
    name: name.trim(),
    createdAt: Date.now(),
    items: [],
  }
  state.root.push(folder)
  await saveBookmarkState(state)
  return folder
}

// 루트에 아이템 추가
export async function addRootBookmarkItem(
  itemData: Omit<BookmarkItem, 'id' | 'type' | 'createdAt'>[],
) {
  const state = await getBookmarkState()

  const itemList: BookmarkItem[] = itemData.map((item) => {
    return {
      id: crypto.randomUUID(),
      type: 'item',
      hashId: item.hashId,
      name: item.name,
      profileImageUrl: item.profileImageUrl,
      createdAt: Date.now(),
    }
  })
  state.root = [...state.root, ...itemList]
  await saveBookmarkState(state)
}

// 폴더 내부에 아이템 추가
export async function addItemToFolder(
  folderId: string,
  itemData: Omit<BookmarkItem, 'id' | 'type' | 'createdAt'>[],
) {
  const state = await getBookmarkState()
  const folder = state.root.find(
    (node): node is BookmarkFolder =>
      node.type === 'folder' && node.id === folderId,
  )
  if (!folder) throw new Error('존재하지 않는 폴더입니다.')

  const itemList: BookmarkItem[] = itemData.map((item) => {
    return {
      id: crypto.randomUUID(),
      type: 'item',
      hashId: item.hashId,
      name: item.name,
      profileImageUrl: item.profileImageUrl,
      createdAt: Date.now(),
    }
  })
  folder.items.push(...itemList)
  await saveBookmarkState(state)
}

// 폴더 이름 변경
export async function renameBookmarkFolder(
  folderId: string,
  newName: string,
): Promise<BookmarkFolder | null> {
  const state = await getBookmarkState()
  const folder = state.root.find(
    (node): node is BookmarkFolder =>
      node.type === 'folder' && node.id === folderId,
  )
  if (!folder) return null

  if (
    state.root.some(
      (n) => n.type === 'folder' && n.name === newName && n.id !== folderId,
    )
  ) {
    throw new Error('이미 존재하는 폴더 이름입니다.')
  }
  folder.name = newName.trim()
  await saveBookmarkState(state)
  return folder
}

// 폴더 제거(내부 아이템 포함 삭제)
export async function removeBookmarkFolder(folderId: string): Promise<boolean> {
  const state = await getBookmarkState()
  const idx = state.root.findIndex(
    (n) => n.type === 'folder' && n.id === folderId,
  )
  if (idx === -1) return false
  state.root.splice(idx, 1)
  await saveBookmarkState(state)
  await removeFolderState(folderId)
  return true
}

// 아이템 제거(루트/폴더 내부 모두)
export async function removeBookmarkItem(itemId: string): Promise<boolean> {
  const state = await getBookmarkState()
  // 루트에서 삭제
  const idx = state.root.findIndex((n) => n.type === 'item' && n.id === itemId)
  if (idx !== -1) {
    state.root.splice(idx, 1)
    await saveBookmarkState(state)
    return true
  }
  // 폴더 내부에서 삭제
  for (const node of state.root) {
    if (node.type === 'folder') {
      const innerIdx = node.items.findIndex((item) => item.id === itemId)
      if (innerIdx !== -1) {
        node.items.splice(innerIdx, 1)
        await saveBookmarkState(state)
        return true
      }
    }
  }
  return false
}

// 루트 내에서 위치 이동
export async function moveRootNode(
  fromIdx: number,
  toIdx: number,
): Promise<void> {
  const state = await getBookmarkState()
  const arr = state.root
  if (fromIdx < 0 || fromIdx >= arr.length || toIdx < 0 || toIdx >= arr.length)
    return
  const [moved] = arr.splice(fromIdx, 1)
  arr.splice(toIdx, 0, moved)
  await saveBookmarkState(state)
}

// 폴더 내부에서 위치 이동
export async function moveItemInFolder(
  folderId: string,
  fromIdx: number,
  toIdx: number,
): Promise<void> {
  const state = await getBookmarkState()
  const folder = state.root.find(
    (node): node is BookmarkFolder =>
      node.type === 'folder' && node.id === folderId,
  )
  if (!folder) return
  const arr = folder.items
  if (fromIdx < 0 || fromIdx >= arr.length || toIdx < 0 || toIdx >= arr.length)
    return
  const [moved] = arr.splice(fromIdx, 1)
  arr.splice(toIdx, 0, moved)
  await saveBookmarkState(state)
}

// 폴더간 아이템 이동
export async function moveItemToOtherFolder(
  fromFolderId: string,
  toFolderId: string,
  fromIdx: number,
  toIdx: number,
) {
  const state = await getBookmarkState()
  const fromFolder = state.root.find(
    (n): n is BookmarkFolder => n.type === 'folder' && n.id === fromFolderId,
  )
  const toFolder = state.root.find(
    (n): n is BookmarkFolder => n.type === 'folder' && n.id === toFolderId,
  )
  if (!fromFolder || !toFolder) return

  const [item] = fromFolder.items.splice(fromIdx, 1)
  toFolder.items.splice(toIdx, 0, item)
  await saveBookmarkState(state)
}

// 폴더에서 루트로 아이템 이동
export async function moveItemToRoot(
  fromFolderId: string,
  fromIdx: number,
  toIdx: number,
) {
  const state = await getBookmarkState()
  const fromFolder = state.root.find(
    (n): n is BookmarkFolder => n.type === 'folder' && n.id === fromFolderId,
  )
  if (!fromFolder) return

  const [item] = fromFolder.items.splice(fromIdx, 1)
  state.root.splice(toIdx, 0, item)
  await saveBookmarkState(state)
}

// 루트에서 폴더로 아이템 이동
export async function moveItemToFolder(
  fromIdx: number,
  toFolderId: string,
  toIdx: number,
) {
  const state = await getBookmarkState()
  const toFolder = state.root.find(
    (n): n is BookmarkFolder => n.type === 'folder' && n.id === toFolderId,
  )
  if (!toFolder) return

  const [item] = state.root.splice(fromIdx, 1)

  if (item.type === 'item') {
    toFolder.items.splice(toIdx, 0, item)
    await saveBookmarkState(state)
  }
}
