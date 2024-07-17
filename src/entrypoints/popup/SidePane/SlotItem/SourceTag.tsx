import type { Slot } from '@/ncoverlay/state'

import { cn } from '@nextui-org/react'

export type SourceTagProps = {
  source: Slot['type']
}

const SOURCE_TAG_CLASSES: {
  [k in Exclude<SourceTagProps['source'], 'normal'>]: string
} = {
  danime: cn('bg-danime-400 text-white dark:bg-danime-500'),
  chapter: cn('bg-danime-400 text-white dark:bg-danime-500'),
  szbh: cn('bg-foreground-400 text-white'),
  jikkyo: cn('bg-jikkyo-600 text-white dark:bg-jikkyo-700'),
}

const SOURCE_TAG_NAME: {
  [k in Exclude<SourceTagProps['source'], 'normal'>]: string
} = {
  danime: 'dアニメ',
  chapter: 'dアニメ･分割',
  szbh: 'SZBH',
  jikkyo: '実況',
}

export const SourceTag: React.FC<SourceTagProps> = ({ source }) => {
  if (source === 'normal') {
    return null
  }

  return (
    <span
      className={cn(
        'absolute right-1 top-1',
        'block rounded-full px-1 py-[0.5px]',
        'text-[11px] leading-[15px]',
        SOURCE_TAG_CLASSES[source]
      )}
    >
      {SOURCE_TAG_NAME[source]}
    </span>
  )
}
