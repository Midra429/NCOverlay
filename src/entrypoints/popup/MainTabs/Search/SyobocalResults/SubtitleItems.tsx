import type { SubtitleDetailHandle } from './SubtitleDetail'
import type { ScTitleItem } from './TitleItem'

import { useImperativeHandle, useRef, useState } from 'react'
import { Spinner, cn } from '@heroui/react'
import { ChevronDownIcon } from 'lucide-react'
import { useOverflowDetector } from 'react-detectable-overflow'
import { LazyMotion, domAnimation, m, useWillChange } from 'framer-motion'
import { zeroPadding } from '@midra/nco-utils/common/zeroPadding'

import { TRANSITION_VARIANTS_ACCORDION } from '@/constants/framer-motion'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

import { PanelItem } from '@/components/PanelItem'

import { SubtitleDetail } from './SubtitleDetail'

export type ScSubtitleItem = [count: string, text: string]

interface SubtitleItemHandle {
  isOpen: boolean
  open: () => void
  close: () => void
}

interface SubtitleItemProps {
  title: ScTitleItem
  subtitle: ScSubtitleItem
  onClick: () => void
  ref: React.Ref<SubtitleItemHandle>
}

function SubtitleItem({ title, subtitle, onClick, ref }: SubtitleItemProps) {
  const detailRef = useRef<SubtitleDetailHandle>(null)

  const [isOpen, setIsOpen] = useState(false)

  const willChange = useWillChange()
  const { ref: titleRef, overflow } = useOverflowDetector()

  useImperativeHandle(ref, () => {
    return {
      isOpen,
      open: () => {
        setIsOpen(true)

        detailRef.current?.initialize()
      },
      close: () => {
        setIsOpen(false)
      },
    }
  }, [isOpen])

  return (
    <PanelItem className="flex flex-col">
      <div
        className={cn(
          'flex flex-row items-center justify-between',
          'w-full p-2',
          'cursor-pointer'
        )}
        onClick={onClick}
      >
        <div className="flex flex-row gap-1.5 text-tiny">
          <span className="shrink-0 text-foreground-500 dark:text-foreground-600">
            #{subtitle[0]}
          </span>

          <span
            className="line-clamp-2 break-all font-semibold"
            title={overflow ? subtitle[1] : undefined}
            ref={titleRef}
          >
            {subtitle[1]}
          </span>
        </div>

        <div
          className={cn(
            'shrink-0 px-1 text-foreground-500 dark:text-foreground-600',
            'rotate-0 data-[open=true]:rotate-180',
            'transition-transform'
          )}
          data-open={isOpen}
        >
          <ChevronDownIcon className="size-4" />
        </div>
      </div>

      <LazyMotion features={domAnimation}>
        <m.div
          key="subtitle-detail"
          style={{ willChange }}
          initial="exit"
          animate={isOpen ? 'enter' : 'exit'}
          exit="exit"
          variants={TRANSITION_VARIANTS_ACCORDION}
        >
          <div className="border-foreground-200 border-t-1 p-1.5">
            <SubtitleDetail title={title} subtitle={subtitle} ref={detailRef} />
          </div>
        </m.div>
      </LazyMotion>
    </PanelItem>
  )
}

export interface SubtitleItemsHandle {
  initialize: () => void
}

export interface SubtitleItemsProps {
  title: ScTitleItem
  ref: React.Ref<SubtitleItemsHandle>
}

export function SubtitleItems({ title, ref }: SubtitleItemsProps) {
  const subtitleItemRefs = useRef<{
    [index: number]: SubtitleItemHandle
  }>({})

  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [subtitles, setSubtitles] = useState<ScSubtitleItem[]>([])

  const macCountLength = Math.max(...subtitles.map(([cnt]) => cnt.length), 2)
  const subtitleItems = subtitles.map((val, idx) => ({
    subtitle: [zeroPadding(val[0], macCountLength), val[1]] as ScSubtitleItem,
    refCallbackFunction: (handle: SubtitleItemHandle | null) => {
      if (handle && !subtitleItemRefs.current[idx]) {
        subtitleItemRefs.current[idx] = handle
      } else {
        delete subtitleItemRefs.current[idx]
      }
    },
  }))

  async function initialize() {
    if (isInitialized) return

    setIsInitialized(true)
    setIsLoading(true)
    setSubtitles([])

    const response = await ncoApiProxy.syobocal.json(['SubTitles'], {
      TID: title.TID,
    })

    const subtitles = response?.SubTitles[title.TID]

    if (subtitles) {
      setSubtitles(Object.entries(subtitles))
    }

    setIsLoading(false)
  }

  useImperativeHandle(ref, () => {
    return { initialize }
  }, [initialize])

  return isLoading || !subtitleItems.length ? (
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
          サブタイトルがありません
        </span>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-1.5 p-1.5">
      {subtitleItems.map(({ subtitle, refCallbackFunction }, idx) => (
        <SubtitleItem
          key={subtitle[0]}
          title={title}
          subtitle={subtitle}
          onClick={() => {
            const item = subtitleItemRefs.current[idx]

            if (item.isOpen) {
              item.close()
            } else {
              for (const item of Object.values(subtitleItemRefs.current)) {
                item.close()
              }

              item.open()
            }
          }}
          ref={refCallbackFunction}
        />
      ))}
    </div>
  )
}
