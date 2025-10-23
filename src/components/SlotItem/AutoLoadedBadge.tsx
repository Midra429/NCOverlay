import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from '@heroui/react'

export type AutoLoadedBadgeProps = {
  className?: string
  isAutoLoaded: StateSlotDetail['isAutoLoaded']
}

export function AutoLoadedBadge({
  className,
  isAutoLoaded,
}: AutoLoadedBadgeProps) {
  if (isAutoLoaded) return

  return (
    <div
      className={cn(
        'px-1 py-px',
        'border-1 border-gray-800/50',
        'rounded-md',
        'text-mini',
        'bg-gray-100 text-gray-800',
        'select-none',
        className
      )}
    >
      手動
    </div>
  )
}
