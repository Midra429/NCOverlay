import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from '@nextui-org/react'

import { formatDuration } from '@/utils/format'

export type DurationProps = {
  infoDuration: StateSlotDetail['info']['duration']
}

export const Duration: React.FC<DurationProps> = ({ infoDuration }) => {
  return (
    <div
      className={cn(
        'absolute bottom-[3px] right-[3px] z-10',
        'px-1 py-[1px]',
        'border-1 border-white/25',
        'rounded-md',
        'text-mini',
        'bg-black/50 text-white backdrop-blur-md',
        'select-none'
      )}
    >
      {formatDuration(infoDuration)}
    </div>
  )
}
