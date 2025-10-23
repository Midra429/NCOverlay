import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'
import type {
  StateSlot,
  StateSlotDetail,
  StateSlotDetailUpdate,
} from '@/ncoverlay/state'
import type { PanelItemProps } from '@/components/PanelItem'

import { useState } from 'react'
import { cn } from '@heroui/react'

import { getNiconicoComments } from '@/utils/api/niconico/getNiconicoComments'
import { getJikkyoKakologs } from '@/utils/api/jikkyo/getJikkyoKakologs'

import { ncoState } from '@/hooks/useNco'

import { PanelItem } from '@/components/PanelItem'

import { StatusOverlay } from './StatusOverlay'
import { ButtonsOverlay } from './ButtonsOverlay'
import { AddButton } from './AddButton'
import { Thumbnail } from './Thumbnail'
import { DateTime } from './DateTime'
import { Title } from './Title'
import { Counts } from './Counts'
import { HideButton } from './HideButton'
import { TranslucentButton } from './TranslucentButton'
import { Options, OptionsButton } from './Options'

export type SlotItemProps = {
  classNames?: PanelItemProps['classNames']
  detail: StateSlotDetail
  isSearch?: boolean
  isDisabled?: boolean
}

export function SlotItem({
  classNames,
  detail,
  isSearch,
  isDisabled,
}: SlotItemProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  const isError = detail.status === 'error'

  async function onPressAdd() {
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
        const { thread, markers, kawaiiCount } = comment

        slotDetail = {
          id,
          status: 'ready',
          markers,
          info: {
            count: {
              comment: thread.commentCount,
              kawaii: kawaiiCount,
            },
          },
        }

        slot = { id, threads: [thread] }
      }
    } else {
      const [comment] = await getNiconicoComments([{ contentId: id }])

      if (comment) {
        const { data, threads, kawaiiCount } = comment

        slotDetail = {
          id,
          status: 'ready',
          info: {
            count: {
              view: data.video.count.view,
              comment: data.video.count.comment,
              kawaii: kawaiiCount,
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
      await ncoState?.update('slotDetails', ['id'], {
        id,
        status: 'error',
      })
    }

    await ncoState?.set('status', 'ready')
  }

  async function onPressRemove() {
    await ncoState?.set('status', 'loading')

    const { id } = detail

    await ncoState?.remove('slotDetails', { id })
    await ncoState?.remove('slots', { id })

    await ncoState?.set('status', 'ready')
  }

  return (
    <PanelItem
      className={cn(
        isError && 'bg-danger/15',
        isDisabled && 'pointer-events-none opacity-50'
      )}
      classNames={{
        ...classNames,
        wrapper: [
          isError && 'border-danger/50',
          isDisabled && 'border-dashed bg-transparent',
          classNames?.wrapper,
        ],
      }}
    >
      <div
        className={cn(
          'relative flex flex-row p-1',
          isSearch
            ? ['gap-1.5', detail.type === 'jikkyo' ? 'h-17' : 'h-20.5']
            : 'h-23 gap-2'
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
            offsetMs={detail.offsetMs}
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
            id={detail.info.id}
            source={detail.type === 'jikkyo' ? detail.info.source : null}
            title={detail.info.title}
            isSearch={isSearch}
          />

          {/* 再生数 / コメント数 / かわいい率 */}
          {!(detail.type === 'jikkyo' && isSearch) && (
            <Counts
              status={detail.status}
              infoCount={detail.info.count}
              isSearch={isSearch}
            />
          )}
        </div>

        {/* サイドボタン */}
        {!isError && !isSearch && (
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
      {!isError && !isSearch && (
        <Options
          isOpen={isOptionsOpen}
          id={detail.id}
          offsetMs={detail.offsetMs}
        />
      )}
    </PanelItem>
  )
}
