import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useEffect, useMemo, useState } from 'react'

import StreamerItem from '@/content/components/card/StreamerItem'
import FolderItem from '@/content/components/FolderItem'
import useBookmarkState from '@/content/hooks/queries/useBookmarkState'
import { useStreamerLiveStatusAll } from '@/content/hooks/queries/useStreamerLiveStatusAll'
import useNavExpanded from '@/content/hooks/useNavExpanded'
import {
  getPopupSettings,
  subscribePopupSettings,
} from '@/content/state/PopupSettings'
import { deriveIndex } from '@/utils/liveStatus'
import { enrichBookmarkTree } from '@/utils/liveStatus'

export default function BookmarkList() {
  const { data: bookmarkData, isSuccess } = useBookmarkState()
  const isNavExpanded = useNavExpanded()
  const [isShowLiveFirst, setIsShowLiveFirst] = useState<boolean>(
    getPopupSettings().showLiveFirst,
  )

  const index = useMemo(() => {
    if (!bookmarkData || !bookmarkData.root) return null
    return deriveIndex(bookmarkData.root)
  }, [bookmarkData])

  const { liveMap, isLoading } = useStreamerLiveStatusAll(
    index?.allUniqueIdsForFetch ?? [],
  )

  const enrichedRoot = useMemo(() => {
    if (!bookmarkData?.root || isLoading) return null
    return enrichBookmarkTree(bookmarkData.root, liveMap, isShowLiveFirst)
  }, [bookmarkData, liveMap, isShowLiveFirst, isLoading])

  useEffect(() => {
    const unsub = subscribePopupSettings((s) =>
      setIsShowLiveFirst(s.showLiveFirst),
    )
    return () => unsub()
  }, [])

  if (!isSuccess) return null

  return (
    <SortableContext
      items={bookmarkData.root}
      strategy={verticalListSortingStrategy}
    >
      <ul className={`flex flex-col`}>
        {enrichedRoot?.map((node) => {
          if (node.type === 'folder') {
            return (
              <li key={node.id}>
                <FolderItem
                  key={node.id}
                  folder={node}
                />
              </li>
            )
          }
          return (
            <li key={node.id}>
              <StreamerItem
                isNavExpanded={isNavExpanded}
                streamer={node}
                inFolder={false}
              />
            </li>
          )
        })}
      </ul>
    </SortableContext>
  )
}
