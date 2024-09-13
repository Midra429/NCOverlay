import type { StateSlotDetail } from '@/ncoverlay/state'

import { useCallback, useState } from 'react'
import { cn } from '@nextui-org/react'

import { getNiconicoComments } from '@/utils/api/getNiconicoComments'
import { extractNgSettings } from '@/utils/api/extractNgSettings'
import { applyNgSettings } from '@/utils/api/applyNgSetting'

import { ncoState } from '@/hooks/useNco'

import { PanelItem } from '@/components/panel-item'

import { StatusOverlay } from './StatusOverlay'
import { AddButton } from './AddButton'
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
  isSearch?: boolean
  isDisabled?: boolean
}

export const SlotItem: React.FC<SlotItemProps> = ({
  detail,
  isSearch,
  isDisabled,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  const toggleConfig = useCallback(() => {
    setIsConfigOpen((val) => !val)
  }, [])

  const onPressAdd = useCallback(async () => {
    await ncoState?.set('status', 'loading')

    await ncoState?.add('slotDetails', {
      ...detail,
      status: 'loading',
    })

    const { id } = detail

    const [comment] = await getNiconicoComments([{ contentId: id }])

    if (comment) {
      const { data, threads } = comment

      const applied = applyNgSettings(
        threads,
        extractNgSettings(data.comment.ng)
      )

      await ncoState?.update('slotDetails', ['id'], {
        id,
        status: 'ready',
        info: {
          count: {
            view: data.video.count.view,
            comment: data.video.count.comment,
          },
          thumbnail:
            data.video.thumbnail.largeUrl ||
            data.video.thumbnail.middleUrl ||
            data.video.thumbnail.url,
        },
      })

      await ncoState?.add('slots', {
        id,
        threads: applied,
      })
    } else {
      await ncoState?.remove('slotDetails', { id })
    }

    await ncoState?.set('status', 'ready')
  }, [detail])

  return (
    <PanelItem
      className={cn(
        detail.status === 'error' && 'bg-danger/30',
        isDisabled && 'pointer-events-none opacity-50'
      )}
    >
      <div className="flex flex-col">
        {/* 日付 */}
        {isSearch && (
          <div className="mx-1 mt-0.5">
            <DateTime infoDate={detail.info.date} />
          </div>
        )}

        <div
          className={cn(
            'relative flex flex-row gap-2 p-1',
            isSearch ? 'h-[4.75rem]' : 'h-24'
          )}
        >
          <div
            className={cn(
              'relative h-full flex-shrink-0',
              detail.hidden && 'opacity-50'
            )}
          >
            {/* サムネイル */}
            <Thumbnail id={detail.id} type={detail.type} info={detail.info} />

            {isSearch ? (
              // 追加
              <AddButton onPress={onPressAdd} />
            ) : (
              // ステータス
              <StatusOverlay status={detail.status} />
            )}
          </div>

          {/* 情報 (右) */}
          <div
            className={cn(
              'flex size-full flex-col gap-1',
              detail.hidden && 'opacity-50'
            )}
          >
            {/* 日付 */}
            {!isSearch && <DateTime infoDate={detail.info.date} />}

            {/* タイトル */}
            <Title
              type={detail.type}
              infoId={detail.info.id}
              infoTitle={detail.info.title}
              isSearch={isSearch}
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
          {!isSearch && (
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
          )}
        </div>
      </div>

      {/* 設定 */}
      {!isSearch && (
        <Config
          isOpen={isConfigOpen}
          id={detail.id}
          offsetMs={detail.offsetMs}
        />
      )}
    </PanelItem>
  )
}
