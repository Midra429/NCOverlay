import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from '@nextui-org/react'

export type SourceTagProps = {
  type: StateSlotDetail['type']
}

const SOURCE_TAG_CLASSES: {
  [k in Exclude<SourceTagProps['type'], 'normal'>]: string
} = {
  official: cn('bg-[#ffe248] text-black dark:bg-[#ffd700]'),
  danime: cn('bg-danime-400 text-white dark:bg-danime-500'),
  chapter: cn('bg-danime-400 text-white dark:bg-danime-500'),
  szbh: cn('bg-gray-500 text-white dark:bg-gray-600'),
  jikkyo: cn('bg-jikkyo-600 text-white dark:bg-jikkyo-700'),
}

const SOURCE_TAG_NAME: {
  [k in Exclude<SourceTagProps['type'], 'normal'>]: string
} = {
  official: '公式',
  danime: 'dアニメ',
  chapter: 'dアニメ(分割)',
  szbh: 'コメント専用',
  jikkyo: '実況',
}

export const SourceTag: React.FC<SourceTagProps> = ({ type }) => {
  if (type === 'normal') return

  return (
    <div
      className={cn(
        'absolute left-[3px] top-[3px] z-10',
        'px-1 py-[1px]',
        'border-1 border-white/80',
        'rounded-md',
        'text-mini',
        'select-none',
        SOURCE_TAG_CLASSES[type]
      )}
    >
      {SOURCE_TAG_NAME[type]}
    </div>
  )
}