import type { StateSlotDetail } from '@/ncoverlay/state'

import { useMemo } from 'react'
import { Link, cn } from '@nextui-org/react'
import { useOverflowDetector } from 'react-detectable-overflow'

export type TitleProps = {
  type: StateSlotDetail['type']
  infoId: StateSlotDetail['info']['id']
  infoTitle: StateSlotDetail['info']['title']
  isSearch?: boolean
}

export const Title: React.FC<TitleProps> = ({
  type,
  infoId,
  infoTitle,
  isSearch,
}) => {
  const { ref, overflow } = useOverflowDetector()

  const url = useMemo(() => {
    if (!infoId) return null

    let baseUrl: string

    if (type !== 'jikkyo') {
      baseUrl = 'https://www.nicovideo.jp/watch/'
    } else if (/^\d+$/.test(infoId)) {
      baseUrl = 'https://cal.syoboi.jp/tid/'
    } else {
      baseUrl = 'https://tver.jp/series/'
    }

    return new URL(infoId, baseUrl)
  }, [type, infoId])

  const title = (
    <span
      className={cn(
        'line-clamp-3 whitespace-pre-wrap break-all font-semibold',
        isSearch ? 'text-mini' : 'text-tiny'
      )}
      title={overflow ? infoTitle : undefined}
      ref={ref}
    >
      {infoTitle}
    </span>
  )

  return (
    <div className="flex h-full flex-col justify-start">
      {isSearch || !url ? (
        title
      ) : (
        <Link color="foreground" href={url.href} isExternal>
          {title}
        </Link>
      )}
    </div>
  )
}
