import type { ILiveContent } from '@/types/follow'

type BookmarkNodeType = 'folder' | 'item'

export interface BookmarkFolder {
  id: string
  type: 'folder'
  name: string
  createdAt: number
  items: BookmarkItem[]
}

export interface BookmarkItem {
  id: string
  type: 'item'
  hashId: string
  name: string
  profileImageUrl: string
  createdAt: number
}
export type BookmarkNode = BookmarkFolder | BookmarkItem

export interface BookmarkState {
  root: BookmarkNode[]
}

// bookmark & livestatus 통합
type EnrichedItem = BookmarkItem & {
  liveInfo: ILiveContent
}
type EnrichedFolder = Omit<BookmarkFolder, 'items'> & {
  items: Array<EnrichedItem>
  meta: { liveCount: number }
}
type EnrichedRoot = Array<EnrichedItem | EnrichedFolder>
