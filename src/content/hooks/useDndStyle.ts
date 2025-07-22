import { CSS, type Transform } from '@dnd-kit/utilities'

export default function useDndStyle(
  transform: Transform | null,
  transition: string | undefined,
) {
  return {
    style: {
      transform: CSS.Transform.toString(transform),
      transition,
    } as React.CSSProperties,
  }
}
