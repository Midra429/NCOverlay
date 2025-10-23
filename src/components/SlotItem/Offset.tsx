import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from '@heroui/react'
import { ClockIcon } from 'lucide-react'

export type OffsetProps = {
  className?: string
  offsetMs: StateSlotDetail['offsetMs']
}

export function Offset({ className, offsetMs }: OffsetProps) {
  const offset = Math.round((offsetMs ?? 0) / 1000)

  return (
    offset !== 0 && (
      <div
        className={cn(
          'flex flex-row items-center gap-0.5',
          'px-1 py-px',
          'border-1 border-white/25',
          'rounded-md',
          'text-mini',
          'bg-black/50 text-white backdrop-blur-md',
          'select-none',
          className
        )}
      >
        <ClockIcon className="size-mini" />

        <span>
          {0 < offset && '+'}
          {offset.toLocaleString()}
        </span>
      </div>
    )
  )
}
