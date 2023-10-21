import type { V1Thread } from '@xpadev-net/niconicomments'
import type { NCOverlay } from '@/content_script/NCOverlay'
import { getSearchData } from './getSearchData'
import { getVideoData } from './getVideoData'
import { getThreadsData } from './getThreadsData'

const filterThreads = (threads: V1Thread[]) => {
  return threads
    .filter((v) => 0 < v.commentCount)
    .filter((v) => v.fork !== 'easy')
    .filter((val, idx, ary) => {
      return (
        idx === ary.findIndex((v) => v.id === val.id && v.fork === val.fork)
      )
    })
}

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

  // コメント情報
  const threadsData = await getThreadsData(videoData)
  if (!threadsData) return

  // コメント
  const threads = filterThreads(threadsData.map((v) => v.threads).flat())

  if (0 < threads.length) {
    console.log('[NCOverlay] threads', threads)

    nco.init({
      data: Object.values(videoData)
        .flat()
        .filter((v) => 0 < v.video.count.comment),
      comments: threads,
    })
  }
}
