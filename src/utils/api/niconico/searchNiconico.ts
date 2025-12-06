import type { SearchQueryFilters } from '@midra/nco-utils/types/api/niconico/search'
import type { SettingItems } from '@/types/storage'

import { getLocalTimeZone, now } from '@internationalized/date'

import { settings } from '@/utils/settings/extension'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

import { searchDataToSlotDetail } from './searchDataToSlotDetail'
import { videoDataToSlotDetail } from './videoDataToSlotDetail'

const TIMEZONE_SUFFIX_REGEXP = /\[.+\]$/

export async function searchNiconicoByIds(...contentIds: string[]) {
  const useNiconicoCredentials = await settings.get(
    'settings:comment:useNiconicoCredentials'
  )

  const credentials: RequestInit['credentials'] = useNiconicoCredentials
    ? 'include'
    : 'omit'

  const data = await ncoApiProxy.niconico.multipleVideo(contentIds, credentials)
  const filtered = data.filter((v) => v !== null)

  if (filtered.length) {
    const total = filtered.length
    const details = filtered.map((v) => videoDataToSlotDetail(v))

    return { total, details }
  }

  return null
}

export interface SearchNiconicoOptions {
  sort?: SettingItems['settings:search:sort']
  dateRange?: SettingItems['settings:search:dateRange']
  genre?: SettingItems['settings:search:genre']
  lengthRange?: SettingItems['settings:search:lengthRange']
}

export async function searchNiconicoByKeyword(
  keyword: string,
  page: number,
  options?: SearchNiconicoOptions
) {
  const limit = 20
  const offset = limit * (page - 1)

  const current = now(getLocalTimeZone())

  const filters: SearchQueryFilters = {
    commentCounter: { gt: 0 },
    startTime: options?.dateRange
      ? {
          gte: options.dateRange[0]
            ? current
                .add(options.dateRange[0])
                .toString()
                .replace(TIMEZONE_SUFFIX_REGEXP, '')
            : undefined,
          lte: options.dateRange[1]
            ? current
                .add(options.dateRange[1])
                .toString()
                .replace(TIMEZONE_SUFFIX_REGEXP, '')
            : undefined,
        }
      : undefined,
    'genre.keyword':
      options?.genre && options.genre !== '未指定'
        ? [options.genre]
        : undefined,
    lengthSeconds: options?.lengthRange
      ? {
          gte: options.lengthRange[0] ?? undefined,
          lte: options.lengthRange[1] ?? undefined,
        }
      : undefined,
  }

  const response = await ncoApiProxy.niconico.search({
    q: keyword,
    targets: ['title', 'description'],
    fields: [
      'contentId',
      'title',
      'userId',
      'channelId',
      'viewCounter',
      'lengthSeconds',
      'thumbnailUrl',
      'startTime',
      'commentCounter',
      'categoryTags',
      'tags',
    ],
    filters,
    _sort: options?.sort ?? '-startTime',
    _offset: offset,
    _limit: limit,
    _context: EXT_USER_AGENT,
  })

  if (response) {
    const { meta, data } = response

    const total = Math.ceil(meta.totalCount / limit)
    const details = data.map((v) => searchDataToSlotDetail(v))

    return { total, details }
  }

  return null
}
