import type { Variants } from 'framer-motion'
import type { ScTitleItem } from './TitleItem'
import type { SubtitleDetailHandle } from './SubtitleDetail'

import { useState, useImperativeHandle, forwardRef, useRef } from 'react'
import { cn } from '@nextui-org/react'
import { TRANSITION_VARIANTS } from '@nextui-org/framer-utils'
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  useWillChange,
  m,
} from 'framer-motion'
import { useOverflowDetector } from 'react-detectable-overflow'
import { ChevronDownIcon } from 'lucide-react'

import { PanelItem } from '@/components/panel-item'

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
}

export const SubtitleItem = forwardRef<SubtitleItemHandle, SubtitleItemProps>(
  ({ title, subtitle, onClick }, ref) => {
    const detailRef = useRef<SubtitleDetailHandle>(null)

    const [isOpen, setIsOpen] = useState(false)

    const willChange = useWillChange()
    const { ref: titleRef, overflow } = useOverflowDetector()

    useImperativeHandle(ref, () => {
      return {
        isOpen,
        open: () => {
          setIsOpen(true)

          setTimeout(() => {
            detailRef.current?.initialize()
          })
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
              className="line-clamp-2 break-all font-bold"
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

        <AnimatePresence initial={false}>
          {isOpen && (
            <LazyMotion features={domAnimation}>
              <m.div
                key="subtitle-detail"
                style={{ willChange }}
                initial="exit"
                animate="enter"
                exit="exit"
                variants={transitionVariants}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <div className="border-t-1 border-foreground-200 p-2">
                  <SubtitleDetail
                    title={title}
                    subtitle={subtitle}
                    ref={detailRef}
                  />
                </div>
              </m.div>
            </LazyMotion>
          )}
        </AnimatePresence>
      </PanelItem>
    )
  }
)
