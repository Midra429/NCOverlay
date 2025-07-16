import type { Variants } from 'framer-motion'
import type { ScTitleItem } from './TitleItem'
import type { SubtitleDetailHandle } from './SubtitleDetail'

import { useState, useImperativeHandle, useRef } from 'react'
import { cn } from '@heroui/react'
import { TRANSITION_VARIANTS } from '@heroui/framer-utils'
import { LazyMotion, domAnimation, useWillChange, m } from 'framer-motion'
import { useOverflowDetector } from 'react-detectable-overflow'
import { ChevronDownIcon } from 'lucide-react'

import { PanelItem } from '@/components/PanelItem'

import { SubtitleDetail } from './SubtitleDetail'

const transitionVariants: Variants = {
  exit: { ...TRANSITION_VARIANTS.collapse.exit, overflowY: 'hidden' },
  enter: { ...TRANSITION_VARIANTS.collapse.enter, overflowY: 'unset' },
}

export type ScSubtitleItem = [count: string, text: string]

export type SubtitleItemHandle = {
  isOpen: boolean
  open: () => void
  close: () => void
}

export type SubtitleItemProps = {
  title: ScTitleItem
  subtitle: ScSubtitleItem
  onClick: () => void
  ref: React.Ref<SubtitleItemHandle>
}

export const SubtitleItem: React.FC<SubtitleItemProps> = ({
  title,
  subtitle,
  onClick,
  ref,
}) => {
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
        <div className="text-tiny flex flex-row gap-1.5">
          <span className="text-foreground-500 dark:text-foreground-600 shrink-0">
            #{subtitle[0]}
          </span>

          <span
            className="line-clamp-2 font-semibold break-all"
            title={overflow ? subtitle[1] : undefined}
            ref={titleRef}
          >
            {subtitle[1]}
          </span>
        </div>

        <div
          className={cn(
            'text-foreground-500 dark:text-foreground-600 shrink-0 px-1',
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
