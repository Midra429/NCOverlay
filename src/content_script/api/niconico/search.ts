import type { ChromeMessage, ChromeResponse } from '@/types/chrome'
import type { SearchData } from '@/types/niconico/search'
import { normalizeTitle } from '@/utils/normalizeTitle'
import { optimizeTitleForSearch } from '@/utils/optimizeTitleForSearch'
import { isEqualTitle } from '@/utils/isEqualTitle'

export const search = async (info: {
  title: string
  duration: number
  workTitle?: string
  subtitle?: string
}): Promise<SearchData[] | null> => {
  const optimizedTitle = optimizeTitleForSearch(info.title)

  console.log(`[NCOverlay] optimizedTitle: ${optimizedTitle}`)

  const res = await chrome.runtime.sendMessage<
    ChromeMessage<'niconico:search'>,
    ChromeResponse<'niconico:search'>
  >({
    id: Date.now(),
    type: 'niconico:search',
    body: {
      title: optimizedTitle,
      duration: info.duration,
    },
  })

  if (res.result) {
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
