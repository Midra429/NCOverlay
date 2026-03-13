import type { StateSlotDetailJikkyo } from '@/ncoverlay/state'
import type { ScTitleItem } from './TitleItem'

import { useImperativeHandle, useState } from 'react'
import { Spinner, cn } from '@heroui/react'

import { SYOBOCAL_CHANNEL_IDS } from '@/constants/channels'
import { programToSlotDetail } from '@/utils/api/syobocal/programToSlotDetail'
import { useNcoState } from '@/hooks/useNco'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

import { SlotItem } from '@/components/SlotItem'

const CARET_PREFIX_REGEXP = /^\^/

export interface ProgramItemsHandle {
  initialize: () => void
}

export interface ProgramItemsProps {
  title: ScTitleItem
  ref: React.Ref<ProgramItemsHandle>
}

export function ProgramItems({ title, ref }: ProgramItemsProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [programItems, setProgramItems] = useState<StateSlotDetailJikkyo[]>([])

  const stateSlotDetails = useNcoState('slotDetails')

  const ids = stateSlotDetails?.map((v) => v.id) ?? []

  async function initialize() {
    if (isInitialized) return

    setIsInitialized(true)
    setIsLoading(true)
    setProgramItems([])

    const response = await ncoApiProxy.syobocal.db('ProgLookup', {
      TID: title.TID,
      ChID: SYOBOCAL_CHANNEL_IDS,
    })

    if (response) {
      const currentDateTime = new Date().getTime()

      const programs = Object.values(response)
      const programItems = programs
        .map((program) => ({
          ...program,
          _StDateTime: new Date(program.StTime).getTime(),
          _EdDateTime: new Date(program.EdTime).getTime(),
        }))
        .filter((program) => program._EdDateTime <= currentDateTime)
        .sort((a, b) => b._StDateTime - a._StDateTime)
        .map((program) => {
          const slotTitle = [
            !program.SubTitle.startsWith('^') && title.Title,
            program.Count && `#${Number(program.Count)}`,
            program.SubTitle.replace(CARET_PREFIX_REGEXP, ''),
          ]
            .filter(Boolean)
            .join(' ')
            .trim()

          return programToSlotDetail(slotTitle, program)
        })

      setProgramItems(programItems)
    }

    setIsLoading(false)
  }

  useImperativeHandle(ref, () => {
    return { initialize }
  }, [initialize])

  return isLoading || !programItems.length ? (
    <div
      className={cn(
        'relative inset-0 z-20',
        'flex size-full items-center justify-center'
      )}
    >
      {isLoading ? (
        <Spinner size="lg" color="primary" />
      ) : (
        <span className="text-foreground-500 text-small">
          放送時間がありません
        </span>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-1.5 p-1.5">
      {programItems.map((detail) => (
        <SlotItem
          key={detail.id}
          detail={detail}
          isSearch
          isDisabled={ids.includes(detail.id)}
        />
      ))}
    </div>
  )
}
