import { useSortable, type AnimateLayoutChanges } from '@dnd-kit/sortable'

import type { BookmarkItem } from '@/types/bookmark'

import { DEFAULT_IMAGE_URL } from '@/constants'
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

  const handleMoveToStreamer = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const url = isLive ? `/live/${streamer.hashId}` : `/${streamer.hashId}`

    if (e.ctrlKey || e.metaKey) {
      window.open(url, '_blank')
    } else {
      window.location.href = url
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
          className={`relative flex cursor-pointer items-center justify-center py-2 ${isDragging && `dark:bg-bg-04 bg-content-hover-02 opacity-50`}`}
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          onClick={(e) => handleMoveToStreamer(e)}
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
            className={`box-border h-8 w-8 overflow-hidden rounded-full ring-2 hover:ring-4 ${isLive ? `dark:ring-border-chzzk-02 ring-bg-chzzk-light-01` : `dark:ring-bg-02 ring-white grayscale filter`}`}
          >
            <img
              width={26}
              height={26}
              src={
                streamer.profileImageUrl === ''
                  ? DEFAULT_IMAGE_URL
                  : streamer.profileImageUrl
              }
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
        className={`dark:hover:bg-bg-04 hover:bg-content-hover-01 relative flex cursor-pointer items-center rounded p-[5px] ${isDragging && `dark:bg-bg-04 bg-content-02 opacity-50`}`}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={(e) => handleMoveToStreamer(e)}
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
          className={`h-8 w-8 overflow-hidden rounded-full border-2 ${isLive ? `dark:border-bg-chzzk-04 border-bg-chzzk-light-01` : `dark:border-bg-02 border-white grayscale filter`}`}
        >
          <img
            width={26}
            height={26}
            src={
              streamer.profileImageUrl === ''
                ? DEFAULT_IMAGE_URL
                : streamer.profileImageUrl
            }
            alt={streamer.name}
            className={`aspect-auto h-full w-full object-cover`}
          />
        </div>
        <div className="ml-2.5 flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-semibold">
            {streamer.name}
          </span>
          {isLive && (
            <span className="text-bg-05 truncate text-[11px] dark:text-gray-400">
              {liveStatusData.liveCategoryValue}
            </span>
          )}
        </div>
        {isLive && (
          <div className="ml-2 flex items-center gap-1 text-xs">
            <span className="text-warn-light text-[18px] leading-none dark:text-[#FF5454]">
              •
            </span>
            {liveStatusData.concurrentUserCount > 0 && (
              <span className="text-warn-light font-semibold dark:text-[#FF5454]">
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
