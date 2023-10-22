import type { SearchQuery, SearchData } from '@/types/niconico/search'
import { DANIME_CHANNEL_ID } from '@/constants'
import deepmerge from 'deepmerge'
import { NiconicoApi } from '@/content_script/api/niconico'
import { normalize } from '@/utils/normalize'
import { optimize } from '@/utils/optimize'
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
  const optimizedTitle = optimize.title(info.title)

  console.log(`[NCOverlay] optimizedTitle: ${optimizedTitle}`)

  const searchDataNormal: SearchData[] = []
  const searchDataSplited: SearchData[] = []

  // 検索 (通常)
  const searchNormal = await NiconicoApi.search({
    query: deepmerge(searchQueryBase, {
      q: optimizedTitle,
      filters: {
        lengthSeconds: {
          gte: info.duration - 15,
          lte: info.duration + 15,
        },
      },
    }),
  })

  console.log('[NCOverlay] searchData', searchNormal)

  if (searchNormal) {
    const workTitle = info.workTitle ? normalize.title(info.workTitle) : null
    const subTitle = info.subTitle ? normalize.title(info.subTitle) : null

    const filtered = searchNormal.filter((val) => {
      const title = normalize.title(val.title!)

      // 完全一致
      const isMatch = isEqualTitle(val.title!, info.title)

      // 部分一致
      const isPartialMatch =
        workTitle &&
        subTitle &&
        title.startsWith(workTitle) &&
        title.endsWith(subTitle)

      return val.channelId != null && (isMatch || isPartialMatch)
    })

    console.log('[NCOverlay] searchData (filtered)', filtered)

    searchDataNormal.push(...filtered)
  }

  // 検索 (分割)
  if (
    !searchDataNormal.some((v) => v.channelId === DANIME_CHANNEL_ID) &&
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

    console.log('[NCOverlay] searchData (splited)', searchSplited)

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

      // Chapterが連続しているかどうか
      const isOrdered = !filtered.some((val, idx, ary) => {
        if (0 < idx) {
          const prev = Number(ary[idx - 1].title!.match(chapterRegExp)?.[1])
          const now = Number(val.title!.match(chapterRegExp)?.[1])
          return now - prev !== 1
        }
      })

      if (isOrdered) {
        const totalDuration = filtered.reduce(
          (sum, val) => sum + val.lengthSeconds!,
          0
        )

        console.log('[NCOverlay] duration', info.duration)
        console.log('[NCOverlay] duration (splited)', totalDuration)

        if (
          totalDuration - 5 <= info.duration &&
          info.duration <= totalDuration + 5
        ) {
          console.log('[NCOverlay] searchData (splited, filtered)', filtered)

          searchDataSplited.push(...filtered)
        }
      } else {
        console.log('[NCOverlay] Error: Chapterが連続していません', filtered)
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
