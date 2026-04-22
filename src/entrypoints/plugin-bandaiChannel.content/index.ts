import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { execPlugins } from '@/utils/extension/page/execPlugins'

import { windowSizeFullscreen } from './windowSizeFullscreen'

const vod: VodKey = 'bandaiChannel'

export default defineContentScript({
  matches: MATCHES[vod],
  world: 'MAIN',
  main: () => {
    execPlugins(vod, {
      windowSizeFullscreen,
    })
  },
})
