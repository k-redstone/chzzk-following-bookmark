import type {
  ISettingSliderOnChangeOptions,
  ISettingState,
} from '@/types/setting'

import { DB_NAME, SETTING_KEY, SETTING_STORE_NAME } from '@/constants'
import { sendRuntimeMessage } from '@/utils/helper'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(SETTING_STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getState(): Promise<ISettingState> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(SETTING_STORE_NAME, 'readonly')
        const store = tx.objectStore(SETTING_STORE_NAME)
        const req = store.get(SETTING_KEY)
        req.onsuccess = () =>
          resolve(
            req.result ?? {
              following: true,
              category: true,
              partner: true,
              service: true,
              preview: true,
              chatting_power: true,
              preview_view_width: 380,
              preview_volume: 10,
              show_live_first: false,
            },
          )
        req.onerror = () => reject(req.error)
      }),
  )
}

async function setState(state: ISettingState): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(SETTING_STORE_NAME, 'readwrite')
        const store = tx.objectStore(SETTING_STORE_NAME)
        const req = store.put(state, SETTING_KEY)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      }),
  )
}

// 전체 데이터 불러오기
export async function getSettingState(): Promise<ISettingState> {
  return getState()
}

// 전체 데이터 저장
export async function saveSettingState(state: ISettingState): Promise<void> {
  await setState(state)
}

// Setting on/off
export async function toggleSettingTab<K extends keyof ISettingState>(
  key: K,
): Promise<ISettingState> {
  const prevState = await getSettingState()

  const nextState: ISettingState = {
    ...prevState,
    [key]: !prevState[key],
  }
  await saveSettingState(nextState)
  await sendRuntimeMessage('setSettingState', JSON.stringify(nextState))
  return nextState
}

export async function setSettingKey<K extends keyof ISettingState>(
  key: K,
  value: ISettingState[K],
): Promise<ISettingState> {
  const prevState = await getSettingState()
  const nextState: ISettingState = { ...prevState, [key]: value }
  await saveSettingState(nextState)
  await sendRuntimeMessage('setSettingState', JSON.stringify(nextState))
  return nextState
}
export function settingSliderOnChange<K extends keyof ISettingState>(
  key: K,
  options?: ISettingSliderOnChangeOptions,
): (next: number) => void {
  const debounceMs = options?.debounceMs ?? 150

  let t: number | undefined
  let lastValue: number | undefined
  let version = 0

  const flush = async (ticket: number) => {
    if (lastValue === undefined || ticket !== version) return
    const nextState = await setSettingKey(key, lastValue as ISettingState[K])
    if (options?.onSaved) await options.onSaved(nextState)
  }

  return (next: number) => {
    if (options?.onLocal) options.onLocal(next)

    lastValue = next
    version += 1
    const ticket = version
    if (t !== undefined) window.clearTimeout(t)
    t = window.setTimeout(() => void flush(ticket), debounceMs)
  }
}
