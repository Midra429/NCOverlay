import type { Program as EPGv2Program } from '@midra/nco-utils/types/api/tver/callEPGv2'

import { tv } from '@heroui/react'

const programIcon = tv({
  base: [
    'relative -top-[0.5px]',
    'inline-flex items-center justify-center',
    'mr-0.5 size-[calc(1em+3px)]',
    'select-none rounded-xs',
    'font-normal text-[calc(1em-1px)]',
    'text-white dark:text-black',
  ],
  variants: {
    icon: {
      revival: 'bg-blue-500 dark:bg-blue-300',
      new: 'bg-orange-500 dark:bg-orange-300',
      last: 'bg-red-500 dark:bg-red-300',
    },
  },
})

export interface ProgramIconsProps {
  icon: Partial<EPGv2Program['icon']>
}

export function ProgramIcons({ icon }: ProgramIconsProps) {
  return (
    <>
      {icon.revival && (
        <span className={programIcon({ icon: 'revival' })} title="再放送">
          再
        </span>
      )}

      {icon.new && (
        <span className={programIcon({ icon: 'new' })} title="新番組">
          新
        </span>
      )}

      {icon.last && (
        <span className={programIcon({ icon: 'last' })} title="最終回">
          終
        </span>
      )}
    </>
  )
}
