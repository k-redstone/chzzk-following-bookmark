import StreamerItem from '@/content/components/card/StreamerItem'
import FolderItem from '@/content/components/FolderItem'
import useBookmarkState from '@/content/hooks/queries/useBookmarkState'
import { useDnDContext } from '@/providers/DnDProvider'

export default function BookmarkList() {
  const { data: bookmarkData, isSuccess, invalidate } = useBookmarkState()
  const { onMouseDown, onMouseEnter, onDrop } = useDnDContext()

  return (
    <ul className={`flex flex-col gap-y-1`}>
      {isSuccess &&
        bookmarkData.root.map((node, idx) => {
          if (node.type === 'folder') {
            return (
              <li
                key={node.id}
                onMouseDown={(e) =>
                  onMouseDown({ type: 'root', index: idx, data: node }, e)
                }
                onMouseEnter={(e) => {
                  e.preventDefault()
                  onMouseEnter({ type: 'root', index: idx, data: node })
                }}
                onMouseUp={async () => {
                  await onDrop()
                  invalidate()
                }}
                draggable
              >
                <FolderItem
                  key={node.id}
                  folder={node}
                />
              </li>
            )
          }
          return (
            <li
              key={node.id}
              onMouseDown={(e) =>
                onMouseDown({ type: 'root', index: idx, data: node }, e)
              }
              onMouseEnter={(e) => {
                e.preventDefault()
                onMouseEnter({ type: 'root', index: idx, data: node })
              }}
              onMouseUp={async () => {
                await onDrop()
                invalidate()
              }}
              draggable
            >
              <StreamerItem
                streamer={node}
                inFolder={false}
              />
            </li>
          )
        })}
    </ul>
  )
}
