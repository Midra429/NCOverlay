import type { StateSlotDetail } from '@/ncoverlay/state'

import { Link, cn } from '@nextui-org/react'

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
  const { href } = new URL(
    infoId,
    type === 'jikkyo'
      ? `https://cal.syoboi.jp/tid/`
      : 'https://www.nicovideo.jp/watch/'
  )

  const title = (
    <span
      className="line-clamp-3 break-all text-tiny font-bold"
      title={
        (isSearch ? 100 : 190) < new Blob([infoTitle]).size
          ? infoTitle
          : undefined
      }
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
