import type {
  JikkyoChannelId,
  TVerChannelId,
} from '@midra/nco-api/types/constants'
import type {
  EPGv2Result,
  Program as EPGv2Program,
  GenreColor as EPGv2GenreColor,
} from '@midra/nco-api/types/tver/v1/callEPGv2'
import type { CallEPGv2Params } from '@midra/nco-api/tver/v1/callEPGv2'

import { useCallback, useEffect, useState } from 'react'
import { Button, Divider, Spinner, cn } from '@nextui-org/react'
import {
  ChevronRightIcon,
  CalendarDaysIcon,
  Tv2Icon,
  XIcon,
} from 'lucide-react'
import { ncoApi } from '@midra/nco-api'
import { tverToJikkyoChId } from '@midra/nco-api/utils/tverToJikkyoChId'
import { JIKKYO_CHANNELS } from '@midra/nco-api/constants'

import { zeroPadding } from '@/utils/zeroPadding'

import { Modal } from '@/components/modal'
import { Select, SelectItem } from '@/components/select'

import { TverEpg } from './TverEpg'

export type EPGProgram = {
  title: string
  description: string
  startAt: number
  endAt: number
  genre: EPGv2Program['genre']
  icon: EPGv2Program['icon']
  disabled?: boolean
}

export type EPGContent = {
  channel: {
    id: TVerChannelId
    jkChId: JikkyoChannelId
    name: string
  }
  programs: EPGProgram[]
}

export type EPGGenre = Record<
  EPGv2GenreColor['genre'],
  {
    name: EPGv2GenreColor['name']
    color: EPGv2GenreColor['color']
  }
>

export type EPGData = {
  date: [start: number, end: number]
  contents: EPGContent[]
  genre: EPGGenre
}

export type JikkyoEpgSelectorProps = {
  isOpen: boolean
  onOpenChange: () => void
}

export const JikkyoEpgSelector: React.FC<JikkyoEpgSelectorProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const [date, setDate] = useState<EPGv2Result['date']>()
  const [type, setType] = useState<EPGv2Result['type']>('ota')
  const [allowViewDate, setAllowViewDate] = useState<
    EPGv2Result['allowViewDate']
  >([])
  const [epgData, setEpgData] = useState<EPGData | null>(null)

  const callEPGv2 = useCallback((params: CallEPGv2Params) => {
    setIsLoading(true)

    ncoApi.tver.v1.callEPGv2(params).then((result) => {
      if (result) {
        const currentTime = new Date().getTime()
        const currentTimeSec = currentTime / 1000

        const allowViewDate = result.allowViewDate.filter((date) => {
          return new Date(`${date} 05:00:00`).getTime() <= currentTime
        })

        const start = new Date(`${result.date} 05:00:00`).getTime() / 1000
        const end = start + 86400

        const contents: EPGContent[] = result.contents.flatMap(
          ({ broadcaster, programs }) => {
            const jkChId = tverToJikkyoChId(broadcaster.id)

            if (!jkChId) return []

            return {
              channel: {
                id: broadcaster.id,
                jkChId,
                name: JIKKYO_CHANNELS[jkChId],
              },
              programs: programs.flatMap((program) => ({
                title: program.seriesTitle || program.title,
                description: program.seriesTitle && program.title,
                startAt: program.startAt,
                endAt: program.endAt,
                genre: program.genre,
                icon: program.icon,
                disabled: currentTimeSec <= program.endAt,
              })),
            }
          }
        )

        const genre = Object.fromEntries(
          result.genreColor.map((val) => {
            return [
              val.genre,
              {
                name: val.name,
                color: val.color,
              },
            ]
          })
        ) as EPGGenre

        setDate(result.date)
        setType(result.type)
        setAllowViewDate(allowViewDate)
        setEpgData({ date: [start, end], contents, genre })
      } else {
        setDate(undefined)
        setType('ota')
        setAllowViewDate([])
        setEpgData(null)
      }

      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    // 5時スタートなので、5時間分マイナス
    const currentDate = new Date(Date.now() - 5 * 60 * 60 * 1000)

    const date = [
      currentDate.getFullYear(),
      zeroPadding(currentDate.getMonth() + 1, 2),
      zeroPadding(currentDate.getDate(), 2),
    ].join('/')

    callEPGv2({ date, type })
  }, [])

  return (
    <Modal
      fullWidth
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      header={
        <div className="flex flex-row items-center gap-0.5">
          <span>追加</span>
          <ChevronRightIcon className="size-5 opacity-50" />
          <span>ニコニコ実況 過去ログ (番組表)</span>
        </div>
      }
      headerEndContent={
        <div className="flex h-full flex-row gap-2">
          <Divider orientation="vertical" />

          <Select
            classNames={{
              label: 'hidden',
              mainWrapper: 'min-w-44 shrink-0',
            }}
            size="sm"
            label="日付"
            labelPlacement="outside-left"
            startContent={<CalendarDaysIcon className="size-4" />}
            selectedKeys={date && [date]}
            onSelectionChange={([key]) => {
              const date = key as EPGv2Result['date'] | undefined

              if (date) {
                setDate(date)
                callEPGv2({ date, type })
              }
            }}
          >
            {allowViewDate.map((date) => {
              const dow = ['日', '月', '火', '水', '木', '金', '土'][
                new Date(date).getDay()
              ]

              return <SelectItem key={date}>{`${date}(${dow})`}</SelectItem>
            })}
          </Select>

          <Select
            classNames={{
              label: 'hidden',
              mainWrapper: 'min-w-32 shrink-0',
            }}
            size="sm"
            label="チャンネル"
            labelPlacement="outside-left"
            startContent={<Tv2Icon className="size-4" />}
            selectedKeys={[type]}
            onSelectionChange={([key]) => {
              const type = key as EPGv2Result['type'] | undefined

              if (type) {
                setType(type)
                callEPGv2({ date, type })
              }
            }}
          >
            <SelectItem key="ota">地デジ</SelectItem>
            <SelectItem key="bs">BS</SelectItem>
          </Select>

          <Divider orientation="vertical" />

          <Button
            className="shrink-0"
            size="sm"
            variant="flat"
            startContent={<XIcon className="size-4" />}
            onPress={onOpenChange}
          >
            閉じる
          </Button>
        </div>
      }
      footer={false}
    >
      {isLoading || !epgData ? (
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
        <TverEpg data={epgData} />
      )}
    </Modal>
  )
}
