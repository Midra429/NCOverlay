import type { V1Thread } from '@xpadev-net/niconicomments'
import type { NCOverlay } from '@/content_script/NCOverlay'
import { ChromeStorageApi } from '@/utils/chrome/storage'
import { getSearchData } from './getSearchData'
import { getVideoData } from './getVideoData'
import { getThreadsData } from './getThreadsData'

const filterThreads = (threads: V1Thread[]) => {
  return threads.filter((val, idx, ary) => {
    return (
      // コメントあり
      0 < val.commentCount &&
      // 重複除外
      idx === ary.findIndex((v) => v.id === val.id && v.fork === val.fork) &&
      // かんたんコメント除外
      val.fork !== 'easy'
    )
  })
}

export const loadComments = async (
  nco: NCOverlay,
  info: Parameters<typeof getSearchData>[0]
) => {
  const settings = await ChromeStorageApi.getSettings()

  info.weakMatch = settings.weakMatch

  // 検索結果
  const searchData = await getSearchData(info)
  if (!searchData) return

  const videoIds = {
    normal: searchData.normal.map((v) => v.contentId ?? ''),
    splited: searchData.splited.map((v) => v.contentId ?? ''),
  }

  // 動画情報
  const videoData = await getVideoData(videoIds)
  if (!videoData) return

  // コメント情報
  const threadsData = await getThreadsData(videoData)
  if (!threadsData) return

  const videoDataValues = Object.values(videoData).flat()

  // 分割されている動画の合計時間
  const splitedTotalDuration = videoData.splited.reduce(
    (sum, val) => sum + val.video.duration,
    0
  )

  // コメントの位置を調整
  for (const data of videoDataValues) {
    const videoId = data.video.id
    const threads = threadsData[videoId]?.threads

    if (!threads) continue

    const duration = videoIds.normal.includes(videoId)
      ? data.video.duration
      : splitedTotalDuration
    const diff = info.duration - duration
    const offsetMs = Math.floor((diff / 2) * 1000)

    if (1000 <= Math.abs(offsetMs)) {
      for (const thread of threads) {
        for (const comment of thread.comments) {
          comment.vposMs += offsetMs
        }
      }
    }
  }

  // コメント
  const threads = filterThreads(
    Object.values(threadsData)
      .map((v) => v.threads)
      .flat()
  )

  if (0 < threads.length) {
    console.log('[NCOverlay] threads', threads)

    nco.init({
      data: videoDataValues,
      comments: threads,
    })
  }
}
