import type { VodKey } from '@/types/constants'

export const VOD_KEYS = [
  'dAnime',
  'abema',
  'bandaiChannel',
  'dmmTv',
  'unext',
  'fod',
  'primeVideo',
  'netflix',
  'hulu',
  'niconico',
  'nhkOne',
  'nhkOndemand',
  'tver',
] as const

/** 動画配信サービス */
export const VODS = {
  dAnime: 'dアニメストア',
  abema: 'ABEMA',
  bandaiChannel: 'バンダイチャンネル',
  dmmTv: 'DMM TV',
  unext: 'U-NEXT',
  fod: 'FOD',
  primeVideo: 'Prime Video',
  netflix: 'Netflix',
  hulu: 'Hulu',
  niconico: 'ニコニコ動画',
  nhkOne: 'NHK ONE',
  nhkOndemand: 'NHKオンデマンド',
  tver: 'TVer',
} as const satisfies {
  [P in VodKey]: string
}
