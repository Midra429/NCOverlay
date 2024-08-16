import type { VodKey } from '@/types/constants'

export const VOD_KEYS = [
  'dAnime',
  'abema',
  'bandaiChannel',
  'dmmTv',
  'unext',
  'fod',
  'primeVideo',
  'hulu',
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
  // lemino: 'Lemino',
  primeVideo: 'Prime Video',
  // netflix: 'Netflix',
  hulu: 'Hulu',
  // disneyPlus: 'Disney+',
  tver: 'TVer',
  // nhkplus: 'NHKプラス',
} as const satisfies {
  [key in VodKey]: string
}
