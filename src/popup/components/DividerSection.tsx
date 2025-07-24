interface IDividerSectionProps {
  children: React.ReactNode
}

export default function DividerSection({ children }: IDividerSectionProps) {
  return (
    <div className="before:bg-bg-03 relative mb-2 pb-2 before:absolute before:right-0 before:bottom-0 before:left-0 before:h-[1px] before:content-['']">
      {children}
    </div>
  )
}
