interface IFolderTooltipProps {
  folderName: string
}

export default function FolderTooltip({ folderName }: IFolderTooltipProps) {
  return (
    <div
      className={`dark:bg-bg-04 pointer-events-none absolute top-0 left-[52px] w-32 rounded bg-white px-3 py-2 text-[13px] shadow-lg`}
    >
      <p className="line-clamp-1">{folderName}</p>
    </div>
  )
}
