import vodPrimeVideo from './vod/primeVideo'
import vodDAnime from './vod/dAnime'

console.log('[NCOverlay] content_script.js')

const init = () => {
  document.documentElement.classList.add('NCOverlay')
}

// Prime Video
if (location.hostname === 'www.amazon.co.jp') {
  if (
    location.pathname.match('/gp/video/') ||
    location.pathname.match('/Amazon-Video/') ||
    (location.pathname.match('/dp/') &&
      document.querySelector('#pv-nav-container, .webPlayerSDKContainer'))
  ) {
    init()
    vodPrimeVideo()
  }
}

// dアニメストア
if (location.hostname === 'animestore.docomo.ne.jp') {
  if (location.pathname.match('/animestore/sc_d_pc')) {
    init()
    vodDAnime()
  }
}
