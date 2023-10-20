import type { NCOverlay } from '@/content_script/NCOverlay'
import { getSearchData } from './getSearchData'
import { getVideoData } from './getVideoData'
import { getThreads } from './getThreads'

export const loadComments = async (
  nco: NCOverlay,
  info: Parameters<typeof getSearchData>[0]
) => {
  // 検索結果
  const searchData = await getSearchData(info)

  if (!searchData) return

  // 動画情報
  const videoData = await getVideoData({
    normal: searchData.normal.map((v) => v.contentId ?? ''),
    splited: searchData.splited.map((v) => v.contentId ?? ''),
  })

  if (!videoData) return

  // コメント
  const threads = await getThreads(videoData)

  if (!threads) return

  nco.init({
    data: Object.values(videoData).flat(),
    comments: threads,
  })
}
