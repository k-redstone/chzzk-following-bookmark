import type { ILiveStatusMap } from '@/content/hooks/queries/useStreamerLiveStatusAll'
import type {
  BookmarkFolder,
  BookmarkItem,
  EnrichedRoot,
  EnrichedFolder,
  EnrichedItem,
} from '@/types/bookmark'

export type HashId = string

export type BookmarkRoot = Array<BookmarkFolder | BookmarkItem>

export interface FolderIndex {
  folderId: string
  folderName: string
  orderedIdsWithDup: HashId[]
  uniqueIdsForFetch: HashId[]
}
export interface BookmarkIndex {
  byFolder: Record<string, FolderIndex>
  allUniqueIdsForFetch: HashId[]
}

const ROOT_ID = 'ROOT'
const ROOT_NAME = '전체'

export function deriveIndex(root: BookmarkRoot): BookmarkIndex {
  const byFolder: Record<string, FolderIndex> = {}
  const allIdsForFetch: HashId[] = []

  const rootItems = root.filter((n) => n.type === 'item') as BookmarkItem[]
  if (rootItems.length) {
    const withDup = rootItems.map((i) => i.hashId)
    const unique = uniqueStable(withDup)
    byFolder[ROOT_ID] = {
      folderId: ROOT_ID,
      folderName: ROOT_NAME,
      orderedIdsWithDup: withDup,
      uniqueIdsForFetch: unique,
    }
    allIdsForFetch.push(...withDup)
  }

  const folders = root.filter((n) => n.type === 'folder') as BookmarkFolder[]
  for (const f of folders) {
    const items = (f.items ?? []).filter(
      (i) => i.type === 'item',
    ) as BookmarkItem[]
    const withDup = items.map((i) => i.hashId)
    const unique = uniqueStable(withDup)
    byFolder[f.id] = {
      folderId: f.id,
      folderName: f.name,
      orderedIdsWithDup: withDup,
      uniqueIdsForFetch: unique,
    }
    allIdsForFetch.push(...withDup)
  }

  return {
    byFolder,
    allUniqueIdsForFetch: uniqueStable(allIdsForFetch),
  }
}

function uniqueStable(xs: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const x of xs) {
    if (!seen.has(x)) {
      seen.add(x)
      out.push(x)
    }
  }
  return out
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  worker: (t: T) => Promise<R>,
  concurrency = 8,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let i = 0
  async function runner() {
    while (i < items.length) {
      const cur = i++
      results[cur] = await worker(items[cur])
    }
  }
  const n = Math.max(1, Math.min(concurrency, items.length))
  await Promise.all(Array.from({ length: n }, () => runner()))
  return results
}

export interface FolderView {
  renderedIds: HashId[]
  liveCountInFolder: number
  failedIdsInFolder?: HashId[]
}

export function selectFolderView(
  orderedIdsWithDup: HashId[],
  liveMap: ILiveStatusMap,
  liveFirst: boolean,
  failedIds?: HashId[],
): FolderView {
  // 라이브 카운트(중복 포함)
  let liveCount = 0
  for (const id of orderedIdsWithDup)
    if (liveMap[id]?.status === 'OPEN') liveCount++

  // 정렬
  let renderedIds: HashId[]
  if (liveFirst) {
    const lives: HashId[] = []
    const rests: HashId[] = []
    for (const id of orderedIdsWithDup) {
      if (liveMap[id]?.status === 'OPEN') lives.push(id)
      else rests.push(id)
    }
    renderedIds = lives.concat(rests) // 원래 순서 보존하면서 라이브 먼저
  } else {
    renderedIds = orderedIdsWithDup // 원래 순서 유지
  }

  let failedInFolder: HashId[] | undefined
  if (failedIds?.length) {
    const set = new Set(failedIds)
    failedInFolder = orderedIdsWithDup.filter((id) => set.has(id))
  }

  return {
    renderedIds,
    liveCountInFolder: liveCount,
    failedIdsInFolder: failedInFolder,
  }
}

export function enrichBookmarkTree(
  root: Array<BookmarkFolder | BookmarkItem>,
  livemap: ILiveStatusMap,
  liveFirst: boolean,
): EnrichedRoot {
  const isItem = (n: any): n is BookmarkItem => n?.type === 'item'
  const isFolder = (n: any): n is BookmarkFolder => n?.type === 'folder'

  function enrichFolder(folder: BookmarkFolder): EnrichedFolder {
    const enrichedChildren: Array<EnrichedItem | EnrichedFolder> = []
    let liveCount = 0
    // 1) 자식들을 먼저 Enrich
    for (const child of folder.items ?? []) {
      if (isItem(child)) {
        const live = livemap[child.hashId]
        const enriched: EnrichedItem = {
          ...child,
          liveInfo: live,
        }
        if (enriched.liveInfo && enriched.liveInfo.status === 'OPEN')
          liveCount += 1
        enrichedChildren.push(enriched)
      } else if (isFolder(child)) {
        const enriched = enrichFolder(child)
        // 폴더 하위 라이브 갯수는 독립 폴더에서 쓰도록 유지
        enrichedChildren.push(enriched)
      }
    }

    // 2) 정렬: liveFirst면 라이브 먼저(원래 순서 유지), 아니면 원순서
    let ordered = enrichedChildren
    if (liveFirst) {
      const lives: typeof enrichedChildren = []
      const rests: typeof enrichedChildren = []
      for (const n of enrichedChildren) {
        if ('type' in n && n.type === 'item') {
          if ((n as EnrichedItem).liveInfo.status === 'OPEN') lives.push(n)
          else rests.push(n)
        } else {
          // 폴더는 위치 고정(원하면 폴더도 분리할 수 있음)
          rests.push(n)
        }
      }
      ordered = [...lives, ...rests]
    }

    return {
      ...folder,
      items: ordered,
      meta: { liveCount },
    }
  }

  // 루트는 폴더와 아이템이 혼재 → 폴더만 정렬 규칙 적용, 아이템은 필요 시 개별 폴더처럼 처리 가능
  const out: EnrichedRoot = []
  for (const node of root) {
    if (isItem(node)) {
      const live = livemap[node.hashId]
      const enriched: EnrichedItem = {
        ...node,
        liveInfo: live,
      }
      out.push(enriched)
    } else if (isFolder(node)) {
      out.push(enrichFolder(node))
    }
  }
  return out
}
