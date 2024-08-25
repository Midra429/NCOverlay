import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type { StateSlotDetail } from '@/ncoverlay/state'

import { useMemo } from 'react'
import { Image, cn } from '@nextui-org/react'

import { JIKKYO_CHANNELS } from '@midra/nco-api/constants'

import { formatDuration } from '@/utils/format'

import { SourceTag } from './SourceTag'

export type ThumbnailProps = {
  detail: StateSlotDetail
}

export const Thumbnail: React.FC<ThumbnailProps> = ({ detail }) => {
  const element = useMemo(() => {
    let thumbnail: JSX.Element

    if (detail.type === 'jikkyo') {
      const jkChId = detail.id.split(':')[0] as JikkyoChannelId

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
            <span
              className={cn(
                'absolute top-[4px]',
                'text-[11px] leading-[15px] text-white/80'
              )}
            >
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
    } else {
      thumbnail = (
        <Image
          classNames={{
            wrapper: 'h-full rounded-lg bg-foreground-300 p-[1px]',
            img: 'aspect-video h-full rounded-lg object-cover',
          }}
          src={detail.info.thumbnail}
          draggable={false}
        />
      )
    }

    return (
      <>
        {thumbnail}

        {/* ソース */}
        <SourceTag source={detail.type} />

        {/* 長さ */}
        <div
          className={cn(
            'absolute bottom-[3px] right-[3px] z-10',
            'block px-1 py-[1px]',
            'bg-black/40 backdrop-blur-md',
            'border-1 border-white/25',
            'rounded-md',
            'text-[11px] leading-[15px] text-white',
            'select-none'
          )}
        >
          {formatDuration(detail.info.duration)}
        </div>
      </>
    )
  }, [detail.id, detail.type, detail.info])

  return element
}
