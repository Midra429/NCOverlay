import type { SyoboCalProgram } from '@midra/nco-api/types/syobocal/json'
import type { StateSlotDetailJikkyo } from '@/ncoverlay/state'
import type { ScTitleItem } from './TitleItem'
import type { ScSubtitleItem } from './SubtitleItem'

import {
  useMemo,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { Spinner } from '@nextui-org/react'
import { ncoApi } from '@midra/nco-api'
import { syobocalToJikkyoChId } from '@midra/nco-api/utils/syobocalToJikkyoChId'

import { SYOBOCAL_CHANNEL_IDS } from '@/constants/channels'

import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/slot-item'

let controller: AbortController | undefined

export type SubtitleDetailHandle = {
  initialize: () => void
}

export type SubtitleDetailProps = {
  title: ScTitleItem
  subtitle: ScSubtitleItem
}

export const SubtitleDetail = forwardRef<
  SubtitleDetailHandle,
  SubtitleDetailProps
>(({ title, subtitle }, ref) => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTid, setCurrentTid] = useState('')
  const [programs, setPrograms] = useState<SyoboCalProgram[]>([])

  const stateSlotDetails = useNcoState('slotDetails')

  const ids = useMemo(() => {
    return stateSlotDetails?.map((v) => v.id)
  }, [stateSlotDetails])

  const programItems = useMemo(() => {
    const currentTime = Date.now() / 1000
    const slotTitle = [title.Title, `#${Number(subtitle[0])}`, subtitle[1]]
      .join(' ')
      .trim()

    const details: StateSlotDetailJikkyo[] = programs.flatMap((program) => {
      const id = `${syobocalToJikkyoChId(program.ChID)}:${program.StTime}-${program.EdTime}`

      if (currentTime < parseInt(program.EdTime)) {
        return []
      }

      const starttime = parseInt(program.StTime) * 1000
      const endtime = parseInt(program.EdTime) * 1000

      return {
        type: 'jikkyo',
        id,
        status: 'pending',
        info: {
          id: program.TID,
          title: slotTitle,
          duration: (endtime - starttime) / 1000,
          date: [starttime, endtime],
          count: {
            comment: 0,
          },
        },
      }
    })

    return details
  }, [programs])

  const initialize = useCallback(() => {
    if (title.TID === currentTid) return

    controller?.abort()

    setCurrentTid(title.TID)
    setPrograms([])
    setIsLoading(true)

    controller = new AbortController()

    const { signal } = controller

    new Promise<SyoboCalProgram[]>((resolve, reject) => {
      signal.addEventListener('abort', reject, { once: true })

      ncoApi.syobocal
        .json(['ProgramByCount'], {
          TID: title.TID,
          Count: Number(subtitle[0]),
          ChID: SYOBOCAL_CHANNEL_IDS,
        })
        .then((response) => {
          if (response) {
            const programs = Object.values(response.Programs)

            resolve(programs)
          } else {
            reject()
          }
        })
        .catch(() => reject())
    })
      .then((value) => setPrograms(value))
      .catch(() => setPrograms([]))
      .finally(() => setIsLoading(false))
  }, [title, subtitle, currentTid])

  useImperativeHandle(ref, () => {
    return { initialize }
  }, [initialize])

  return isLoading || !programItems.length ? (
    <div className="flex size-full items-center justify-center py-1">
      {isLoading ? (
        <Spinner size="sm" color="primary" />
      ) : (
        <span className="my-0.5 text-tiny text-foreground-500">
          放送時間がありません
        </span>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-1.5">
      {programItems.map((detail) => (
        <SlotItem
          key={detail.id}
          detail={detail}
          isSearch
          isDisabled={ids?.includes(detail.id)}
        />
      ))}
    </div>
  )
})
