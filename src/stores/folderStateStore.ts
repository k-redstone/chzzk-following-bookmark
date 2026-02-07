import type { IFolderStateMap } from '@/types/folderState'

import { FOLDER_STATE_KEY, FOLDER_STATE_STORE_NAME } from '@/constants'
import { openDB } from '@/utils/db'

async function getState(): Promise<IFolderStateMap> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(FOLDER_STATE_STORE_NAME, 'readonly')
        const store = tx.objectStore(FOLDER_STATE_STORE_NAME)
        const req = store.get(FOLDER_STATE_KEY)
        req.onsuccess = () => resolve(req.result ?? {})
        req.onerror = () => reject(req.error)
      }),
  )
}

async function setState(state: IFolderStateMap): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(FOLDER_STATE_STORE_NAME, 'readwrite')
        const store = tx.objectStore(FOLDER_STATE_STORE_NAME)
        const req = store.put(state, FOLDER_STATE_KEY)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      }),
  )
}

// 전체 상태 조회
export async function getFolderStateMap(): Promise<IFolderStateMap> {
  return getState()
}

// 특정 폴더 상태 조회
export async function getFolderState(folderId: string): Promise<boolean> {
  const map = await getState()
  return map[folderId] ?? false
}

// 특정 폴더 상태 토글
export async function toggleFolderState(folderId: string): Promise<boolean> {
  const map = await getState()
  const newState = !map[folderId]
  map[folderId] = newState
  await setState(map)
  return newState
}

// 특정 폴더 상태 설정
export async function setFolderState(
  folderId: string,
  isOpen: boolean,
): Promise<void> {
  const map = await getState()
  map[folderId] = isOpen
  await setState(map)
}

// 폴더 삭제 시 상태도 제거
export async function removeFolderState(folderId: string): Promise<void> {
  const map = await getState()
  delete map[folderId]
  await setState(map)
}
