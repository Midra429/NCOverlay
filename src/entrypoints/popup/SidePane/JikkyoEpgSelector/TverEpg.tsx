import type { EPGData, EPGContent, EPGProgram } from '.'

import { useEffect, useState, useRef } from 'react'
import { Spinner, cn } from '@heroui/react'

import { Channels } from './Channel'
import { Hours } from './Hour'
import { Programs } from './Program'

export const COLUMN_WIDTH = 140
export const ROW_HEIGHT = 150

interface CurrentBarProps {
  top: number
  ref: React.Ref<HTMLDivElement>
}

function CurrentBar({ top, ref }: CurrentBarProps) {
  return (
    <div
      className={cn(
        'absolute z-20',
        'h-px w-full',
        'bg-primary opacity-80',
        'pointer-events-none'
      )}
      style={{ top }}
      ref={ref}
    />
  )
}

export interface TverEpgProps {
  data: EPGData | null
  isLoading?: boolean
}

export function TverEpg({ data, isLoading }: TverEpgProps) {
  const currentBarRef = useRef<HTMLDivElement>(null)

  const [time, updateTime] = useState(Date.now() / 1000)

  const tverChIds = data?.contents.map((v) => v.tverChId) ?? []

  const contents: EPGContent[] =
    data?.contents.map<EPGContent>((content) => ({
      ...content,
      programs: content.programs.map<EPGProgram>((program) => ({
        ...program,
        isDisabled: time <= program.endAt,
      })),
    })) ?? []

  useEffect(() => {
    if (isLoading || !data) return

    const intervalId = setInterval(() => {
      updateTime(Date.now() / 1000)
    }, 30 * 1000)

    setTimeout(() => {
      currentBarRef.current?.scrollIntoView({
        behavior: 'instant',
        block: 'end',
      })
    })

    return () => clearInterval(intervalId)
  }, [isLoading, data])

  return isLoading || !data ? (
    <div
      className={cn(
        'absolute inset-0 z-20',
        'flex size-full items-center justify-center'
      )}
    >
      {isLoading ? (
        <Spinner size="lg" color="primary" />
      ) : (
        <span className="text-small text-foreground-500">
          番組表データがありません
        </span>
      )}
    </div>
  ) : (
    <div className="size-full overflow-auto">
      <div className="flex size-fit flex-col">
        {/* チャンネル */}
        <Channels tverChIds={tverChIds} />

        <div className="relative flex flex-row">
          {/* 時間 */}
          <Hours />

          {/* 番組 */}
          <Programs data={{ ...data, contents }} />

          {/* 現在時刻 */}
          {data.date[0] <= time && time <= data.date[1] && (
            <CurrentBar
              top={((time - data.date[0]) / 3600) * ROW_HEIGHT}
              ref={currentBarRef}
            />
          )}
        </div>
      </div>
    </div>
  )
}
