export type SupportedVods =
  | 'primeVideo'
  | 'dAnime'
  | 'abema'
  | 'disneyPlus'
  | 'tver'
  | 'bandaiChannel'
  | 'unext'
  | 'dmmTv'

export const checkSupportedVod = (siteUrl: string): SupportedVods | null => {
  let result: SupportedVods | null = null

  try {
    const { hostname, pathname } = new URL(siteUrl)

    // Prime Video
    if (hostname === 'www.amazon.co.jp') {
      if (
        pathname.match('/gp/video/') ||
        pathname.match('/Amazon-Video/') ||
        (pathname.match('/dp/') &&
          typeof document !== 'undefined' &&
          document.querySelector('#pv-nav-container, .webPlayerSDKContainer'))
      ) {
        result = 'primeVideo'
      }
    }

    // dアニメストア
    if (hostname === 'animestore.docomo.ne.jp') {
      result = 'dAnime'
    }

    // ABEMA
    if (hostname === 'abema.tv') {
      result = 'abema'
    }

    // Disney+
    if (hostname === 'www.disneyplus.com') {
      result = 'disneyPlus'
    }

    // TVer
    if (hostname === 'tver.jp') {
      result = 'tver'
    }

    // バンダイチャンネル
    if (hostname === 'www.b-ch.com') {
      result = 'bandaiChannel'
    }

    // U-NEXT
    if (hostname === 'video.unext.jp') {
      result = 'unext'
    }

    // DMM TV
    if (hostname === 'tv.dmm.com') {
      result = 'dmmTv'
    }
  } catch {}

  return result
}
