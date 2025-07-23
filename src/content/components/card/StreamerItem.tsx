import { useSortable, type AnimateLayoutChanges } from '@dnd-kit/sortable'

import type { BookmarkItem } from '@/types/bookmark'

import ItemTooltip from '@/content/components/ItemTooltip'
import DeleteItemConfirmModal from '@/content/components/modal/DeleteItemConfirmModal'
import useStreamerLiveStatus from '@/content/hooks/queries/useStreamerLiveStatus'
import useDndStyle from '@/content/hooks/useDndStyle'
import useModal from '@/content/hooks/useModal'
import useNavExpanded from '@/content/hooks/useNavExpanded'
import useShowTooltip from '@/content/hooks/useShowTooltip'

interface IStreamerItemProps {
  streamer: BookmarkItem
  inFolder: boolean
}

export default function StreamerItem({
  streamer,
  inFolder,
}: IStreamerItemProps) {
  const { data: liveStatusData } = useStreamerLiveStatus(streamer.hashId)
  const {
    isOpen: isOpenDeleteItemConfirmModal,
    closeModal: closeDeleteItemConfirmModal,
    openModal: openDeleteItemConfirmModal,
  } = useModal()
  const {
    isOpen: isOpenItemTooltip,
    closeModal: closeItemTooltip,
    openModal: openItemTooltip,
  } = useModal()

  const { show: showToolTipSection, hide: hideTooltipSection } =
    useShowTooltip()

  const isNavExpanded = useNavExpanded()
  const isLive = liveStatusData?.status === 'OPEN'

  const animateLayoutChanges: AnimateLayoutChanges = ({
    isSorting,
    wasDragging,
  }) => (isSorting || wasDragging ? false : true)

  const handleMoveToStreamer = () => {
    if (isLive) {
      window.location.assign(`/live/${streamer.hashId}`)
    } else {
      window.location.assign(`/${streamer.hashId}`)
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: streamer.id,
    animateLayoutChanges: animateLayoutChanges,
  })
  const { style } = useDndStyle(transform, transition)

  if (!isNavExpanded) {
    return (
      <>
        {isOpenDeleteItemConfirmModal && (
          <DeleteItemConfirmModal
            handleModalClose={closeDeleteItemConfirmModal}
            streamer={streamer}
          />
        )}
        <div
          className={`relative flex items-center justify-center py-2 ${isDragging && `bg-bg-04 opacity-50`}`}
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          onClick={() => handleMoveToStreamer()}
          onMouseEnter={() => {
            if (isLive) {
              openItemTooltip()
              showToolTipSection()
            }
          }}
          onMouseLeave={() => {
            if (isLive) {
              closeItemTooltip()
              hideTooltipSection()
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            openDeleteItemConfirmModal()
          }}
        >
          <div
            className={`border-bg-02 h-8 w-8 overflow-hidden rounded-full border-2 ${isLive ? `border-border-chzzk-04 hover:border-border-chzzk-02` : `grayscale filter`}`}
          >
            <img
              width={26}
              height={26}
              src={streamer.profileImageUrl}
              alt={streamer.name}
              className={`aspect-auto h-full w-full object-cover`}
            />
          </div>
          {isOpenItemTooltip && (
            <ItemTooltip
              liveStatus={liveStatusData}
              streamer={streamer}
              inFolder={inFolder}
              isNavExpanded={isNavExpanded}
            />
          )}
        </div>
      </>
    )
  }

  return (
    <>
      {isOpenDeleteItemConfirmModal && (
        <DeleteItemConfirmModal
          handleModalClose={closeDeleteItemConfirmModal}
          streamer={streamer}
        />
      )}
      <div
        className={`hover:bg-bg-04 relative flex cursor-pointer items-center gap-2 rounded py-1 pr-2 pl-1.5 ${isDragging && `bg-bg-04 opacity-50`}`}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => handleMoveToStreamer()}
        onMouseEnter={() => {
          if (isLive) {
            openItemTooltip()
            showToolTipSection()
          }
        }}
        onMouseLeave={() => {
          if (isLive) {
            closeItemTooltip()
            hideTooltipSection()
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          openDeleteItemConfirmModal()
        }}
      >
        <div
          className={`border-bg-02 h-8 w-8 overflow-hidden rounded-full border-2 ${isLive ? `border-bg-chzzk-04` : `grayscale filter`}`}
        >
          <img
            width={26}
            height={26}
            src={streamer.profileImageUrl}
            alt={streamer.name}
            className={`aspect-auto h-full w-full object-cover`}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-extrabold">
            {streamer.name}
          </span>
          {isLive && (
            <span className="truncate text-[12px] text-gray-400">
              {liveStatusData.liveCategoryValue}
            </span>
          )}
        </div>
        {isLive && (
          <div className="ml-2 flex items-center gap-1 text-xs">
            <span className="text-[18px] leading-none text-[#FF5454]">•</span>
            {liveStatusData.concurrentUserCount > 0 && (
              <span className="font-semibold text-[#FF5454]">
                {liveStatusData.concurrentUserCount.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {isOpenItemTooltip && (
          <ItemTooltip
            liveStatus={liveStatusData}
            streamer={streamer}
            inFolder={inFolder}
            isNavExpanded={isNavExpanded}
          />
        )}
      </div>
    </>
  )
}
