export interface BookmarkFolder {
  id: string
  name: string
  createdAt: number
}

export interface BookmarkItem {
  id: string
  hashId: string
  name: string
  profileImageUrl: string
  folderId?: string
  createdAt: number
}

export interface BookmarkState {
  folders: BookmarkFolder[]
  items: BookmarkItem[]
}
