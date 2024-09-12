import type { StateSlotDetail } from '@/ncoverlay/state'

import { useCallback, useState } from 'react'
import { cn } from '@nextui-org/react'

import { PanelItem } from '@/components/panel-item'

import { StatusOverlay } from './StatusOverlay'
import { Thumbnail } from './Thumbnail'
import { DateTime } from './DateTime'
import { Title } from './Title'
import { Counts } from './Counts'
import { Offset } from './Offset'
import { HideButton } from './HideButton'
import { TranslucentButton } from './TranslucentButton'
import { Config, ConfigButton } from './Config'

export type SlotItemProps = {
  detail: StateSlotDetail
}

export const SlotItem: React.FC<SlotItemProps> = ({ detail }) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  const toggleConfig = useCallback(() => {
    setIsConfigOpen((val) => !val)
  }, [])

  return (
    <PanelItem className={cn(detail.status === 'error' && 'bg-danger/30')}>
      <div className="relative flex h-24 flex-row p-1">
        <div
          className={cn(
            'relative h-full flex-shrink-0',
            detail.hidden && 'opacity-50'
          )}
        >
          {/* サムネイル */}
          <Thumbnail id={detail.id} type={detail.type} info={detail.info} />

          {/* ステータス */}
          <StatusOverlay status={detail.status} />
        </div>

        {/* 情報 (右) */}
        <div
          className={cn(
            'flex size-full flex-col gap-1',
            'mx-2',
            detail.hidden && 'opacity-50'
          )}
        >
          {/* 日付 */}
          <DateTime infoDate={detail.info.date} />

          {/* タイトル */}
          <Title
            type={detail.type}
            infoId={detail.info.id}
            infoTitle={detail.info.title}
          />

          <div
            className={cn(
              'flex flex-row items-center justify-between',
              'h-4 flex-shrink-0',
              'text-foreground-500'
            )}
          >
            {/* 再生数・コメント数 */}
            <Counts infoCount={detail.info.count} />

            {/* オフセット */}
            <Offset offsetMs={detail.offsetMs} />
          </div>
        </div>

        {/* サイドボタン */}
        <div
          className={cn(
            'flex shrink-0 flex-col justify-between gap-1',
            detail.status !== 'ready' && 'pointer-events-none opacity-50'
          )}
        >
          <div className="flex shrink-0 flex-col gap-1">
            {/* 非表示 */}
            <HideButton id={detail.id} hidden={detail.hidden} />

            {/* 半透明 */}
            <TranslucentButton
              id={detail.id}
              hidden={detail.hidden}
              translucent={detail.translucent}
            />
          </div>

          {/* 設定ボタン */}
          <ConfigButton isOpen={isConfigOpen} onPress={toggleConfig} />
        </div>
      </div>

      {/* 設定 */}
      <Config isOpen={isConfigOpen} id={detail.id} offsetMs={detail.offsetMs} />
    </PanelItem>
  )
}
