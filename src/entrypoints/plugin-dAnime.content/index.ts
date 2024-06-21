import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'

import { Logger } from '@/utils/logger'
import { execPlugins } from '@/utils/execPlugins'

import { disablePopupPlayer } from './disablePopupPlayer'

const vod: VodKey = 'dAnime'

export default defineContentScript({
  matches: ['https://animestore.docomo.ne.jp/*'],
  runAt: 'document_end',
  world: 'MAIN',
  main: () => void main(),
})

const main = () => {
  Logger.log(`plugin-${vod}.js`)

  execPlugins(vod, {
    disablePopupPlayer,
  })
}