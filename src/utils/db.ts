import {
  DB_NAME,
  DB_VERSION,
  FOLDER_STATE_STORE_NAME,
  SETTING_STORE_NAME,
  STORE_NAME,
} from '@/constants'

/**
 * IndexedDB 초기화 및 연결
 * 모든 ObjectStore를 한 곳에서 관리
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result

      // 모든 ObjectStore 생성 (없는 경우만)
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
      if (!db.objectStoreNames.contains(SETTING_STORE_NAME)) {
        db.createObjectStore(SETTING_STORE_NAME)
      }
      if (!db.objectStoreNames.contains(FOLDER_STATE_STORE_NAME)) {
        db.createObjectStore(FOLDER_STATE_STORE_NAME)
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
