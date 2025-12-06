import { cn } from '@heroui/react'
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useWillChange,
} from 'framer-motion'

import { TRANSITION_VARIANTS_ACCORDION } from '@/constants/framer-motion'

import { ShowPositionControl } from './ShowPositionControl'

export interface OptionsProps {
  isOpen: boolean
}

export function Options({ isOpen }: OptionsProps) {
  const willChange = useWillChange()

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <LazyMotion features={domAnimation}>
          <m.div
            key="comment-list-options"
            style={{ willChange }}
            initial="exit"
            animate="enter"
            exit="exit"
            variants={TRANSITION_VARIANTS_ACCORDION}
          >
            <div
              className={cn(
                'flex size-full flex-col px-2.5',
                'border-foreground-200 border-t-1'
              )}
            >
              <ShowPositionControl />
            </div>
          </m.div>
        </LazyMotion>
      )}
    </AnimatePresence>
  )
}
