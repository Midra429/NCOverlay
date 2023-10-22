import { querySelectorAsync } from '@/utils/dom/querySelectorAsync'

export type SupportedVods =
  | 'primeVideo'
  | 'dAnime'
  | 'abema'
  | 'disneyPlus'
  | 'tver'
  | 'bandaiChannel'
  | 'unext'
  | 'dmmTv'

export const checkSupportedVod = async (
  url: string
): Promise<SupportedVods | null> => {
  try {
    const { hostname, pathname } = new URL(url)

    // Prime Video
    if (hostname === 'www.amazon.co.jp') {
      if (
        pathname.match('/gp/video/') ||
        pathname.match('/Amazon-Video/') ||
        (pathname.match('/dp/') && (await querySelectorAsync('#dv-web-player')))
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
  } catch {}

  return null
}
