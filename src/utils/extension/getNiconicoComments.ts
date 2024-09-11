import type { V1Thread } from '@xpadev-net/niconicomments'
import type { VideoData } from '@midra/nco-api/types/niconico/video'

import { filterNvComment } from '@/utils/extension/filterNvComment'

import { ncoApiProxy } from '@/proxy/nco-api'

/**
 * ニコニコ動画のコメント取得
 */
export const getNiconicoComments = async (
  params: {
    contentId: string
    when?: number
  }[]
): Promise<
  ({
    data: VideoData
    threads: V1Thread[]
  } | null)[]
> => {
  // 動画情報取得
  const videos = await Promise.all(
    params.map(({ contentId }) => {
      return ncoApiProxy.niconico.video(contentId)
    })
  )

  // コメント取得
  const threadsData = await Promise.all(
    videos.map((video, idx) => {
      if (!video) return null

      const nvComment = filterNvComment(video.comment)

      return ncoApiProxy.niconico.threads(nvComment, {
        when: params[idx].when,
      })
    })
  )

  return threadsData.map((val, idx) => {
    return val
      ? {
          data: videos[idx]!,
          threads: val.threads,
        }
      : null
  })
}
