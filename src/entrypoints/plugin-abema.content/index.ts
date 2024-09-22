import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'

import { MATCHES } from '@/constants/matches'

import { execPlugins } from '@/utils/extension/execPlugins'

import { windowSizeFullscreen } from './windowSizeFullscreen'

const vod: VodKey = 'abema'

export default defineContentScript({
  matches: MATCHES[vod],
  world: 'MAIN',
  main: () => {
    execPlugins(vod, {
      windowSizeFullscreen,
    })
  },
})
