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
import { CHANNEL_IDS_JIKKYO_SYOBOCAL } from '@midra/nco-api/constants'
import { syobocalToJikkyoChId } from '@midra/nco-api/utils/syobocalToJikkyoChId'

import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/slot-item'

let controller: AbortController | undefined

const SYOBOCAL_CHANNEL_IDS = CHANNEL_IDS_JIKKYO_SYOBOCAL.map(
  ([_, scChId]) => scChId
)

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
  const [slotDetails, setSlotDetails] = useState<StateSlotDetailJikkyo[]>([])

  const stateSlotDetails = useNcoState('slotDetails')

  const ids = useMemo(() => {
    return stateSlotDetails?.map((v) => v.id)
  }, [stateSlotDetails])

  const initialize = useCallback(() => {
    controller?.abort()

    setSlotDetails([])
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
      .then((programs) => {
        const slotTitle = [title.Title, `#${subtitle[0]}`, subtitle[1]]
          .join(' ')
          .trim()

        const currentTime = Date.now() / 1000

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

        setSlotDetails(details)
      })
      .catch(() => setSlotDetails([]))
      .finally(() => setIsLoading(false))
  }, [title, subtitle])

  useImperativeHandle(ref, () => {
    return { initialize }
  }, [initialize])

  return isLoading || !slotDetails.length ? (
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
    <div className="flex flex-col gap-2">
      {slotDetails.map((detail) => (
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
