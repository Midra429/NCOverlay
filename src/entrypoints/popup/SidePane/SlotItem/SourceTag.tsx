import type { Slot } from '@/ncoverlay/state'

import { cn } from '@nextui-org/react'

export type SourceTagProps = {
  source: Slot['type']
}

const SOURCE_TAG_CLASSES: {
  [k in SourceTagProps['source']]: string
} = {
  normal: '',
  danime: cn('bg-danime-400 text-white dark:bg-danime-500'),
  chapter: cn('bg-danime-400 text-white dark:bg-danime-500'),
  szbh: cn('bg-foreground-400 text-white'),
  jikkyo: cn('bg-jikkyo-600 text-white dark:bg-jikkyo-700'),
}

const SOURCE_TAG_NAME: {
  [k in SourceTagProps['source']]: string
} = {
  normal: '',
  danime: 'dアニメ',
  chapter: 'dアニメ･分割',
  szbh: 'SZBH',
  jikkyo: '実況',
}

export const SourceTag: React.FC<SourceTagProps> = ({ source }) => {
  return (
    source !== 'normal' && (
      <span
        className={cn(
          'absolute right-1 top-1',
          'block rounded-full px-1.5 py-[1px]',
          'text-tiny',
          SOURCE_TAG_CLASSES[source]
        )}
      >
        {SOURCE_TAG_NAME[source]}
      </span>
    )
  )
}
