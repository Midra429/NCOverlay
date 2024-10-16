import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type {
  StateSlot,
  StateSlotDetail,
  StateSlotDetailUpdate,
} from '@/ncoverlay/state'
import type { PanelItemProps } from '@/components/panel-item'

import { useCallback, useState } from 'react'
import { cn } from '@nextui-org/react'

import { getNiconicoComments } from '@/utils/api/getNiconicoComments'
import { getJikkyoKakologs } from '@/utils/api/getJikkyoKakologs'

import { ncoState } from '@/hooks/useNco'

import { PanelItem } from '@/components/panel-item'

import { StatusOverlay } from './status-overlay'
import { ButtonsOverlay } from './buttons-overlay'
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
  classNames?: PanelItemProps['classNames']
  detail: StateSlotDetail
  isSearch?: boolean
  isDisabled?: boolean
}

export const SlotItem: React.FC<SlotItemProps> = ({
  classNames,
  detail,
  isSearch,
  isDisabled,
}) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  const onPressAdd = useCallback(async () => {
    await ncoState?.add('slotDetails', {
      ...detail,
      status: 'loading',
    })

    await ncoState?.set('status', 'loading')

    const { type, id, info } = detail

    let slotDetail: StateSlotDetailUpdate | undefined
    let slot: StateSlot | undefined

    if (type === 'jikkyo') {
      const [comment] = await getJikkyoKakologs([
        {
          jkChId: id.split(':')[0] as JikkyoChannelId,
          starttime: info.date[0] / 1000,
          endtime: info.date[1] / 1000,
        },
      ])

      if (comment) {
        const { thread, markers } = comment

        slotDetail = {
          id,
          status: 'ready',
          markers,
          info: {
            count: {
              comment: thread.commentCount,
            },
          },
        }

        slot = { id, threads: [thread] }
      }
    } else {
      const [comment] = await getNiconicoComments([{ contentId: id }])

      if (comment) {
        const { data, threads } = comment

        slotDetail = {
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
        }

        slot = { id, threads }
      }
    }

    if (slotDetail && slot) {
      await ncoState?.update('slotDetails', ['id'], slotDetail)
      await ncoState?.add('slots', slot)
    } else {
      await ncoState?.remove('slotDetails', { id })
    }

    await ncoState?.set('status', 'ready')
  }, [detail])

  const onPressRemove = useCallback(async () => {
    await ncoState?.set('status', 'loading')

    const { id } = detail

    await ncoState?.remove('slotDetails', { id })
    await ncoState?.remove('slots', { id })

    await ncoState?.set('status', 'ready')
  }, [detail.id])

  return (
    <PanelItem
      className={cn(
        detail.status === 'error' && 'bg-danger/30',
        isDisabled && 'pointer-events-none opacity-50'
      )}
      classNames={{
        ...classNames,
        wrapper: [
          isDisabled && 'border-dashed bg-transparent',
          classNames?.wrapper,
        ],
      }}
    >
      <div
        className={cn(
          'relative flex flex-row p-1',
          isSearch
            ? [
                'gap-1.5',
                detail.type === 'jikkyo' ? 'h-[4.25rem]' : 'h-[5.125rem]',
              ]
            : 'h-[5.75rem] gap-2'
        )}
      >
        <div
          className={cn(
            'relative h-full shrink-0',
            detail.hidden && 'opacity-50'
          )}
        >
          {/* サムネイル */}
          <Thumbnail
            id={detail.id}
            type={detail.type}
            isAutoLoaded={detail.isAutoLoaded}
            info={detail.info}
            isSearch={isSearch}
          />

          {isSearch ? (
            // 追加
            <AddButton onPress={onPressAdd} />
          ) : (
            <>
              <ButtonsOverlay status={detail.status} onRemove={onPressRemove} />

              {/* ステータス */}
              <StatusOverlay status={detail.status} />
            </>
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
              'flex shrink-0 flex-row items-center justify-between',
              'text-foreground-500 dark:text-foreground-600'
            )}
          >
            {/* 再生数・コメント数 */}
            {!(detail.type === 'jikkyo' && isSearch) && (
              <Counts
                status={detail.status}
                infoCount={detail.info.count}
                isSearch={isSearch}
              />
            )}

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
