import type { SearchQuery, SearchData } from '@/types/niconico/search'
import { DANIME_CHANNEL_ID } from '@/constants'
import deepmerge from 'deepmerge'
import { NiconicoApi } from '@/content_script/api/niconico'
import { Parser } from '@/utils/parser'
import { Optimizer } from '@/utils/optimizer'

const searchQueryBase: Partial<SearchQuery> = {
  targets: ['title'],
  fields: ['contentId', 'title', 'userId', 'channelId', 'lengthSeconds'],
  filters: {
    'genre.keyword': { '0': 'アニメ' },
  },
  _sort: '-startTime',
  _limit: 25,
}

const searchQueryBaseWeakMatch = deepmerge(searchQueryBase, {
  // targets: ['description'],
  _limit: 50,
})

export const getSearchData = async (info: {
  /** 検索タイトル */
  title: string
  /** 再生時間 */
  duration: number
  /** エピソード番号 */
  episodeNumber?: number
  /** 再生時間の差 */
  durationDiff?: number
  /** 検索条件 */
  filters?: SearchQuery['filters']
  /** タイトルの一致判定を厳密にする */
  strictMatch?: boolean
}): Promise<{
  normal: SearchData[]
  splited: SearchData[]
} | null> => {
  const parseResult = Parser.parse(info.title)

  if (!info.strictMatch && info.episodeNumber != null) {
    parseResult.episode ??= {
      number: info.episodeNumber,
      text: `${info.episodeNumber}話`,
    }
  }

  console.log('[NCOverlay] parseResult', parseResult)

  const optimizedTitle = Optimizer.search(parseResult, info.strictMatch)

  console.log(`[NCOverlay] optimizedTitle: ${optimizedTitle}`)

  const searchDataNormal: SearchData[] = []
  const searchDataSplited: SearchData[] = []

  // 検索 (通常)
  const searchNormal = await NiconicoApi.search([
    deepmerge(info.strictMatch ? searchQueryBase : searchQueryBaseWeakMatch, {
      q: optimizedTitle,
      filters: deepmerge(
        {
          lengthSeconds: {
            gte: info.duration - (info.durationDiff ?? 15),
            lte: info.duration + (info.durationDiff ?? 15),
          },
        },
        { ...info.filters }
      ),
    }),
  ])

  console.log('[NCOverlay] searchData', searchNormal)

  if (searchNormal) {
    const filtered = searchNormal.filter((val) => {
      const compareResult = Parser.compare(parseResult, val.title!)

      return (
        // val.channelId != null &&
        (info.strictMatch ? 85 : 70) <= compareResult.total
      )
    })

    console.log('[NCOverlay] searchData (filtered)', filtered)

    searchDataNormal.push(...filtered)
  }

  // 検索 (分割)
  if (
    searchDataNormal.every((v) => v.channelId !== DANIME_CHANNEL_ID) &&
    (/劇場|映画/.test(info.title) || 3600 <= info.duration)
  ) {
    const searchSplited = await NiconicoApi.search([
      deepmerge(info.strictMatch ? searchQueryBase : searchQueryBaseWeakMatch, {
        q: `${optimizedTitle} Chapter.`,
        filters: deepmerge(
          {
            tagsExact: { '0': 'dアニメストア' },
          },
          { ...info.filters }
        ),
      }),
    ])

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
            90 <= Parser.compare(title_first, info.title).total &&
            (!title_last || 90 <= Parser.compare(title_first, title_last).total)
          )
        })
        .sort((a, b) => {
          const chapterA = Number(a.title!.match(chapterRegExp)?.[1])
          const chapterB = Number(b.title!.match(chapterRegExp)?.[1])
          return chapterA - chapterB
        })

      // Chapterが連続しているかどうか
      const isOrdered = filtered.every((val, idx, ary) => {
        const prev =
          0 < idx ? Number(ary[idx - 1].title!.match(chapterRegExp)?.[1]) : 0
        const now = Number(val.title!.match(chapterRegExp)?.[1])
        return now - prev === 1
      })

      if (isOrdered) {
        const totalDuration = filtered
          .map((v) => v.lengthSeconds!)
          .reduce((s, v) => s + v, 0)

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
