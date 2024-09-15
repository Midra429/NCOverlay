import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from '@nextui-org/react'

import { formatDuration } from '@/utils/format'

export type DurationProps = {
  infoDuration: StateSlotDetail['info']['duration']
  isSearch?: boolean
}

export const Duration: React.FC<DurationProps> = ({
  infoDuration,
  isSearch,
}) => {
  return (
    <div
      className={cn(
        'absolute bottom-[3px] right-[3px] z-10',
        isSearch ? 'px-0.5 py-[0.5px]' : 'px-1 py-[1px]',
        'bg-black/50 backdrop-blur-md',
        'border-1 border-white/25',
        'rounded-md',
        'text-min text-white',
        'select-none'
      )}
    >
      {formatDuration(infoDuration)}
    </div>
  )
}
