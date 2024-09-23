import type { StateSlotDetail } from '@/ncoverlay/state'

import { useCallback, useState } from 'react'
import { cn } from '@nextui-org/react'

import { getNiconicoComments } from '@/utils/api/getNiconicoComments'
import { extractNgSettings } from '@/utils/api/extractNgSettings'
import { applyNgSettings } from '@/utils/api/applyNgSetting'

import { ncoState } from '@/hooks/useNco'

import { PanelItem } from '@/components/panel-item'

import { StatusOverlay } from './status-overlay'
import { AddButton } from './add-button'
import { Thumbnail } from './thumbnail'
import { DateTime } from './date-time'
import { Title } from './title'
import { Counts } from './counts'
import { Offset } from './offset'
import { HideButton } from './hide-button'
import { TranslucentButton } from './translucent-button'
import { Options, OptionsButton } from './options'

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
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

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
  }, [detail, isSearch])

  return (
    <PanelItem
      className={cn(
        detail.status === 'error' && 'bg-danger/30',
        isDisabled && 'pointer-events-none opacity-50'
      )}
    >
      <div
        className={cn(
          'relative flex flex-row p-1',
          isSearch ? 'h-[5.125rem] gap-1.5' : 'h-[5.75rem] gap-2'
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
            'flex size-full flex-col gap-0.5',
            detail.hidden && 'opacity-50'
          )}
        >
          {/* 日付 */}
          <DateTime infoDate={detail.info.date} isSearch={isSearch} />

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
              'h-fit flex-shrink-0',
              'text-foreground-500 dark:text-foreground-600'
            )}
          >
            {/* 再生数・コメント数 */}
            <Counts infoCount={detail.info.count} isSearch={isSearch} />

            {/* オフセット */}
            {!isSearch && <Offset offsetMs={detail.offsetMs} />}
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
            <OptionsButton
              isOpen={isOptionsOpen}
              onPress={() => setIsOptionsOpen((v) => !v)}
            />
          </div>
        )}
      </div>

      {/* 設定 */}
      {!isSearch && (
        <Options
          isOpen={isOptionsOpen}
          id={detail.id}
          offsetMs={detail.offsetMs}
        />
      )}
    </PanelItem>
  )
}
