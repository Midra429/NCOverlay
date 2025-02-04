import type { StateSlotDetail, StateSlotDetailJikkyo } from '@/ncoverlay/state'

import { useMemo } from 'react'
import { Link, cn } from "@heroui/react"
import { useOverflowDetector } from 'react-detectable-overflow'

import { ProgramIcons } from '@/entrypoints/popup/SidePane/JikkyoEpgSelector/Program'

const programIconsRegExp = /^(?:(?:🈞|🈟|🈡)\s?)+/

export type TitleProps = {
  id: StateSlotDetail['info']['id']
  source: StateSlotDetailJikkyo['info']['source']
  title: StateSlotDetail['info']['title']
  isSearch?: boolean
}

export const Title: React.FC<TitleProps> = ({
  id,
  source,
  title,
  isSearch,
}) => {
  const { ref, overflow } = useOverflowDetector()

  const url = useMemo(() => {
    if (!id) return null

    let baseUrl: string

    if (source === 'syobocal') {
      baseUrl = 'https://cal.syoboi.jp/tid/'
    } else if (source === 'tver') {
      baseUrl = 'https://tver.jp/series/'
    } else if (source === 'nhkPlus') {
      baseUrl = 'https://plus.nhk.jp/watch/st/'
    } else {
      baseUrl = 'https://www.nicovideo.jp/watch/'
    }

    return new URL(id, baseUrl)
  }, [id, source])

  const icon = useMemo(() => {
    const prefix = title.match(programIconsRegExp)?.[0]

    return {
      revival: prefix?.includes('🈞'),
      new: prefix?.includes('🈟'),
      last: prefix?.includes('🈡'),
    }
  }, [title])

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
