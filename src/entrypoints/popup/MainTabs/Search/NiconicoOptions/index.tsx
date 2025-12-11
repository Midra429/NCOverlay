import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useWillChange,
} from 'framer-motion'

import { TRANSITION_VARIANTS_ACCORDION } from '@/constants/framer-motion'

import { DateRange } from './DateRange'
import { Genre } from './Genre'
import { LengthRange } from './LengthRange'
import { Sort } from './Sort'

export interface NiconicoOptionsProps {
  isOpen: boolean
  isDisabled?: boolean
}

export function NiconicoOptions({ isOpen, isDisabled }: NiconicoOptionsProps) {
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
            variants={TRANSITION_VARIANTS_ACCORDION}
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
