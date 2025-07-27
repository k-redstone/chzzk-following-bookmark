import type { BookmarkItem } from '@/types/bookmark'
import type { ILiveContent } from '@/types/follow'

interface IItemTooltipProps {
  liveStatus?: ILiveContent
  streamer: BookmarkItem
  inFolder: boolean
  isNavExpanded: boolean
}

export default function ItemTooltip({
  liveStatus,
  streamer,
  inFolder,
  isNavExpanded,
}: IItemTooltipProps) {
  if (!isNavExpanded) {
    return (
      <div
        className={`bg-bg-04 pointer-events-none absolute top-0 left-[52px] w-50 rounded px-3 py-2 text-xs text-white`}
      >
        <div className="flex flex-col gap-y-1">
          <div className="line-clamp-1 flex items-center gap-x-2">
            <p className="text-content-chzzk-01 text-[13px] font-extrabold text-nowrap">
              {streamer.name}
            </p>
            <span className="text-content-04 truncate text-xs font-bold">
              {liveStatus?.liveCategoryValue}
            </span>
          </div>
          <p className="line-clamp-2">{liveStatus?.liveTitle}</p>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[18px] leading-none text-[#FF5454]">•</span>
            <span className="font-semibold text-[#FF5454]">
              {liveStatus?.concurrentUserCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-bg-04 pointer-events-none absolute top-0 w-50 rounded px-3 py-2 text-xs text-white ${inFolder ? 'left-[191px]' : 'left-[209px]'} `}
    >
      <p className="line-clamp-2">{liveStatus?.liveTitle}</p>
    </div>
  )
}
