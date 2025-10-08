import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'
import type { StateSlotDetailJikkyo } from '@/ncoverlay/state'

import { useState } from 'react'
import { Button, ButtonGroup, cn } from '@heroui/react'
import {
  ChevronRightIcon,
  CalendarDaysIcon,
  ChevronsDownIcon,
  PlusIcon,
} from 'lucide-react'
import { now, getLocalTimeZone, ZonedDateTime } from '@internationalized/date'
import { JIKKYO_CHANNELS } from '@midra/nco-utils/api/constants'

import { JIKKYO_CHANNEL_GROUPS } from '@/constants/channels'

import { formatDate } from '@/utils/format'
import { getJikkyoKakologs } from '@/utils/api/getJikkyoKakologs'

import { ncoState, useNcoState } from '@/hooks/useNco'

import { Modal } from '@/components/Modal'
import { Select, SelectSection, SelectItem } from '@/components/Select'
import { DatePicker } from '@/components/DatePicker'
import { SlotItem } from '@/components/SlotItem'

const MAX_DURATION = 6 * 60 * 60 * 1000

function createSlotDetailJikkyo({
  jkChId,
  currentDateTime,
  startDateTime,
  endDateTime,
}: {
  jkChId: JikkyoChannelId
  currentDateTime: ZonedDateTime
  startDateTime: ZonedDateTime
  endDateTime: ZonedDateTime
}): StateSlotDetailJikkyo | null {
  const dateTimeDiff = endDateTime.compare(startDateTime)

  if (
    !jkChId ||
    // まだ終わってない
    0 < endDateTime.compare(currentDateTime) ||
    // 終了日時 <= 開始日時
    dateTimeDiff <= 0 ||
    // 6時間以上
    MAX_DURATION < dateTimeDiff
  ) {
    return null
  }

  const starttime = startDateTime.toDate().getTime()
  const endtime = endDateTime.toDate().getTime()

  return {
    type: 'jikkyo',
    id: `${jkChId}:${starttime / 1000}-${endtime / 1000}`,
    status: 'pending',
    info: {
      id: null,
      source: null,
      title: [
        `${jkChId}: ${JIKKYO_CHANNELS[jkChId]}`,
        `${formatDate(starttime, 'YYYY/MM/DD hh:mm')} 〜 ${formatDate(endtime, 'hh:mm')}`,
      ].join('\n'),
      duration: (endtime - starttime) / 1000,
      date: [starttime, endtime],
      count: {
        comment: 0,
      },
    },
  }
}

export type JikkyoSelectorProps = {
  isOpen: boolean
  onOpenChange: () => void
}

