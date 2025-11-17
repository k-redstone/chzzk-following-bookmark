import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useEffect, useMemo, useState } from 'react'

import StreamerItem from '@/content/components/card/StreamerItem'
import StreamerItem_old from '@/content/components/card/StreamerItem_old'
import FolderItem from '@/content/components/FolderItem'
import FolderItem_old from '@/content/components/FolderItem_old'
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
    if (!bookmarkData?.root || isLoading || !liveMap) return null
    return enrichBookmarkTree(bookmarkData.root, liveMap, isShowLiveFirst)
  }, [bookmarkData, liveMap, isShowLiveFirst, isLoading])

  useEffect(() => {
    const unsub = subscribePopupSettings((s) =>
      setIsShowLiveFirst(s.showLiveFirst),
    )
    return () => unsub()
  }, [])

  if (!isSuccess) return null

  if (!index || !enrichedRoot || !liveMap) {
    return (
      <SortableContext
        items={bookmarkData.root}
        strategy={verticalListSortingStrategy}
      >
        <ul className={`flex flex-col`}>
          {bookmarkData.root.map((node) => {
            console.log(node)
            if (node.type === 'folder') {
              return (
                <li key={node.id}>
                  <FolderItem_old
                    key={node.id}
                    folder={node}
                  />
                </li>
              )
            }
            return (
              <li key={node.id}>
                <StreamerItem_old
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
  } else {
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
}
