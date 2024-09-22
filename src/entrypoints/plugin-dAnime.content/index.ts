import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'

import { MATCHES } from '@/constants/matches'

import { execPlugins } from '@/utils/extension/execPlugins'

import { disablePopupPlayer } from './disablePopupPlayer'

const vod: VodKey = 'dAnime'

export default defineContentScript({
  matches: MATCHES[vod],
  world: 'MAIN',
  main: () => {
    execPlugins(vod, {
      disablePopupPlayer,
    })
  },
})
