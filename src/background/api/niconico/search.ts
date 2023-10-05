import type { SearchQuery, Search, SearchData } from '@/types/niconico/search'
import { filterObject } from '@/utils/filterObject'

const API_URL =
  'https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search'

export const search = async (
  query: SearchQuery
): Promise<SearchData[] | null> => {
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
      for (const field in query.filters) {
        if (query.filters[field] == null) continue

        for (const key in query.filters[field]) {
          if (query.filters[field][key] == null) continue

          const val = query.filters[field][key]
          params[`filters[${field}][${key}]`] =
            typeof val === 'number' ? Math.floor(val) : val
        }
      }
    }

    const url = `${API_URL}?${new URLSearchParams(
      params as Record<string, string>
    )}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'NCOverlay/1.0',
      },
    })
    const json: Search = await res.json()

    if (res.ok) {
      return json.data
    } else {
      console.error(json.meta)
    }
  } catch (e) {
    console.error(e)
  }

  return null
}
