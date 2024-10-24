import type { StateSlotDetailJikkyo } from '@/ncoverlay/state'
import type { EPGProgram, EPGContent, EPGData } from '.'

import { useMemo } from 'react'
import {
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  cn,
} from '@nextui-org/react'
import { darken, saturate, toHex } from 'color2k'
import { normalize } from '@midra/nco-parser/normalize'
import { tverToJikkyoChId } from '@midra/nco-api/utils/tverToJikkyoChId'

import { zeroPadding } from '@/utils/zeroPadding'
import { readableColor } from '@/utils/color'
import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/slot-item'

import { COLUMN_WIDTH, ROW_HEIGHT } from './TverEpg'

export type ProgramContentProps = {
  program: EPGProgram
  bgColor: [light: string, dark: string]
}

export const ProgramContent: React.FC<ProgramContentProps> = ({
  program,
  bgColor,
}) => {
  const fgColor = useMemo(() => {
    return bgColor.map((color) => readableColor(toHex(color))) as typeof bgColor
  }, [bgColor])

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

export type ProgramPopoverProps = {
  tverChId: EPGContent['tverChId']
  program: EPGProgram
}

export const ProgramPopover: React.FC<ProgramPopoverProps> = ({
  tverChId,
  program,
}) => {
  const stateSlotDetails = useNcoState('slotDetails')

  const ids = useMemo(() => {
    return stateSlotDetails?.map((v) => v.id)
  }, [stateSlotDetails])

  const { title, description, prefix, startAt, endAt } = program

  const id = `${tverToJikkyoChId(tverChId)}:${startAt}-${endAt}`

  const slotDetail: StateSlotDetailJikkyo = {
    type: 'jikkyo',
    id,
    status: 'pending',
    info: {
      id: program.id ?? null,
      title: `${prefix} ${
        normalize(description).includes(normalize(title))
          ? description
          : `${title}\n${description}`.trim()
      }`.trim(),
      duration: endAt - startAt,
      date: [startAt * 1000, endAt * 1000],
      count: {
        comment: 0,
      },
    },
  }

  return (
    <div
      className={cn('flex flex-col items-start gap-1', 'w-80 p-2', 'text-tiny')}
    >
      {title && (
        <span className="font-semibold">{`${prefix} ${title}`.trim()}</span>
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
        isDisabled={ids?.includes(id)}
      />
    </div>
  )
}

export type ProgramCellProps = {
  date: EPGData['date']
  genre: EPGData['genre']
  tverChId: EPGContent['tverChId']
  program: EPGProgram
}

export const ProgramCell: React.FC<ProgramCellProps> = ({
  date,
  genre,
  tverChId,
  program,
}) => {
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
          '!duration-150 transition-background',
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

export type ProgramsProps = {
  data: EPGData
}

export const Programs: React.FC<ProgramsProps> = ({ data }) => {
  const { date, contents, genre } = data

  return (
    <div
      className="flex shrink-0 flex-row overflow-hidden bg-content3"
      style={{ maxHeight: ROW_HEIGHT * 24 }}
    >
      {contents.map((content, idx) => (
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
          {content.programs.map((program, idx) => (
            <ProgramCell
              key={idx}
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
