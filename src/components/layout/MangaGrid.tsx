import type { ReactNode } from 'react'
import { cn } from '~/utils/cn'

interface MangaGridProps {
  children: ReactNode
  className?: string
}

export function MangaGrid({ children, className }: MangaGridProps) {
  return (
    <div
      className={cn(
        // Mobile: webtoon single column
        // Desktop: 12-col asymmetric grid
        'grid grid-cols-1 md:grid-cols-12 gap-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
