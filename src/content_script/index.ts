import { checkSupportedVod } from '@/utils/checkSupportedVod'
import { setAction } from './utils/setAction'
import { setSidePanel } from './utils/setSidePanel'
import vodPrimeVideo from './vod/primeVideo'
import vodDAnime from './vod/dAnime'
import vodAbema from './vod/abema'
import vodDisneyPlus from './vod/disneyPlus'
import vodTVer from './vod/tver'
import vodBandaiChannel from './vod/bandaiChannel'
import vodUnext from './vod/unext'
import vodDmmTv from './vod/dmmTv'

console.log('[NCOverlay] content_script.js')

chrome.runtime.onMessage.addListener(() => false)

const main = async () => {
  const vod = checkSupportedVod(location.href)

  if (!vod) return

  document.documentElement.classList.add('NCOverlay')
  document.documentElement.dataset.ncoVod = vod

  setAction(true)
  setSidePanel(true)

  // Prime Video
  if (vod === 'primeVideo') {
    vodPrimeVideo()
  }

  // dアニメストア
  if (vod === 'dAnime') {
    vodDAnime()
  }

  // ABEMA
  if (vod === 'abema') {
    vodAbema()
  }

  // Disney+
  if (vod === 'disneyPlus') {
    vodDisneyPlus()
  }

  // TVer
  if (vod === 'tver') {
    vodTVer()
  }

  // バンダイチャンネル
  if (vod === 'bandaiChannel') {
    vodBandaiChannel()
  }

  // U-NEXT
  if (vod === 'unext') {
    vodUnext()
  }

  // DMM TV
  if (vod === 'dmmTv') {
    vodDmmTv()
  }
}

main()
