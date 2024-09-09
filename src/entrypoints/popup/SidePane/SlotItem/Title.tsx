import type { StateSlotDetail } from '@/ncoverlay/state'

import { Link } from '@nextui-org/react'

export type TitleProps = {
  type: StateSlotDetail['type']
  infoId: StateSlotDetail['info']['id']
  infoTitle: StateSlotDetail['info']['title']
}

export const Title: React.FC<TitleProps> = ({ type, infoId, infoTitle }) => {
  const { href } = new URL(
    infoId,
    type === 'jikkyo'
      ? `https://cal.syoboi.jp/tid/`
      : 'https://www.nicovideo.jp/watch/'
  )

  return (
    <div className="flex h-full flex-col justify-start">
      <Link
        className="underline-offset-2"
        color="foreground"
        href={href}
        isExternal
      >
        <span
          className="line-clamp-3 break-all text-tiny font-bold"
          title={190 < new Blob([infoTitle]).size ? infoTitle : undefined}
        >
          {infoTitle}
        </span>
      </Link>
    </div>
  )
}
