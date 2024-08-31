import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from '@nextui-org/react'

export type SourceTagProps = {
  source: StateSlotDetail['type']
}

const SOURCE_TAG_CLASSES: {
  [k in Exclude<SourceTagProps['source'], 'normal'>]: string
} = {
  danime: cn('bg-danime-400 text-white dark:bg-danime-500'),
  chapter: cn('bg-danime-400 text-white dark:bg-danime-500'),
  szbh: cn('bg-gray-500 text-white dark:bg-gray-600'),
  jikkyo: cn('bg-jikkyo-600 text-white dark:bg-jikkyo-700'),
}

const SOURCE_TAG_NAME: {
  [k in Exclude<SourceTagProps['source'], 'normal'>]: string
} = {
  danime: 'dアニメ',
  chapter: 'dアニメ(分割)',
  szbh: 'コメント専用',
  jikkyo: '実況',
}

export const SourceTag: React.FC<SourceTagProps> = ({ source }) => {
  if (source === 'normal') return

  return (
    <div
      className={cn(
        'absolute left-[3px] top-[3px] z-10',
        'block px-1 py-[1px]',
        'border-1 border-white/80',
        'rounded-md',
        'text-[11px] leading-[15px]',
        'select-none',
        SOURCE_TAG_CLASSES[source]
      )}
    >
      {SOURCE_TAG_NAME[source]}
    </div>
  )
}
