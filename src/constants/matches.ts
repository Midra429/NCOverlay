import type { VodKey } from '@/types/constants'

export const MATCHES: Record<VodKey, string[]> = {
  dAnime: ['*://animestore.docomo.ne.jp/animestore/*'],
  abema: ['https://abema.tv/*'],
  bandaiChannel: ['https://www.b-ch.com/titles/*'],
  dmmTv: ['https://tv.dmm.com/*'],
  unext: ['https://video.unext.jp/*'],
  fod: ['https://fod.fujitv.co.jp/*'],
  primeVideo: ['https://www.amazon.co.jp/*'],
  netflix: ['https://www.netflix.com/*'],
  hulu: ['https://www.hulu.jp/*'],
  niconico: ['https://www.nicovideo.jp/watch/*'],
  nhkPlus: ['https://plus.nhk.jp/watch/st/*'],
  tver: ['https://tver.jp/*'],
}
