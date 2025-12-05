import type { StateSlotDetailJikkyo } from '@/ncoverlay/state'
import type { EPGProgram, EPGContent, EPGData } from '.'

import {
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  cn,
} from '@heroui/react'
import { darken, saturate, toHex } from 'color2k'
import { zeroPadding } from '@midra/nco-utils/common/zeroPadding'
import { normalize } from '@midra/nco-utils/parse/libs/normalize'
import { tverJikkyoChIdMap } from '@midra/nco-utils/api/constants'

import { readableColor } from '@/utils/color'
import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/SlotItem'
import { ProgramIcons } from '@/components/ProgramIcons'

import { COLUMN_WIDTH, ROW_HEIGHT } from './TverEpg'

export interface ProgramContentProps {
  program: EPGProgram
  bgColor: [light: string, dark: string]
}

export function ProgramContent({ program, bgColor }: ProgramContentProps) {
  const fgColor = bgColor.map((color) =>
    readableColor(toHex(color))
  ) as typeof bgColor
  const startMinutes = zeroPadding(
    new Date(program.startAt * 1000).getMinutes(),
    2
  )

  return (
    <div
      className={cn(
        'size-full',
        'border-divider border-b-1',
        'overflow-hidden',
        'cursor-pointer'
      )}
    >
      <div
        className={cn('flex flex-col gap-1', 'break-all text-mini')}
        title={program.description || program.title}
      >
        <span className="flex items-start gap-1">
          {/* 分 */}
          <span className="flex shrink-0 font-semibold">
            <span
              className={cn(
                'text-center',
                'w-6 py-1',
                'border-divider border-r-1 border-b-1',
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
                'border-divider border-r-1 border-b-1',
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
          <span className="pt-1 pr-1 font-semibold">
            <ProgramIcons icon={program.icon} />

            <span>{program.title}</span>
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

export interface ProgramPopoverProps {
  tverChId: EPGContent['tverChId']
  program: EPGProgram
}

export function ProgramPopover({ tverChId, program }: ProgramPopoverProps) {
  const stateSlotDetails = useNcoState('slotDetails')

  const ids = stateSlotDetails?.map((v) => v.id) ?? []

  const { title, description, startAt, endAt, icon } = program

  const id = `${tverJikkyoChIdMap.get(tverChId)}:${startAt}-${endAt}`

  const slotTitle = [
    icon.revival && '🈞',
    icon.new && '🈟',
    icon.last && '🈡',

    description && normalize(description).includes(normalize(title))
      ? description
      : `${title}\n${description}`,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  const slotDetail: StateSlotDetailJikkyo = {
    type: 'jikkyo',
    id,
    status: 'pending',
    info: {
      id: program.id ?? null,
      source: 'tver',
      title: slotTitle,
      duration: endAt - startAt,
      date: [startAt * 1000, endAt * 1000],
      count: {
        comment: 0,
      },
    },
  }

  return (
    <div
      className={cn(
        'flex flex-col items-start gap-0.5',
        'w-80 p-2',
        'text-tiny'
      )}
    >
      {title && (
        <span className="font-semibold">
          <ProgramIcons icon={program.icon} />

          <span>{title}</span>
        </span>
      )}

      {description && (
        <span className="text-foreground-500 dark:text-foreground-600">
          {description}
        </span>
      )}

      <Divider className="my-1.5" />

      <SlotItem
        classNames={{
          wrapper: 'w-full',
        }}
        detail={slotDetail}
        isSearch
        isDisabled={ids.includes(id)}
      />
    </div>
  )
}

export interface ProgramCellProps {
  date: EPGData['date']
  genre: EPGData['genre']
  tverChId: EPGContent['tverChId']
  program: EPGProgram
}

export function ProgramCell({
  date,
  genre,
  tverChId,
  program,
}: ProgramCellProps) {
  const { startAt, endAt } = program

  const height = ((endAt - startAt) / 3600) * ROW_HEIGHT
  const top = ((startAt - date[0]) / 3600) * ROW_HEIGHT

  const color = genre[program.genre]?.color ?? '#D3D3D3'

  const bgColorLight = saturate(color, 0.2)
  const bgColorDark = saturate(darken(bgColorLight, 0.2), -0.4)

  return (
    <Popover
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
          'transition-background duration-150!',
          'aria-expanded:scale-100',
          'aria-expanded:opacity-100',
          program.isDisabled && 'pointer-events-none opacity-50'
        )}
      >
        <div className="absolute w-full" style={{ top, height }}>
          <ProgramContent
            program={program}
            bgColor={[bgColorLight, bgColorDark]}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <ProgramPopover tverChId={tverChId} program={program} />
      </PopoverContent>
    </Popover>
  )
}

export interface ProgramsProps {
  data: EPGData
}

export function Programs({ data }: ProgramsProps) {
  const { date, contents, genre } = data

  return (
    <div
      className="flex shrink-0 flex-row overflow-hidden bg-content3"
      style={{ maxHeight: ROW_HEIGHT * 24 }}
    >
      {contents.map((content) => (
        <div
          key={content.tverChId}
          className={cn(
            'relative',
            'flex flex-col',
            'shrink-0',
            'border-divider border-r-1'
          )}
          style={{ width: COLUMN_WIDTH }}
        >
          {content.programs.map((program) => (
            <ProgramCell
              key={`${content.tverChId}-${program.startAt}-${program.endAt}`}
              date={date}
              genre={genre}
              tverChId={content.tverChId}
              program={program}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
