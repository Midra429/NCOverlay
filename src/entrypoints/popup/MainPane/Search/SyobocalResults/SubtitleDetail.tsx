import type { SyoboCalProgramDb } from '@midra/nco-utils/types/api/syobocal/db'
import type { ScTitleItem } from './TitleItem'
import type { ScSubtitleItem } from './SubtitleItem'

import { useState, useImperativeHandle } from 'react'
import { Spinner } from '@heroui/react'

import { SYOBOCAL_CHANNEL_IDS } from '@/constants/channels'

import { programToSlotDetail } from '@/utils/api/syobocal/programToSlotDetail'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'
import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/SlotItem'

export interface SubtitleDetailHandle {
  initialize: () => void
}

export interface SubtitleDetailProps {
  title: ScTitleItem
  subtitle: ScSubtitleItem
  ref: React.Ref<SubtitleDetailHandle>
}

export function SubtitleDetail({ title, subtitle, ref }: SubtitleDetailProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [programs, setPrograms] = useState<SyoboCalProgramDb[]>([])

  const stateSlotDetails = useNcoState('slotDetails')

  const ids = stateSlotDetails?.map((v) => v.id)

  const currentDate = new Date()
  const slotTitle = [title.Title, `#${Number(subtitle[0])}`, subtitle[1]]
    .filter(Boolean)
    .join(' ')
    .trim()
  const programItems = programs
    .filter((program) => new Date(program.EdTime) <= currentDate)
    .sort((a, b) => (new Date(a.StTime) > new Date(b.StTime) ? 1 : -1))
    .map((program) => programToSlotDetail(slotTitle, program))

  async function initialize() {
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
  }

  useImperativeHandle(ref, () => {
    return { initialize }
  }, [initialize])

  return isLoading || !programItems.length ? (
    <div className="flex size-full items-center justify-center py-1">
      {isLoading ? (
        <Spinner size="sm" color="primary" />
      ) : (
        <span className="text-tiny text-foreground-500 my-0.5">
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
