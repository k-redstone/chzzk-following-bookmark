import type {
  BookmarkState,
  BookmarkFolder,
  BookmarkItem,
} from '@content/types/bookmark'

const STORAGE_KEY = 'bookmarkState'

// 북마크 불러오기
export async function getBookmarkState(): Promise<BookmarkState> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEY], (res) =>
      resolve(res[STORAGE_KEY] ?? { folders: [], items: [] }),
    )
  })
}

// 북마크 전체 저장
export async function saveBookmarkState(state: BookmarkState): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: state }, resolve)
  })
}

// 폴더 추가
export async function addBookmarkFolder(name: string): Promise<BookmarkFolder> {
  const state = await getBookmarkState()
  const folder: BookmarkFolder = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: Date.now(),
  }
  state.folders.push(folder)
  await saveBookmarkState(state)
  return folder
}

// 루트에 단일 아이템 추가
export async function addRootBookmarkItem(
  itemData: Omit<BookmarkItem, 'id' | 'createdAt' | 'folderId'>,
): Promise<BookmarkItem> {
  const state = await getBookmarkState()
  const item: BookmarkItem = {
    id: crypto.randomUUID(),
    name: itemData.name,
    hashId: itemData.hashId,
    profileImageUrl: itemData.profileImageUrl,
    createdAt: Date.now(),
  }
  state.items = state.items || []
  state.items.push(item)
  await saveBookmarkState(state)
  return item
}

// 폴더에 단일 아이템 추가
export async function addFolderBookmarkItem(
  folderId: string,
  itemData: Omit<BookmarkItem, 'id' | 'createdAt' | 'folderId'>,
): Promise<BookmarkItem> {
  const state = await getBookmarkState()
  const folderExists = state.folders.some((f) => f.id === folderId)
  if (!folderExists) throw new Error('존재하지 않는 폴더입니다.')

  const item: BookmarkItem = {
    id: crypto.randomUUID(),
    name: itemData.name,
    hashId: itemData.hashId,
    profileImageUrl: itemData.profileImageUrl,
    createdAt: Date.now(),
    folderId,
  }
  state.items = state.items || []
  state.items.push(item)
  await saveBookmarkState(state)
  return item
}

// 폴더 이름 수정
export async function renameBookmarkFolder(
  folderId: string,
  newName: string,
): Promise<BookmarkFolder | null> {
  const state = await getBookmarkState()
  const folder = state.folders.find((f) => f.id === folderId)
  if (!folder) return null

  if (state.folders.some((f) => f.name === newName && f.id !== folderId)) {
    throw new Error('이미 존재하는 폴더 이름입니다.')
  }
  folder.name = newName.trim()
  await saveBookmarkState(state)
  return folder
}

// 폴더 제거
export async function removeBookmarkFolder(folderId: string): Promise<boolean> {
  const state = await getBookmarkState()

  const folderIdx = state.folders.findIndex((f) => f.id === folderId)
  if (folderIdx === -1) return false
  state.folders.splice(folderIdx, 1)

  state.items = state.items.filter((item) => item.folderId !== folderId)

  await saveBookmarkState(state)
  return true
}

// 아이템 제거
export async function removeBookmarkItem(itemId: string): Promise<boolean> {
  const state = await getBookmarkState()
  const idx = state.items.findIndex((item) => item.id === itemId)
  if (idx === -1) return false
  state.items.splice(idx, 1)
  await saveBookmarkState(state)
  return true
}
