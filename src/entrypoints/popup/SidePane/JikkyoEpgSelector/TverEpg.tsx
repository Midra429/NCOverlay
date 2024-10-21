import type { EPGData, EPGProgram } from '.'
import type { StateSlotDetailJikkyo } from '@/ncoverlay/state'

import { memo, useEffect, useMemo, useState } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Divider,
  cn,
} from '@nextui-org/react'
import { darken, saturate, toHex } from 'color2k'
import { normalize } from '@midra/nco-parser/normalize'

import { zeroPadding } from '@/utils/zeroPadding'
import { readableColor } from '@/utils/color'
import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/slot-item'

const COLUMN_WIDTH = 140
const ROW_HEIGHT = 150

const ChannelCell: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        'shrink-0',
        'border-r-1 border-divider',
        'bg-content2 text-content2-foreground',
        'text-mini font-semibold',
        'line-clamp-1'
      )}
      style={{
        width: COLUMN_WIDTH,
        height: 20,
      }}
    >
      <span>{name}</span>
    </div>
  )
}

const HourCell: React.FC<{ hour: number }> = ({ hour }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center',
        'shrink-0',
        'bg-content1',
        'border-b-1 border-divider',
        'text-mini font-semibold'
      )}
      style={{
        height: ROW_HEIGHT,
      }}
    >
      <span className={cn('sticky top-[21px]', 'py-1')}>{hour}</span>
    </div>
  )
}

const Hours: React.FC = memo(() => (
  <div
    className={cn(
      'sticky left-0 z-20',
      'flex flex-col',
      'shrink-0',
      'border-r-1 border-divider'
    )}
    style={{
      width: 20,
    }}
  >
    {Array(24)
      .fill(0)
      .map((_, i) => (i + 5) % 24)
      .map((hour) => (
        <HourCell key={hour} hour={hour} />
      ))}
  </div>
))

const ProgramCell: React.FC<{
  program: EPGProgram
  bgColor: [light: string, dark: string]
  fgColor: [light: string, dark: string]
}> = ({ program, bgColor, fgColor }) => {
  const startMinutes = useMemo(() => {
    return zeroPadding(new Date(program.startAt * 1000).getMinutes(), 2)
  }, [program.startAt])

  return (
    <div
      className={cn(
        'size-full',
        'border-b-1 border-divider',
        'overflow-hidden',
        'cursor-pointer'
      )}
    >
      <div
        className={cn('flex flex-col gap-1', 'break-all text-mini')}
        title={program.description}
      >
        <span className="flex items-start gap-1">
          {/* 分 */}
          <span className="flex shrink-0 font-semibold">
            <span
              className={cn(
                'text-center',
                'w-6 py-1',
                'border-b-1 border-r-1 border-divider',
                'dark:hidden'
              )}
              style={{
                backgroundColor: bgColor[0],
                color: fgColor[0],
              }}
            >
              {startMinutes}
            </span>

            <span
              className={cn(
                'text-center',
                'w-6 py-1',
                'border-b-1 border-r-1 border-divider',
                'hidden dark:inline'
              )}
              style={{
                backgroundColor: bgColor[1],
                color: fgColor[1],
              }}
            >
              {startMinutes}
            </span>
          </span>

          {/* タイトル */}
          <span className="pr-1 pt-1 font-semibold">
            {`${program.prefix} ${program.title}`.trim()}
          </span>
        </span>

        {/* 概要 */}
        <span className="px-1 text-foreground-500 dark:text-foreground-600">
          {program.description}
        </span>
      </div>
    </div>
  )
}

