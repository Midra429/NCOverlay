import type { SyoboCalProgramDb } from '@midra/nco-api/types/syobocal/db'
import type { ScTitleItem } from './TitleItem'
import type { ScSubtitleItem } from './SubtitleItem'

import { useMemo, useCallback, useState, useImperativeHandle } from 'react'
import { Spinner } from '@nextui-org/react'

import { SYOBOCAL_CHANNEL_IDS } from '@/constants/channels'

import { programToSlotDetail } from '@/utils/api/programToSlotDetail'
import { ncoApiProxy } from '@/proxy/nco-api/extension'
import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/SlotItem'

export type SubtitleDetailHandle = {
  initialize: () => void
}

export type SubtitleDetailProps = {
  title: ScTitleItem
  subtitle: ScSubtitleItem
  ref: React.Ref<SubtitleDetailHandle>
}

export const SubtitleDetail: React.FC<SubtitleDetailProps> = ({
  title,
  subtitle,
  ref,
}) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [programs, setPrograms] = useState<SyoboCalProgramDb[]>([])

  const stateSlotDetails = useNcoState('slotDetails')

  const ids = useMemo(() => {
    return stateSlotDetails?.map((v) => v.id)
  }, [stateSlotDetails])

  const programItems = useMemo(() => {
    const currentDate = new Date()
    const slotTitle = [title.Title, `#${Number(subtitle[0])}`, subtitle[1]]
      .filter(Boolean)
      .join(' ')
      .trim()

    return programs
      .filter((program) => new Date(program.EdTime) <= currentDate)
      .sort((a, b) => (new Date(a.StTime) > new Date(b.StTime) ? 1 : -1))
      .map((program) => programToSlotDetail(slotTitle, program))
  }, [programs])

  const initialize = useCallback(async () => {
    if (isInitialized) return

    setIsInitialized(true)
    setIsLoading(true)
    setPrograms([])

    const response = await ncoApiProxy.syobocal.db('ProgLookup', {
      TID: title.TID,
      Count: Number(subtitle[0]),
      ChID: SYOBOCAL_CHANNEL_IDS,
    })

    if (response) {
      setPrograms(Object.values(response))
    }

    setIsLoading(false)
  }, [isInitialized, title.TID, subtitle[0]])

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
    <div className="flex min-h-7 flex-col gap-1.5">
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
}
