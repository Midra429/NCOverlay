import type { SearchQuery, SearchData } from '@/types/niconico/search'
import { DANIME_CHANNEL_ID } from '@/constants'
import deepmerge from 'deepmerge'
import { NiconicoApi } from '@/content_script/api/niconico'
import { normalizeTitle } from '@/utils/normalizeTitle'
import { optimizeTitleForSearch } from '@/utils/optimizeTitleForSearch'
import { isEqualTitle } from '@/utils/isEqualTitle'

const searchQueryBase: Partial<SearchQuery> = {
  targets: ['title'],
  fields: ['contentId', 'title', 'channelId', 'lengthSeconds'],
  filters: {
    'genre.keyword': {
      '0': 'アニメ',
    },
  },
  _limit: 10,
}

export const getSearchData = async (info: {
  /** 検索タイトル */
  title: string
  /** 検索対象の動画の長さ用 */
  duration: number
  /** 作品のタイトル (あいまい検索用) */
  workTitle?: string
  /** エピソードのサブタイトル (あいまい検索用) */
  subTitle?: string
}): Promise<{
  normal: SearchData[]
  splited: SearchData[]
} | null> => {
  const optimizedTitle = optimizeTitleForSearch(info.title)

  console.log(`[NCOverlay] optimizedTitle: ${optimizedTitle}`)

  const searchDataNormal: SearchData[] = []
  const searchDataSplited: SearchData[] = []

  // 検索 (通常)
  const searchNormal = await NiconicoApi.search({
    query: deepmerge(searchQueryBase, {
      q: optimizedTitle,
      filters: {
        lengthSeconds: {
          gte: info.duration - 30,
          lte: info.duration + 30,
        },
      },
    }),
  })

  console.log('[NCOverlay] searchData', searchNormal)

  if (searchNormal) {
    const workTitle = info.workTitle ? normalizeTitle(info.workTitle) : null
    const subTitle = info.subTitle ? normalizeTitle(info.subTitle) : null

    const filtered = searchNormal.filter((val) => {
      const title = normalizeTitle(val.title!)

      return (
        typeof val.channelId !== 'undefined' &&
        (isEqualTitle(val.title!, info.title) ||
          (workTitle &&
            subTitle &&
            title.startsWith(workTitle) &&
            title.endsWith(subTitle)))
      )
    })

    console.log('[NCOverlay] searchData (filtered)', filtered)

    searchDataNormal.push(...filtered)
  }

  // 検索 (分割)
  if (
    !searchDataNormal.find((v) => v.channelId === DANIME_CHANNEL_ID) &&
    (info.title.match(/(劇場|映画)/) || 3600 <= info.duration)
  ) {
    const searchSplited = await NiconicoApi.search({
      query: deepmerge(searchQueryBase, {
        q: `${optimizedTitle} Chapter.`,
        filters: {
          tagsExact: {
            '0': 'dアニメストア',
          },
        },
      }),
    })

    if (searchSplited) {
      const chapterRegExp = /Chapter\.(\d)+/i

      const filtered = searchSplited
        .filter((val) => {
          const [title_first, , title_last] = val
            .title!.split(chapterRegExp)
            .map((v) => v.trim())

          return (
            val.channelId === DANIME_CHANNEL_ID &&
            chapterRegExp.test(val.title!) &&
            isEqualTitle(title_first, info.title) &&
            (!title_last || isEqualTitle(title_first, title_last))
          )
        })
        .sort((a, b) => {
          const chapterA = Number(a.title!.match(chapterRegExp)?.[1])
          const chapterB = Number(b.title!.match(chapterRegExp)?.[1])
          return chapterA - chapterB
        })

      const totalDuration = filtered.reduce(
        (sum, val) => sum + val.lengthSeconds!,
        0
      )

      if (
        totalDuration - 5 <= info.duration &&
        info.duration <= totalDuration + 5
      ) {
        console.log('[NCOverlay] searchData (splited)', filtered)

        searchDataSplited.push(...filtered)
      }
    }
  }

  if (0 < searchDataNormal.length || 0 < searchDataSplited.length) {
    return {
      normal: searchDataNormal,
      splited: searchDataSplited,
    }
  }

  return null
}
