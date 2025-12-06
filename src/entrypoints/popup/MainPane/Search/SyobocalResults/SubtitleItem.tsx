import type { Variants } from 'framer-motion'
import type { SubtitleDetailHandle } from './SubtitleDetail'
import type { ScTitleItem } from './TitleItem'

import { useImperativeHandle, useRef, useState } from 'react'
import { TRANSITION_VARIANTS } from '@heroui/framer-utils'
import { cn } from '@heroui/react'
import { ChevronDownIcon } from 'lucide-react'
import { useOverflowDetector } from 'react-detectable-overflow'
import { LazyMotion, domAnimation, m, useWillChange } from 'framer-motion'

import { PanelItem } from '@/components/PanelItem'

import { SubtitleDetail } from './SubtitleDetail'

const transitionVariants: Variants = {
  exit: { ...TRANSITION_VARIANTS.collapse.exit, overflowY: 'hidden' },
  enter: { ...TRANSITION_VARIANTS.collapse.enter, overflowY: 'unset' },
}

export type ScSubtitleItem = [count: string, text: string]

export interface SubtitleItemHandle {
  isOpen: boolean
  open: () => void
  close: () => void
}

export interface SubtitleItemProps {
  title: ScTitleItem
  subtitle: ScSubtitleItem
  onClick: () => void
  ref: React.Ref<SubtitleItemHandle>
}

export function SubtitleItem({
  title,
  subtitle,
  onClick,
  ref,
}: SubtitleItemProps) {
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
          variants={transitionVariants}
        >
          <div className="border-foreground-200 border-t-1 p-1.5">
            <SubtitleDetail title={title} subtitle={subtitle} ref={detailRef} />
          </div>
        </m.div>
      </LazyMotion>
    </PanelItem>
  )
}
