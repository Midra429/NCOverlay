import type { Variants } from 'framer-motion'

import { TRANSITION_VARIANTS } from '@heroui/framer-utils'

export const TRANSITION_VARIANTS_ACCORDION: Variants = {
  exit: { ...TRANSITION_VARIANTS.collapse.exit, overflowY: 'hidden' },
  enter: { ...TRANSITION_VARIANTS.collapse.enter, overflowY: 'unset' },
}
