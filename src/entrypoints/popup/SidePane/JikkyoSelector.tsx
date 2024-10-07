import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type { StateSlotDetailJikkyo } from '@/ncoverlay/state'

import { useCallback, useMemo, useState } from 'react'
import { Button, ButtonGroup, cn } from '@nextui-org/react'
import {
  ChevronRightIcon,
  CalendarDaysIcon,
  ChevronsDownIcon,
  PlusIcon,
} from 'lucide-react'
import { now, getLocalTimeZone } from '@internationalized/date'
import { JIKKYO_CHANNELS } from '@midra/nco-api/constants'

import { JIKKYO_CHANNEL_GROUPS } from '@/constants/channels'

import { formatDate } from '@/utils/format'
import { getJikkyoKakologs } from '@/utils/api/getJikkyoKakologs'

import { ncoState, useNcoState } from '@/hooks/useNco'

import { Modal } from '@/components/modal'
import { Select, SelectSection, SelectItem } from '@/components/select'
import { DatePicker } from '@/components/date-picker'
import { SlotItem } from '@/components/slot-item'

const MAX_DURATION = 6 * 60 * 60 * 1000

export type JikkyoSelectorProps = {
  isOpen: boolean
  onOpenChange: () => void
}

export const JikkyoSelector: React.FC<JikkyoSelectorProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const currentDateTime = useMemo(() => now(getLocalTimeZone()), [])

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

  const isReady = useMemo(() => {
    return !(stateStatus === 'searching' || stateStatus === 'loading')
  }, [stateStatus])

  const isValid = useMemo(() => {
    if (!jkChId || 0 < endDateTime.compare(currentDateTime)) {
      return false
    }

    const dateTimeDiff = endDateTime.compare(startDateTime)

    return 0 < dateTimeDiff && dateTimeDiff <= MAX_DURATION
  }, [jkChId, startDateTime, endDateTime])

  const slotDetail = useMemo<StateSlotDetailJikkyo | null>(() => {
    if (!isValid) return null

    const starttime = startDateTime.toDate().getTime()
    const endtime = endDateTime.toDate().getTime()

    return {
      type: 'jikkyo',
      id: `${jkChId!}:${starttime / 1000}-${endtime / 1000}`,
      status: 'pending',
      info: {
        id: null,
        title: [
          `${jkChId!}: ${JIKKYO_CHANNELS[jkChId!]}`,
          `${formatDate(starttime, 'YYYY/MM/DD hh:mm')} 〜 ${formatDate(endtime, 'hh:mm')}`,
        ].join('\n'),
        duration: (endtime - starttime) / 1000,
        date: [starttime, endtime],
        count: {
          comment: 0,
        },
      },
    }
  }, [jkChId, startDateTime, endDateTime])

  const onAdd = useCallback(async () => {
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
      const { thread, markers } = comment

      await ncoState?.update('slotDetails', ['id'], {
        id,
        status: 'ready',
        markers,
        info: {
          count: {
            comment: thread.commentCount,
          },
        },
      })

      await ncoState?.add('slots', {
        id,
        threads: [thread],
      })
    } else {
      await ncoState?.remove('slotDetails', { id })
    }

    await ncoState?.set('status', 'ready')
  }, [slotDetail])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      okText="追加"
      okIcon={<PlusIcon className="size-4" />}
      isOkDisabled={!isValid || !isReady}
      onOk={onAdd}
      header={
        <div className="flex flex-row items-center gap-0.5">
          <span>コメント追加</span>
          <ChevronRightIcon className="size-5 opacity-50" />
          <span>ニコニコ実況 過去ログ</span>
        </div>
      }
    >
      <div
        className={cn(
          'flex flex-col gap-2',
          'p-2',
          'border-b-1 border-foreground-200',
          'bg-content1'
        )}
      >
        {/* チャンネル */}
        <Select
          classNames={{
            base: 'justify-between',
            mainWrapper: 'max-w-64',
            innerWrapper: 'gap-3',
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
                  <SelectItem key={id} variant="flat">
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
          maxValue={currentDateTime}
          value={startDateTime}
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
                  'border-divider [&:not(:first-child)]:border-l-1'
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
            startContent={<ChevronsDownIcon className="size-4" />}
            onPress={() => setEndDateTime(startDateTime)}
          />

          <ButtonGroup size="sm" variant="flat" isDisabled={!isReady}>
            {[5, 30].map((min) => (
              <Button
                key={min}
                className={cn(
                  'min-w-8 px-2',
                  'border-divider [&:not(:first-child)]:border-l-1'
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
          maxValue={currentDateTime}
          value={endDateTime}
          onChange={setEndDateTime as any}
        />
      </div>

      <div className="p-2">
        {slotDetail && <SlotItem detail={slotDetail} isSearch />}
      </div>
    </Modal>
  )
}