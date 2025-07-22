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
