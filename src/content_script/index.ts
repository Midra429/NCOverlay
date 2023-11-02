import { VODS } from '@/constants'
import webext from '@/webext'
import { checkSupportedVod } from '@/content_script/utils/checkSupportedVod'
import { setAction } from './utils/setAction'
import { setSidePanel } from './utils/setSidePanel'

console.log('[NCOverlay] content_script.js')

webext.runtime.onMessage.addListener(() => {})

const vodFunc: {
  [key in keyof typeof VODS]: Promise<{ default: () => Promise<void> }>
} = {
  dAnime: import('./vod/dAnime'),
  primeVideo: import('./vod/primeVideo'),
  abema: import('./vod/abema'),
  disneyPlus: import('./vod/disneyPlus'),
  tver: import('./vod/tver'),
  bandaiChannel: import('./vod/bandaiChannel'),
  unext: import('./vod/unext'),
  dmmTv: import('./vod/dmmTv'),
}

const main = async () => {
  const vod = await checkSupportedVod(location.href)

  if (!vod) return

  console.log(`[NCOverlay] VOD: ${VODS[vod]}`)

  document.documentElement.classList.add('NCOverlay')
  document.documentElement.dataset.ncoVod = vod

  setAction(true)
  setSidePanel(true)

  await (await vodFunc[vod]).default()
}

window.addEventListener('DOMContentLoaded', main)
