import type { StateSlotDetail, StateSlotDetailJikkyo } from '@/ncoverlay/state'

import { Link, cn } from '@heroui/react'
import { useOverflowDetector } from 'react-detectable-overflow'

import { ProgramIcons } from '@/components/ProgramIcons'

const programIconsRegExp = /^(?:[🈟🈡🈞]\s?)+/

export interface TitleProps {
  id: StateSlotDetail['info']['id']
  source: StateSlotDetailJikkyo['info']['source']
  title: StateSlotDetail['info']['title']
  isSearch?: boolean
}

const BASE_URLS: Record<
  'niconico' | NonNullable<StateSlotDetailJikkyo['info']['source']>,
  string
> = {
  niconico: 'https://www.nicovideo.jp/watch/',
  syobocal: 'https://cal.syoboi.jp/tid/',
  tver: 'https://tver.jp/series/',
  nhkPlus: 'https://plus.nhk.jp/watch/st/',
}

export function Title({ id, source, title, isSearch }: TitleProps) {
  const { ref, overflow } = useOverflowDetector()

  const url = id && new URL(id, source ? BASE_URLS[source] : BASE_URLS.niconico)
  const prefix = title.match(programIconsRegExp)?.[0]
  const icon = {
    new: prefix?.includes('🈟'),
    last: prefix?.includes('🈡'),
    revival: prefix?.includes('🈞'),
  }

  const element = (
    <span
      className={cn(
        'line-clamp-3 whitespace-pre-wrap break-all font-semibold',
        isSearch ? 'text-mini' : 'text-tiny'
      )}
      title={overflow ? title : undefined}
      ref={ref}
    >
      <ProgramIcons icon={icon} />

      <span>{title.replace(programIconsRegExp, '')}</span>
    </span>
  )

  return (
    <div className="flex h-full flex-col justify-start">
      {isSearch || !url ? (
        element
      ) : (
        <Link color="foreground" href={url.href} isExternal>
          {element}
        </Link>
      )}
    </div>
  )
}
