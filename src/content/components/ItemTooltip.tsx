import type { BookmarkItem } from '@/types/bookmark'
import type { ILiveContent } from '@/types/follow'

import PreviewAuto from '@/content/components/PreviewAuto'
import { getPopupSettings } from '@/content/state/PopupSettings'

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
      <div className={`pointer-events-none absolute top-0 left-[52px]`}>
        <div
          className={`dark:bg-bg-04 pointer-events-none w-50 rounded bg-white px-3 py-2 text-xs shadow-lg`}
        >
          <div className="flex flex-col gap-y-1">
            <div className="line-clamp-1 flex items-center gap-x-2">
              <p className="dark:text-content-chzzk-01 text-bg-chzzk-light-02 text-bg-chzzk-00 text-[13px] font-extrabold text-nowrap">
                {streamer.name}
              </p>
              <span className="dark:text-content-04 text-bg-05 truncate text-xs font-bold">
                {liveStatus?.liveCategoryValue}
              </span>
            </div>
            <p className="text-bg-04 line-clamp-2 dark:text-white">
              {liveStatus?.liveTitle}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-warn-light text-[18px] leading-none dark:text-[#FF5454]">
                •
              </span>
              <span className="text-warn-light font-semibold dark:text-[#FF5454]">
                {liveStatus?.concurrentUserCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <PreviewAuto
          hashId={streamer.hashId}
          opts={{
            delayMs: 600,
            volume: getPopupSettings().previewVolume,
            maxLevel: 480,
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={`pointer-events-none absolute top-0 ${inFolder ? 'left-[191px]' : 'left-[209px]'} `}
    >
      <div
        className={`dark:bg-bg-04 text-bg-04 pointer-events-none w-50 rounded bg-white px-3 py-2 text-xs shadow-lg dark:text-white`}
      >
        <p className="line-clamp-2">{liveStatus?.liveTitle}</p>
      </div>
      <PreviewAuto
        hashId={streamer.hashId}
        opts={{
          delayMs: 600,
          volume: getPopupSettings().previewVolume,
          maxLevel: 480,
        }}
      />
    </div>
  )
}
