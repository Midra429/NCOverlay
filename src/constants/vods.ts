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
  // 'disneyPlus',
  'niconico',
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
  // disneyPlus: 'Disney+',
  niconico: 'ニコニコ動画',
  tver: 'TVer',
} as const satisfies {
  [P in VodKey]: string
}
