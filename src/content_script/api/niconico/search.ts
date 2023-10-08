import type { ChromeMessage, ChromeResponse } from '@/types/chrome/message'
import type { SearchData } from '@/types/niconico/search'
import { normalizeTitle } from '@/utils/normalizeTitle'
import { optimizeTitleForSearch } from '@/utils/optimizeTitleForSearch'
import { isEqualTitle } from '@/utils/isEqualTitle'

export const search = async (info: {
  /** 検索タイトル */
  title: string
  /** 検索対象の動画の長さ用 */
  duration: number
  /** 作品のタイトル (あいまい検索用) */
  workTitle?: string
  /** エピソードのサブタイトル (あいまい検索用) */
  subtitle?: string
}): Promise<SearchData[] | null> => {
  const optimizedTitle = optimizeTitleForSearch(info.title)

  console.log(`[NCOverlay] optimizedTitle: ${optimizedTitle}`)

  const res = await chrome.runtime.sendMessage<
    ChromeMessage<'niconico:search'>,
    ChromeResponse<'niconico:search'>
  >({
    type: 'niconico:search',
    body: {
      title: optimizedTitle,
      duration: info.duration,
    },
  })

  if (res?.result) {
    console.log('[NCOverlay] search', res.result)

    const workTitle = info.workTitle ? normalizeTitle(info.workTitle) : null
    const subTitle = info.subtitle ? normalizeTitle(info.subtitle) : null

    const matched = res.result.filter((val) => {
      const title = normalizeTitle(val.title!)

      return (
        val.channelId &&
        (isEqualTitle(info.title, val.title!) ||
          (workTitle &&
            subTitle &&
            title.startsWith(workTitle) &&
            title.endsWith(subTitle)))
      )
    })

    if (matched) {
      return matched
    }
  }

  return null
}
