import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type { StateSlotDetail } from '@/ncoverlay/state'

import { Image, cn } from '@nextui-org/react'

import { JIKKYO_CHANNELS } from '@midra/nco-api/constants'

import { SourceTag } from './SourceTag'
import { Duration } from './Duration'

export type ThumbnailProps = {
  id: StateSlotDetail['id']
  type: StateSlotDetail['type']
  info: StateSlotDetail['info']
}

export const Thumbnail: React.FC<ThumbnailProps> = ({ id, type, info }) => {
  let thumbnail: JSX.Element | undefined

  if (type === 'jikkyo') {
    const jkChId = id.split(':')[0] as JikkyoChannelId

    // 実況のチャンネル情報
    thumbnail = (
      <div className="h-full rounded-lg bg-content3 p-[1px]">
        <div
          className={cn(
            'relative',
            'flex flex-col items-center justify-center',
            'aspect-video h-full overflow-hidden rounded-lg',
            'px-1',
            'bg-jikkyo dark:bg-jikkyo-700',
            'select-none'
          )}
        >
          <span className={cn('absolute top-[4px]', 'text-mini text-white/80')}>
            {jkChId}
          </span>
          <span
            className={cn('line-clamp-1', 'text-small font-bold text-white')}
          >
            {JIKKYO_CHANNELS[jkChId!]}
          </span>
        </div>
      </div>
    )
  } else if ('thumbnail' in info) {
    thumbnail = (
      <Image
        classNames={{
          wrapper: 'h-full rounded-lg bg-foreground-300 p-[1px]',
          img: 'aspect-video h-full rounded-lg object-cover',
        }}
        src={info.thumbnail}
        draggable={false}
      />
    )
  }

  return (
    <>
      {thumbnail}

      {/* ソース */}
      <SourceTag type={type} />

      {/* 長さ */}
      <Duration infoDuration={info.duration} />
    </>
  )
}