const Programs: React.FC<{ data: EPGData }> = ({ data }) => {
  const { date, contents, genre } = data

  const stateSlotDetails = useNcoState('slotDetails')

  const ids = useMemo(() => {
    return stateSlotDetails?.map((v) => v.id)
  }, [stateSlotDetails])

  return (
    <div
      className="flex shrink-0 flex-row overflow-hidden bg-content3"
      style={{ maxHeight: ROW_HEIGHT * 24 }}
    >
      {contents.map((content, idx) => {
        const { jkChId } = content.channel

        return (
          <div
            key={idx}
            className={cn(
              'relative',
              'flex flex-col',
              'shrink-0',
              'border-r-1 border-divider'
            )}
            style={{ width: COLUMN_WIDTH }}
          >
            {content.programs.map((program, idx) => {
              const { title, description, prefix, startAt, endAt } = program

              const duration = endAt - startAt

              const height = (duration / 3600) * ROW_HEIGHT
              const top = ((startAt - date[0]) / 3600) * ROW_HEIGHT

              const color = genre[program.genre]?.color ?? '#D3D3D3'

              const bgColorLight = saturate(color, 0.2)
              const bgColorDark = saturate(darken(bgColorLight, 0.2), -0.4)
              const fgColorLight = readableColor(toHex(bgColorLight))
              const fgColorDark = readableColor(toHex(bgColorDark))

              const slotDetail: StateSlotDetailJikkyo = {
                type: 'jikkyo',
                id: `${jkChId}:${startAt}-${endAt}`,
                status: 'pending',
                info: {
                  id: program.id ?? null,
                  title: `${prefix} ${
                    normalize(description).includes(normalize(title))
                      ? description
                      : `${title}\n${description}`.trim()
                  }`.trim(),
                  duration,
                  date: [startAt * 1000, endAt * 1000],
                  count: {
                    comment: 0,
                  },
                },
              }

              return (
                <Popover
                  key={idx}
                  classNames={{
                    backdrop: 'bg-transparent',
                    content: 'border-1 border-foreground-100',
                  }}
                  backdrop="opaque"
                  placement="right-start"
                >
                  <PopoverTrigger
                    className={cn(
                      'bg-content1 hover:bg-content2/90 aria-expanded:bg-content2/90',
                      '!duration-150 transition-background',
                      'aria-expanded:scale-100',
                      'aria-expanded:opacity-100',
                      program.disabled && 'pointer-events-none opacity-50'
                    )}
                  >
                    <div className="absolute w-full" style={{ top, height }}>
                      <ProgramCell
                        program={program}
                        bgColor={[bgColorLight, bgColorDark]}
                        fgColor={[fgColorLight, fgColorDark]}
                      />
                    </div>
                  </PopoverTrigger>

                  <PopoverContent
                    className={cn(
                      'flex flex-col items-start gap-1',
                      'w-80 p-2',
                      'text-tiny'
                    )}
                  >
                    {title && (
                      <span className="font-semibold">
                        {`${prefix} ${title}`.trim()}
                      </span>
                    )}
                    {description && (
                      <span className="text-foreground-500 dark:text-foreground-600">
                        {description}
                      </span>
                    )}

                    <Divider className="my-1" />

                    <SlotItem
                      classNames={{
                        wrapper: 'w-full',
                      }}
                      detail={slotDetail}
                      isSearch
                      isDisabled={ids?.includes(slotDetail.id)}
                    />
                  </PopoverContent>
                </Popover>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

const CurrentBar: React.FC<{ top: number }> = ({ top }) => {
  return (
    <div
      className={cn(
        'absolute z-20',
        'h-[1px] w-full',
        'bg-primary opacity-80',
        'pointer-events-none'
      )}
      style={{ top }}
    />
  )
}

export type TverEpgProps = {
  data: EPGData
}

export const TverEpg: React.FC<TverEpgProps> = ({ data }) => {
  const { date, contents } = data

  const [time, updateTime] = useState(Date.now() / 1000)

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateTime(Date.now() / 1000)
    }, 30 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="size-full overflow-auto">
      <div className="flex size-fit flex-col">
        {/* チャンネル */}
        <div
          className={cn(
            'sticky top-0 z-30',
            'flex flex-row',
            'border-b-1 border-divider'
          )}
        >
          <div
            className={cn('shrink-0 bg-content2', 'border-r-1 border-divider')}
            style={{ width: 20 }}
          />

          {contents.map(({ channel }) => (
            <ChannelCell key={channel.id} name={channel.name} />
          ))}
        </div>

        <div className="relative flex flex-row">
          {/* 時間 */}
          <Hours />

          {/* 番組 */}
          <Programs data={data} />

          {/* 現在時刻 */}
          {date[0] <= time && time <= date[1] && (
            <CurrentBar top={((time - date[0]) / 3600) * ROW_HEIGHT} />
          )}
        </div>
      </div>
    </div>
  )
}
