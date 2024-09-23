import type { Variants } from 'framer-motion'

import { TRANSITION_VARIANTS } from '@nextui-org/framer-utils'
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  useWillChange,
  m,
} from 'framer-motion'

import { Sort } from './Sort'
import { LengthRange } from './LengthRange'

const transitionVariants: Variants = {
  exit: { ...TRANSITION_VARIANTS.collapse.exit, overflowY: 'hidden' },
  enter: { ...TRANSITION_VARIANTS.collapse.enter, overflowY: 'unset' },
}

export type OptionsProps = {
  isOpen: boolean
  isDisabled?: boolean
}

export const Options: React.FC<OptionsProps> = ({ isOpen, isDisabled }) => {
  const willChange = useWillChange()

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <LazyMotion features={domAnimation}>
          <m.div
            key="search-options"
            style={{ willChange }}
            initial="exit"
            animate="enter"
            exit="exit"
            variants={transitionVariants}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex size-full flex-row items-center gap-2 pt-2">
              <Sort isDisabled={isDisabled} />

              <LengthRange isDisabled={isDisabled} />
            </div>
          </m.div>
        </LazyMotion>
      )}
    </AnimatePresence>
  )
}
