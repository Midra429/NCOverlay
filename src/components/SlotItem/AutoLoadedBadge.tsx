import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from '@heroui/react'

export type AutoLoadedBadgeProps = {
  className?: string
  isAutoLoaded: StateSlotDetail['isAutoLoaded']
}

export const AutoLoadedBadge: React.FC<AutoLoadedBadgeProps> = ({
  className,
  isAutoLoaded,
}) => {
  if (isAutoLoaded) return

  return (
    <div
      className={cn(
        'px-1 py-[1px]',
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
