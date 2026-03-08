import type { ReactNode, CSSProperties } from 'react'
import { cn } from '~/utils/cn'

interface MangaPanelProps {
  children: ReactNode
  thick?: boolean
  inverted?: boolean
  className?: string
  style?: CSSProperties
  id?: string
}

export function MangaPanel({
  children,
  thick = false,
  inverted = false,
  className,
  style,
  id,
}: MangaPanelProps) {
  return (
    <div
      id={id}
      style={style}
      className={cn(
        inverted ? 'manga-invert' : thick ? 'manga-panel-thick' : 'manga-panel',
        className,
      )}
    >
      {children}
    </div>
  )
}
