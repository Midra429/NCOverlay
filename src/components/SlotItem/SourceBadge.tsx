import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from "@heroui/react"

export type SourceTagProps = {
  className?: string
  type: StateSlotDetail['type']
}

const SOURCE_BADGE_CLASSES: {
  [k in Exclude<SourceTagProps['type'], 'normal'>]: string
} = {
  official: cn('bg-[#ffe248] text-black dark:bg-[#ffd700]'),
  danime: cn('bg-danime-400 text-white dark:bg-danime-500'),
  chapter: cn('bg-danime-400 text-white dark:bg-danime-500'),
  szbh: cn('bg-gray-500 text-white dark:bg-gray-600'),
  jikkyo: cn('bg-jikkyo-600 text-white dark:bg-jikkyo-700'),
}

const SOURCE_BADGE_NAME: {
  [k in Exclude<SourceTagProps['type'], 'normal'>]: string
} = {
  official: '公式',
  danime: 'dアニメ',
  chapter: 'dアニメ(分割)',
  szbh: 'コメント専用',
  jikkyo: '実況',
}

export const SourceBadge: React.FC<SourceTagProps> = ({ className, type }) => {
  if (type === 'normal') return

  return (
    <div
      className={cn(
        'px-1 py-[1px]',
        'border-1 border-white/80',
        'rounded-md',
        'text-mini',
        'select-none',
        SOURCE_BADGE_CLASSES[type],
        className
      )}
    >
      {SOURCE_BADGE_NAME[type]}
    </div>
  )
}