export function JikkyoSelector({ isOpen, onOpenChange }: JikkyoSelectorProps) {
  const currentDateTime = now(getLocalTimeZone())

  const [jkChId, setJkChId] = useState<JikkyoChannelId>()
  const [endDateTime, setEndDateTime] = useState(
    currentDateTime.set({
      minute: 0,
      second: 0,
      millisecond: 0,
    })
  )
  const [startDateTime, setStartDateTime] = useState(
    endDateTime.add({ minutes: -30 })
  )

  const stateStatus = useNcoState('status')
  const stateSlotDetails = useNcoState('slotDetails')

  const isReady = !(stateStatus === 'searching' || stateStatus === 'loading')

  const ids = stateSlotDetails?.map((v) => v.id)

  const slotDetail =
    jkChId &&
    createSlotDetailJikkyo({
      jkChId,
      currentDateTime,
      startDateTime,
      endDateTime,
    })

  async function onAdd() {
    if (!slotDetail) return

    await ncoState?.add('slotDetails', {
      ...slotDetail,
      status: 'loading',
    })

    await ncoState?.set('status', 'loading')

    const { id } = slotDetail

    const [comment] = await getJikkyoKakologs([
      {
        jkChId: jkChId!,
        starttime: startDateTime.toDate().getTime() / 1000,
        endtime: endDateTime.toDate().getTime() / 1000,
      },
    ])

    if (comment) {
      const { thread, markers, kawaiiCount } = comment

      await ncoState?.update('slotDetails', ['id'], {
        id,
        status: 'ready',
        markers,
        info: {
          count: {
            comment: thread.commentCount,
            kawaii: kawaiiCount,
          },
        },
      })

      await ncoState?.add('slots', {
        id,
        threads: [thread],
      })
    } else {
      await ncoState?.update('slotDetails', ['id'], {
        id,
        status: 'error',
      })
    }

    await ncoState?.set('status', 'ready')
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      okText="追加"
      okIcon={<PlusIcon className="size-4" />}
      isOkDisabled={!isReady || !slotDetail || ids?.includes(slotDetail.id)}
      onOk={onAdd}
      header={
        <div className="flex flex-row items-center gap-0.5">
          <span>追加</span>
          <ChevronRightIcon className="size-5 opacity-50" />
          <span>ニコニコ実況 過去ログ</span>
        </div>
      }
    >
      <div
        className={cn(
          'flex flex-col gap-2',
          'p-2',
          'border-foreground-200 border-b-1',
          'bg-content1'
        )}
      >
        {/* チャンネル */}
        <Select
          classNames={{
            base: 'justify-between',
            mainWrapper: 'max-w-64',
            value: 'justify-start',
            listboxWrapper: 'max-h-80',
          }}
          size="sm"
          label="チャンネル"
          labelPlacement="outside-left"
          isDisabled={!isReady}
          selectedKeys={[jkChId as string]}
          onSelectionChange={([key]) => setJkChId(key as JikkyoChannelId)}
        >
          {...Object.entries(JIKKYO_CHANNEL_GROUPS).map(
            ([key, { TITLE, IDS }]) => (
              <SelectSection
                key={key}
                classNames={{
                  base: [
                    '[&:last-child]:mb-0',
                    '[&:last-child>ul>li[role="separator"]]:hidden',
                  ],
                }}
                showDivider
                title={TITLE}
              >
                {IDS.map((id) => (
                  <SelectItem key={id}>
                    {`${id}: ${JIKKYO_CHANNELS[id]}`}
                  </SelectItem>
                ))}
              </SelectSection>
            )
          )}
        </Select>

        {/* 開始日時 */}
        <DatePicker
          popoverProps={{
            placement: 'left-end',
          }}
          label="開始日時"
          selectorIcon={<CalendarDaysIcon />}
          isDisabled={!isReady}
          maxValue={currentDateTime as any}
          value={startDateTime as any}
          onChange={setStartDateTime as any}
        />

        {/* ボタン */}
        <div className="ml-auto flex w-64 flex-row justify-between">
          <ButtonGroup size="sm" variant="flat" isDisabled={!isReady}>
            {[-30, -5].map((min) => (
              <Button
                key={min}
                className={cn(
                  'min-w-8 px-2',
                  'border-divider [&:not(:first-child)]:border-l-1',
                  'first:rounded-s-small! last:rounded-e-small!'
                )}
                onPress={() => {
                  setEndDateTime((date) => date.add({ minutes: min }))
                }}
              >
                {min}分
              </Button>
            ))}
          </ButtonGroup>

          <Button
            size="sm"
            variant="flat"
            isIconOnly
            isDisabled={!isReady}
            onPress={() => setEndDateTime(startDateTime)}
          >
            <ChevronsDownIcon className="size-4" />
          </Button>

          <ButtonGroup size="sm" variant="flat" isDisabled={!isReady}>
            {[5, 30].map((min) => (
              <Button
                key={min}
                className={cn(
                  'min-w-8 px-2',
                  'border-divider [&:not(:first-child)]:border-l-1',
                  'first:rounded-s-small! last:rounded-e-small!'
                )}
                onPress={() => {
                  setEndDateTime((date) => date.add({ minutes: min }))
                }}
              >
                +{min}分
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* 終了日時 */}
        <DatePicker
          popoverProps={{
            placement: 'left-start',
          }}
          label="終了日時"
          selectorIcon={<CalendarDaysIcon />}
          isDisabled={!isReady}
          maxValue={currentDateTime as any}
          value={endDateTime as any}
          onChange={setEndDateTime as any}
        />
      </div>

      <div className="p-2">
        {slotDetail && (
          <SlotItem
            detail={slotDetail}
            isSearch
            isDisabled={ids?.includes(slotDetail.id)}
          />
        )}
      </div>
    </Modal>
  )
}
