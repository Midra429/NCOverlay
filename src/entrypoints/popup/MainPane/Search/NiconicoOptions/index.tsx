import type { Variants } from 'framer-motion'

import { TRANSITION_VARIANTS } from "@heroui/framer-utils"
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  useWillChange,
  m,
} from 'framer-motion'

import { Sort } from './Sort'
import { DateRange } from './DateRange'
import { Genre } from './Genre'
import { LengthRange } from './LengthRange'

const transitionVariants: Variants = {
  exit: { ...TRANSITION_VARIANTS.collapse.exit, overflowY: 'hidden' },
  enter: { ...TRANSITION_VARIANTS.collapse.enter, overflowY: 'unset' },
}

export type NiconicoOptionsProps = {
  isOpen: boolean
  isDisabled?: boolean
}

export const NiconicoOptions: React.FC<NiconicoOptionsProps> = ({
  isOpen,
  isDisabled,
}) => {
  const willChange = useWillChange()

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <LazyMotion features={domAnimation}>
          <m.div
            key="search-niconico-options"
            style={{ willChange }}
            initial="exit"
            animate="enter"
            exit="exit"
            variants={transitionVariants}
          >
            <div className="flex size-full flex-col gap-2 pt-2">
              <div className="flex flex-row gap-2">
                <Sort isDisabled={isDisabled} />

                <DateRange isDisabled={isDisabled} />
              </div>

              <div className="flex flex-row gap-2">
                <Genre isDisabled={isDisabled} />

                <LengthRange isDisabled={isDisabled} />
              </div>
            </div>
          </m.div>
        </LazyMotion>
      )}
    </AnimatePresence>
  )
}
