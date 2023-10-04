import type { SearchQuery, Search } from '@/types/niconico/search'
import { filterObject } from '@/utils/filterObject'

const API_URL =
  'https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search'

export const search = async (query: SearchQuery): Promise<Search | null> => {
  try {
    const params = {
      q: query.q,
      targets: query.targets.join(),
      fields:
        query.fields?.join() ||
        ['contentId', 'title', 'channelId', 'lengthSeconds', 'tags'].join(),
      _sort: query._sort ?? '+startTime',
      _offset: query._offset,
      _limit: query._limit,
      _context: 'NCOverlay',
    }

    filterObject(params)

    if (query.filters) {
      for (const field of Object.keys(query.filters)) {
        if (query.filters[field] == null) continue

        for (const key of Object.keys(query.filters[field])) {
          if (query.filters[field][key] == null) continue

          const val = query.filters[field][key]
          params[`filters[${field}][${key}]`] =
            typeof val === 'number' ? Math.floor(val) : val
        }
      }
    }

    console.log(params)

    const url = `${API_URL}?${new URLSearchParams(
      params as Record<string, string>
    )}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'NCOverlay/1.0',
      },
    })

    if (res.ok) {
      const json = await res.json()
      return json
    }
  } catch (e) {
    console.error(e)
  }

  return null
}
