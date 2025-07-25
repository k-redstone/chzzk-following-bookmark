import type {
  BookmarkFolder,
  BookmarkItem,
  BookmarkNode,
  BookmarkState,
} from '@/types/bookmark'
import type { ISettingState } from '@/types/setting'

interface IImportData {
  bookmark: BookmarkState
  setting: ISettingState
}

export function downloadJson(data: object, filename = 'export.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

export function readJsonFile(file: File): Promise<IImportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        resolve(data)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        reject(new Error('JSON 파싱 에러'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export function isValidImportData(data: IImportData): boolean {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('bookmark' in data) ||
    !('setting' in data) ||
    !isBookmarkState(data.bookmark) ||
    !isISettingState(data.setting)
  )
    return false

  return true
}

function isBookmarkItem(node: unknown): node is BookmarkItem {
  if (typeof node !== 'object' || node === null) return false

  const item = node as Record<string, unknown>
  return (
    item.type === 'item' &&
    typeof item.id === 'string' &&
    typeof item.hashId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.profileImageUrl === 'string' &&
    typeof item.createdAt === 'number'
  )
}

function isBookmarkFolder(node: unknown): node is BookmarkFolder {
  if (typeof node !== 'object' || node === null) return false

  const folder = node as Record<string, unknown>
  return (
    folder.type === 'folder' &&
    typeof folder.id === 'string' &&
    typeof folder.name === 'string' &&
    typeof folder.createdAt === 'number' &&
    Array.isArray(folder.items) &&
    folder.items.every(isBookmarkItem)
  )
}

function isBookmarkNode(node: unknown): node is BookmarkNode {
  return isBookmarkFolder(node) || isBookmarkItem(node)
}

export function isBookmarkState(data: unknown): data is BookmarkState {
  if (typeof data !== 'object' || data === null) return false

  const maybeRoot = (data as Record<string, unknown>).root
  return Array.isArray(maybeRoot) && maybeRoot.every(isBookmarkNode)
}

function isISettingState(data: unknown): data is ISettingState {
  if (typeof data !== 'object' || data === null) return false

  const keys: (keyof ISettingState)[] = [
    'following',
    'category',
    'partner',
    'service',
    'chatting_power',
  ]

  return keys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(data, key) &&
      typeof (data as Record<string, unknown>)[key] === 'boolean',
  )
}
