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

  const { href } = useMemo(() => {
    return new URL(
      infoId,
      type === 'jikkyo'
        ? `https://cal.syoboi.jp/tid/`
        : 'https://www.nicovideo.jp/watch/'
    )
  }, [type, infoId])

  const title = (
    <span
      className={cn(
        'line-clamp-3 break-all font-bold',
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
      {isSearch ? (
        title
      ) : (
        <Link color="foreground" href={href} isExternal>
          {title}
        </Link>
      )}
    </div>
  )
}