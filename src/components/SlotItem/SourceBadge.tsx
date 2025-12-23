import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from '@heroui/react'

import { SOURCE_NAMES } from '@/constants/settings'

export interface SourceTagProps {
  className?: string
  type: StateSlotDetail['type']
}

type SourceBadgeKey = Exclude<SourceTagProps['type'], 'normal'>

const SOURCE_BADGE_CLASSES: {
  [P in SourceBadgeKey]?: string
} = {
  official: cn('bg-[#ffe248] text-black dark:bg-[#ffd700]'),
  danime: cn('bg-danime-400 text-white dark:bg-danime-500'),
  chapter: cn('bg-danime-400 text-white dark:bg-danime-500'),
  szbh: cn('bg-gray-500 text-white dark:bg-gray-600'),
  jikkyo: cn('bg-jikkyo-600 text-white dark:bg-jikkyo-700'),
  nicolog: cn('bg-[#252525] text-white'),
  file: cn('bg-blue-500 text-white dark:bg-blue-600'),
}

export function SourceBadge({ className, type }: SourceTagProps) {
  if (type === 'normal') return

  return (
    <div
      className={cn(
        'px-1 py-px',
        'border-1 border-white/80',
        'rounded-md',
        'text-mini',
        'select-none',
        SOURCE_BADGE_CLASSES[type],
        className
      )}
    >
      {SOURCE_NAMES[type]}
    </div>
  )
}
