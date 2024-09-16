import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'

import { logger } from '@/utils/logger'
import { execPlugins } from '@/utils/extension/execPlugins'

import { windowSizeFullscreen } from './windowSizeFullscreen'

const vod: VodKey = 'niconico'

export default defineContentScript({
  matches: ['https://www.nicovideo.jp/watch/*'],
  world: 'MAIN',
  main: () => void main(),
})

const main = () => {
  logger.log(`plugin-${vod}.js`)

  execPlugins(vod, {
    windowSizeFullscreen,
  })
}
