import { VODS } from '@/constants'
import { querySelectorAsync } from '@/utils/dom/querySelectorAsync'

export const checkSupportedVod = async (
  url: string
): Promise<keyof typeof VODS | null> => {
  try {
    const { hostname, pathname } = new URL(url)

    // Prime Video
    if (hostname === 'www.amazon.co.jp') {
      if (
        pathname.includes('/gp/video/') ||
        pathname.includes('/Amazon-Video/') ||
        (pathname.includes('/dp/') &&
          (await querySelectorAsync('#dv-web-player')))
      ) {
        return 'primeVideo'
      }
    }

    // dアニメストア
    if (hostname === 'animestore.docomo.ne.jp') {
      return 'dAnime'
    }

    // ABEMA
    if (hostname === 'abema.tv') {
      return 'abema'
    }

    // Disney+
    if (hostname === 'www.disneyplus.com') {
      return 'disneyPlus'
    }

    // TVer
    if (hostname === 'tver.jp') {
      return 'tver'
    }

    // バンダイチャンネル
    if (hostname === 'www.b-ch.com') {
      return 'bandaiChannel'
    }

    // U-NEXT
    if (hostname === 'video.unext.jp') {
      return 'unext'
    }

    // DMM TV
    if (hostname === 'tv.dmm.com') {
      return 'dmmTv'
    }

    // Hulu
    if (hostname === 'www.hulu.jp') {
      return 'hulu'
    }

    // Lemino
    if (hostname === 'lemino.docomo.ne.jp') {
      return 'lemino'
    }
  } catch {}

  return null
}
