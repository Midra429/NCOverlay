export const checkTargetSite = (siteUrl: string) => {
  let result: 'primeVideo' | 'dAnime' | 'abema' | null = null

  try {
    const url = new URL(siteUrl)

    // Prime Video
    if (url.hostname === 'www.amazon.co.jp') {
      if (
        url.pathname.match('/gp/video/') ||
        url.pathname.match('/Amazon-Video/') ||
        (url.pathname.match('/dp/') &&
          typeof document !== 'undefined' &&
          document.querySelector('#pv-nav-container, .webPlayerSDKContainer'))
      ) {
        result = 'primeVideo'
      }
    }

    // dアニメストア
    if (url.hostname === 'animestore.docomo.ne.jp') {
      result = 'dAnime'
    }

    // ABEMA
    if (url.hostname === 'abema.tv') {
      result = 'abema'
    }
  } catch {}

  return result
}
