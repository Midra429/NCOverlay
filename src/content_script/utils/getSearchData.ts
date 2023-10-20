import type { SearchData } from '@/types/niconico/search'
import { DANIME_CHANNEL_ID } from '@/constants'
import { NiconicoApi } from '@/content_script/api/niconico'
import { normalizeTitle } from '@/utils/normalizeTitle'
import { optimizeTitleForSearch } from '@/utils/optimizeTitleForSearch'
import { isEqualTitle } from '@/utils/isEqualTitle'

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
    title: optimizedTitle,
    duration: info.duration,
  })

  if (searchNormal) {
    const workTitle = info.workTitle ? normalizeTitle(info.workTitle) : null
    const subTitle = info.subTitle ? normalizeTitle(info.subTitle) : null

    const filtered = searchNormal.filter((val) => {
      const title = normalizeTitle(val.title!)

      return (
        val.channelId &&
        (isEqualTitle(val.title!, info.title) ||
          (workTitle &&
            subTitle &&
            title.startsWith(workTitle) &&
            title.endsWith(subTitle)))
      )
    })

    console.log('[NCOverlay] searchData', filtered)

    searchDataNormal.push(...filtered)
  }

  // 検索 (分割)
  if (
    !searchDataNormal.find((v) => v.channelId === DANIME_CHANNEL_ID) &&
    info.title.match(/(劇場|映画|\s本編$)/)
  ) {
    const searchSplited = await NiconicoApi.search({
      title: `${optimizedTitle} Chapter.`,
      tagsExact: ['dアニメストア'],
    })

    if (searchSplited) {
      const chapterRegExp = /chapter\.(\d)+$/i

      const filtered = searchSplited
        .filter((val) => {
          const hasChapter = chapterRegExp.test(val.title!)
          const baseTitle = val.title!.replace(chapterRegExp, '').trim()

          return (
            hasChapter &&
            val.channelId === DANIME_CHANNEL_ID &&
            isEqualTitle(baseTitle, info.title)
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
        info.duration - 5 <= totalDuration &&
        totalDuration <= info.duration + 5
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
