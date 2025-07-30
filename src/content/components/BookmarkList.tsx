import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import StreamerItem from '@/content/components/card/StreamerItem'
import FolderItem from '@/content/components/FolderItem'
import useBookmarkState from '@/content/hooks/queries/useBookmarkState'

export default function BookmarkList() {
  const { data: bookmarkData, isSuccess } = useBookmarkState()

  if (!isSuccess) return null

  return (
    <SortableContext
      items={bookmarkData.root}
      strategy={verticalListSortingStrategy}
    >
      <ul className={`flex flex-col`}>
        {bookmarkData.root.map((node) => {
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
