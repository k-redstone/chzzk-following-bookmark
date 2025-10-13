import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import StreamerItem from '@/content/components/card/StreamerItem'
import FolderItem from '@/content/components/FolderItem'
import useBookmarkState from '@/content/hooks/queries/useBookmarkState'
import useNavExpanded from '@/content/hooks/useNavExpanded'

export default function BookmarkList() {
  const { data: bookmarkData, isSuccess } = useBookmarkState()
  const isNavExpanded = useNavExpanded()
  if (!isSuccess) return null

  console.log(bookmarkData)
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
