import type { ChromeStorageSettings } from '@/types/chrome/storage'

/** 設定 (デフォルト) */
export const SETTINGS_DEFAULT: ChromeStorageSettings = {
  enable: true,
  opacity: 100,
  lowPerformance: false,
  allowWeakMatch: false,
  showChangelog: true,
}

export const VODS = {
  dAnime: 'dアニメストア',
  primeVideo: 'Prime Video',
  abema: 'ABEMA',
  disneyPlus: 'Disney+',
  tver: 'TVer',
  bandaiChannel: 'バンダイチャンネル',
  unext: 'U-NEXT',
  dmmTv: 'DMM TV',
}

export const VODS_ALLOW_CAPTURE: (keyof typeof VODS)[] = [
  'abema',
  'tver',
  'bandaiChannel',
]

/** GitHub */
export const GITHUB_URL = 'https://github.com/Midra429/NCOverlay'

/** dアニメストア ニコニコ支店のチャンネルID */
export const DANIME_CHANNEL_ID = 2632720

/** アイコン (有効) */
export const ACTION_ICONS_ENABLE = {
  '16': 'assets/images/icon_16.png',
  '32': 'assets/images/icon_32.png',
  '48': 'assets/images/icon_48.png',
  '128': 'assets/images/icon_128.png',
}

/** アイコン (無効) */
export const ACTION_ICONS_DISABLE = {
  '16': 'assets/images/icon_disable_16.png',
  '32': 'assets/images/icon_disable_32.png',
  '48': 'assets/images/icon_disable_48.png',
  '128': 'assets/images/icon_disable_128.png',
}

/** ニコニコ コメント コマンド (色) */
export const COLOR_COMMANDS = {
  white: '#FFFFFF',
  red: '#FF0000',
  pink: '#FF8080',
  orange: '#FFC000',
  yellow: '#FFFF00',
  green: '#00FF00',
  cyan: '#00FFFF',
  blue: '#0000FF',
  purple: '#C000FF',
  black: '#000000',
  white2: '#CCCC99',
  niconicowhite: '#CCCC99',
  red2: '#CC0033',
  truered: '#CC0033',
  pink2: '#FF33CC',
  orange2: '#FF6600',
  passionorange: '#FF6600',
  yellow2: '#999900',
  madyellow: '#999900',
  green2: '#00CC66',
  elementalgreen: '#00CC66',
  cyan2: '#00CCCC',
  blue2: '#3399FF',
  marinblue: '#3399FF',
  purple2: '#6633CC',
  nobleviolet: '#6633CC',
  black2: '#666666',
}

export const COLOR_COMMANDS_DARKER = [
  'red',
  'blue',
  'purple',
  'black',
  'red2',
  'truered',
  'pink2',
  'orange2',
  'passionorange',
  'yellow2',
  'madyellow',
  'blue2',
  'marinblue',
  'purple2',
  'nobleviolet',
  'black2',
]

export const EPISODE_NUMBER_REGEXP =
  /第?(\d+|[一二三四五六七八九十百千万]+)話|episode\s?(\d+)|#(\d+)/i

export const KAWAII_REGEXP = /kawaii|かわいい|可愛い/i
