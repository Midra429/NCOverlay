import type { EPGData, EPGContent, EPGProgram } from '.'

import { useEffect, useMemo, useState } from 'react'
import { Spinner, cn } from '@nextui-org/react'

import { Channels } from './Channel'
import { Hours } from './Hour'
import { Programs } from './Program'

export const COLUMN_WIDTH = 140
export const ROW_HEIGHT = 150

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
  data: EPGData | null
  isLoading?: boolean
}

export const TverEpg: React.FC<TverEpgProps> = ({ data, isLoading }) => {
  const [time, updateTime] = useState(Date.now() / 1000)

  const contents: EPGContent[] = useMemo(() => {
    if (!data) return []

    return data.contents.map<EPGContent>((content) => ({
      ...content,
      programs: content.programs.map<EPGProgram>((program) => ({
        ...program,
        isDisabled: time <= program.endAt,
      })),
    }))
  }, [data, time])

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateTime(Date.now() / 1000)
    }, 30 * 1000)

    return () => clearInterval(intervalId)
  }, [])

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
        <Channels tverChIds={contents.map((v) => v.tverChId)} />

        <div className="relative flex flex-row">
          {/* 時間 */}
          <Hours />

          {/* 番組 */}
          <Programs data={{ ...data, contents }} />

          {/* 現在時刻 */}
          {data.date[0] <= time && time <= data.date[1] && (
            <CurrentBar top={((time - data.date[0]) / 3600) * ROW_HEIGHT} />
          )}
        </div>
      </div>
    </div>
  )
}