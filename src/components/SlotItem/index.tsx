import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'
import type { PanelItemProps } from '@/components/PanelItem'
import type {
  StateSlot,
  StateSlotDetail,
  StateSlotDetailUpdate,
} from '@/ncoverlay/state'

import { useState } from 'react'
import { cn } from '@heroui/react'

import { getJikkyoKakolog } from '@/utils/api/jikkyo/getJikkyoKakolog'
import { getNiconicoComment } from '@/utils/api/niconico/getNiconicoComment'
import { ncoState } from '@/hooks/useNco'

import { PanelItem } from '@/components/PanelItem'

import { AddButton } from './AddButton'
import { ButtonsOverlay } from './ButtonsOverlay'
import { Counts } from './Counts'
import { DateTime } from './DateTime'
import { HideButton } from './HideButton'
import { Options, OptionsButton } from './Options'
import { StatusOverlay } from './StatusOverlay'
import { Thumbnail } from './Thumbnail'
import { Title } from './Title'
import { TranslucentButton } from './TranslucentButton'

export type SlotItemProps = {
  classNames?: PanelItemProps['classNames']
  detail: StateSlotDetail
  isDisabled?: boolean
} & (
  | {
      isSearch?: false
      onAdd?: undefined
    }
  | {
      isSearch: true
      onAdd?: () => void | Promise<void>
    }
)

function getAddFunction(detail: StateSlotDetail) {
  return async () => {
    if (!ncoState) return

    await ncoState.set('status', 'loading')

    await ncoState.add('slotDetails', {
      ...detail,
      status: 'loading',
    })

    const { type, id, info } = detail

    let slotDetail: StateSlotDetailUpdate | undefined
    let slot: StateSlot | undefined

    if (type === 'jikkyo') {
      const comment = await getJikkyoKakolog(ncoState, {
        jkChId: id.split(':')[0] as JikkyoChannelId,
        starttime: info.date[0] / 1000,
        endtime: info.date[1] / 1000,
      })

      if (comment) {
        const { thread, markers, chapters, kawaiiCount } = comment

        slotDetail = {
          id,
          status: 'ready',
          info: {
            count: {
              comment: thread.commentCount,
              kawaii: kawaiiCount,
            },
          },
          markers,
          chapters,
        }

        slot = { id, threads: [thread] }
      }
    } else {
      const comment = await getNiconicoComment(id)

      if (comment) {
        const {
          videoData: { video },
          threads,
          kawaiiCount,
        } = comment

        slotDetail = {
          id,
          status: 'ready',
          info: {
            count: {
              view: video.count.view,
              comment: video.count.comment,
              kawaii: kawaiiCount,
            },
            thumbnail:
              video.thumbnail.largeUrl ||
              video.thumbnail.middleUrl ||
              video.thumbnail.url,
          },
        }

        slot = { id, threads }
      }
    }

    if (slotDetail && slot) {
      await ncoState.update('slotDetails', ['id'], slotDetail)
      await ncoState.add('slots', slot)
    } else {
      await ncoState.update('slotDetails', ['id'], {
        id,
        status: 'error',
      })
    }

    await ncoState.set('status', 'ready')
  }
}

export function SlotItem({
  classNames,
  detail,
  isSearch,
  isDisabled,
  onAdd,
}: SlotItemProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  const isError = detail.status === 'error'

  const onPressAdd = isSearch ? (onAdd ?? getAddFunction(detail)) : null

  async function onPressRemove() {
    if (!ncoState) return

    const { id } = detail

    await ncoState.set('status', 'loading')

    await ncoState.remove('slotDetails', { id })
    await ncoState.remove('slots', { id })

    await ncoState.set('status', 'ready')
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
            (detail.hidden || detail.skip) && '*:opacity-50'
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

          {onPressAdd ? (
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
            (detail.hidden || detail.skip) && 'opacity-50'
          )}
        >
          {/* 日付 */}
          <DateTime infoDate={detail.info.date} isSearch={isSearch} />

          {/* タイトル */}
          <Title
            id={detail.info.id}
            source={'source' in detail.info ? detail.info.source : null}
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
              <HideButton
                id={detail.id}
                hidden={detail.hidden}
                skip={detail.skip}
              />

              {/* 半透明 */}
              <TranslucentButton
                id={detail.id}
                translucent={detail.translucent}
                hidden={detail.hidden}
                skip={detail.skip}
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
