import { checkTargetSite } from '@/utils/checkTargetSite'
import vodPrimeVideo from './vod/primeVideo'
import vodDAnime from './vod/dAnime'
import vodAbema from './vod/abema'
import { setAction } from './utils/setAction'
import { setSidePanel } from './utils/setSidePanel'

console.log('[NCOverlay] content_script.js')

chrome.runtime.onMessage.addListener(() => false)

const init = () => {
  document.documentElement.classList.add('NCOverlay')

  setAction(true)
  setSidePanel(true)
}

const main = () => {
  const target = checkTargetSite(location.href)

  if (!target) return

  init()

  // Prime Video
  if (target === 'primeVideo') {
    vodPrimeVideo()
  }

  // dアニメストア
  if (target === 'dAnime') {
    vodDAnime()
  }

  // ABEMA
  if (target === 'abema') {
    vodAbema()
  }
}

main()
