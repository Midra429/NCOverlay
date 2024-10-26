import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from '@nextui-org/react'

export type AutoLoadedBadgeProps = {
  isAutoLoaded: StateSlotDetail['isAutoLoaded']
}

export const AutoLoadedBadge: React.FC<AutoLoadedBadgeProps> = ({
  isAutoLoaded,
}) => {
  if (isAutoLoaded) return

  return (
    <div
      className={cn(
        'absolute bottom-[3px] left-[3px] z-10',
        'px-1 py-[1px]',
        'border-1 border-gray-800/50',
        'rounded-md',
        'text-mini',
        'bg-gray-100 text-gray-800',
        'select-none'
      )}
    >
      手動
    </div>
  )
}
