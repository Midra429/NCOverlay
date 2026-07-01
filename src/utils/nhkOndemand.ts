import type {
  JikkyoChannelId,
  NhkServiceId,
} from '@midra/nco-utils/types/api/constants'

const TITLE_PREFIX_REGEXP =
  /^(?:【.+?】|(?:連続テレビ小説|月曜ドラマシリーズ|ドラマ)\s)/
const TITLE_SUFFIX_REGEXP = /(?:＜新＞|＜全[０-９]+回＞|（最終回）)/
const PROGRAM_FLAG_REGEXP = /(?:🈟|🈡|🈞)/
const AIR_DATE_TIME_REGEXP = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/

export const EP_SHORT_REGEXP = /(（[０-９]+）)/

export const ONE_MONTH_MS = 31 * 24 * 60 * 60 * 1000
export const DATE_MS_20231130 = new Date('2023-11-30T23:59:59+09:00').getTime()
export const NHK_SERVICE_ID_JIKKYO_CH: {
  [id in NhkServiceId]?: JikkyoChannelId
} = {
  g1: 'jk1',
  e1: 'jk2',
  s1: 'jk101',
  s5: 'jk103',
}

export function cleanTitle(title: string): string {
  return title
    .replace(/\ue486|\ue488/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeTitle(title: string): string {
  return cleanTitle(title)
    .replace(TITLE_PREFIX_REGEXP, '')
    .replace(TITLE_SUFFIX_REGEXP, '')
    .replace(PROGRAM_FLAG_REGEXP, '')
    .trim()
}

export function parseAirDateTime(
  airdate: string,
  airtime: string
): Date | null {
  const str = airdate + airtime

  if (!AIR_DATE_TIME_REGEXP.test(str)) {
    return null
  }

  return new Date(
    (airdate + airtime).replace(AIR_DATE_TIME_REGEXP, '$1-$2-$3T$4:$5:$6+09:00')
  )
}
