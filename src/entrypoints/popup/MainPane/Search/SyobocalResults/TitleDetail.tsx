import type { SyoboCalProgramDb } from '@midra/nco-api/types/syobocal/db'
import type { ScTitleItem } from './TitleItem'
import type { ScSubtitleItem, SubtitleItemHandle } from './SubtitleItem'

import {
  useMemo,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useRef,
} from 'react'
import { Spinner, cn } from '@nextui-org/react'
import { ncoApi } from '@midra/nco-api'

import { SYOBOCAL_CHANNEL_IDS } from '@/constants/channels'

import { zeroPadding } from '@/utils/zeroPadding'
import { programToSlotDetail } from '@/utils/api/programToSlotDetail'
import { useNcoState } from '@/hooks/useNco'

import { Modal } from '@/components/modal'
import { SlotItem } from '@/components/slot-item'

import { TitleItemInner } from './TitleItem'
import { SubtitleItem } from './SubtitleItem'

let controller: AbortController | undefined

export type TitleDetailHandle = {
  initialize: () => void
}

export type TitleDetailProps = {
  title: ScTitleItem
  isOpen: boolean
  onOpenChange: () => void
}

export const TitleDetail = forwardRef<TitleDetailHandle, TitleDetailProps>(
  ({ title, isOpen, onOpenChange }, ref) => {
    const subtitleItemRefs = useRef<{
      [index: number]: SubtitleItemHandle
    }>({})

    const [isLoading, setIsLoading] = useState(false)
    const [currentTid, setCurrentTid] = useState('')
    const [programs, setPrograms] = useState<SyoboCalProgramDb[]>([])
    const [subtitles, setSubtitles] = useState<ScSubtitleItem[]>([])

    const stateSlotDetails = useNcoState('slotDetails')

    const ids = useMemo(() => {
      return stateSlotDetails?.map((v) => v.id)
    }, [stateSlotDetails])

    const programItems = useMemo(() => {
      const currentDate = new Date()

      return programs
        .filter((program) => new Date(program.EdTime) <= currentDate)
        .sort((a, b) => (new Date(a.StTime) > new Date(b.StTime) ? 1 : -1))
        .map((program) => programToSlotDetail(title.Title, program))
    }, [programs])

    const subtitleItems = useMemo(() => {
      const macCountLength = Math.max(
        ...subtitles.map(([cnt]) => cnt.length),
        2
      )

      return subtitles.map((val, idx) => ({
        subtitle: [
          zeroPadding(val[0], macCountLength),
          val[1],
        ] as ScSubtitleItem,
        refCallbackFunction: (handle: SubtitleItemHandle | null) => {
          if (handle && !subtitleItemRefs.current[idx]) {
            subtitleItemRefs.current[idx] = handle
          } else {
            delete subtitleItemRefs.current[idx]
          }
        },
      }))
    }, [subtitles])

    const initialize = useCallback(() => {
      if (title.TID === currentTid) return

      controller?.abort()

      setCurrentTid(title.TID)
      setPrograms([])
      setSubtitles([])
      setIsLoading(true)

      controller = new AbortController()

      const { signal } = controller

      if (title.Cat === '8') {
        new Promise<SyoboCalProgramDb[]>((resolve, reject) => {
          signal.addEventListener('abort', reject, { once: true })

          ncoApi.syobocal
            .db('ProgLookup', {
              TID: title.TID,
              ChID: SYOBOCAL_CHANNEL_IDS,
            })
            .then((response) => {
              if (response) {
                const programs = Object.values(response)

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
      } else {
        new Promise<ScSubtitleItem[]>((resolve, reject) => {
          signal.addEventListener('abort', reject, { once: true })

          ncoApi.syobocal
            .json(['SubTitles'], {
              TID: title.TID,
            })
            .then((response) => {
              if (response) {
                const subtitles = response.SubTitles[title.TID]

                resolve(subtitles ? Object.entries(subtitles) : [])
              } else {
                reject()
              }
            })
            .catch(() => reject())
        })
          .then((value) => setSubtitles(value))
          .catch(() => setSubtitles([]))
          .finally(() => setIsLoading(false))
      }
    }, [title, currentTid])

    useImperativeHandle(ref, () => {
      return { initialize }
    }, [initialize])

    return (
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        cancelText="閉じる"
        header={<TitleItemInner item={title} isHeader />}
      >
        {isLoading || (!programItems.length && !subtitleItems.length) ? (
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
                サブタイトルまたは放送時間がありません
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
                isDisabled={ids?.includes(detail.id)}
              />
            ))}

            {subtitleItems.map(({ subtitle, refCallbackFunction }, idx) => (
              <SubtitleItem
                key={idx}
                title={title}
                subtitle={subtitle}
                onClick={() => {
                  const itemHandle = subtitleItemRefs.current[idx]

                  if (itemHandle.isOpen) {
                    itemHandle.close()
                  } else {
                    Object.values(subtitleItemRefs.current).forEach(
                      (handle) => {
                        handle.close()
                      }
                    )

                    itemHandle.open()
                  }
                }}
                ref={refCallbackFunction}
              />
            ))}
          </div>
        )}
      </Modal>
    )
  }
)
