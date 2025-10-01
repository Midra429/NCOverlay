import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'
import type { StateSlotDetail } from '@/ncoverlay/state'

import { Image, cn } from '@heroui/react'

import { JIKKYO_CHANNELS } from '@midra/nco-utils/api/constants'

import { SourceBadge } from './SourceBadge'
import { AutoLoadedBadge } from './AutoLoadedBadge'
import { Offset } from './Offset'
import { Duration } from './Duration'

export type ThumbnailProps = {
  id: StateSlotDetail['id']
  type: StateSlotDetail['type']
  offsetMs: StateSlotDetail['offsetMs']
  isAutoLoaded: StateSlotDetail['isAutoLoaded']
  info: StateSlotDetail['info']
  isSearch?: boolean
}

export function Thumbnail({
  id,
  type,
  offsetMs,
  isAutoLoaded,
  info,
  isSearch,
}: ThumbnailProps) {
  let thumbnail: React.JSX.Element | undefined

  if (type === 'jikkyo') {
    const jkChId = id.split(':')[0] as JikkyoChannelId

    // 実況のチャンネル情報
    thumbnail = (
      <div className="bg-content3 h-full rounded-lg p-[1px]">
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
            className={cn(
              'line-clamp-1',
              'font-bold text-white',
              isSearch ? 'text-mini' : 'text-small'
            )}
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
          wrapper: 'bg-foreground-300 h-full rounded-lg p-[1px]',
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

      <div
        className={cn(
          'absolute top-[2px] left-[2px] z-10',
          'flex flex-col items-start gap-[1px]'
        )}
      >
        {/* ソース */}
        <SourceBadge type={type} />

        {/* 自動 / 手動 */}
        {!isSearch && <AutoLoadedBadge isAutoLoaded={isAutoLoaded} />}
      </div>

      {/* オフセット */}
      <Offset
        className="absolute bottom-[2px] left-[2px] z-10"
        offsetMs={offsetMs}
      />

      {/* 長さ */}
      <Duration
        className="absolute right-[2px] bottom-[2px] z-10"
        duration={info.duration}
      />
    </>
  )
}
