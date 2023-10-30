import type { VideoData } from '@/types/niconico/video'
import type { ThreadsData } from '@/types/niconico/threads'
import { NiconicoApi } from '@/content_script/api/niconico'
import { ChromeStorageApi } from '@/utils/chrome/storage'

const filterNvComment = (
  nvComment: VideoData['comment']['nvComment']
): Parameters<typeof NiconicoApi.threads>[0]['nvComment'] => {
  let { params, threadKey } = nvComment

  // かんたんコメント除外
  params.targets = params.targets.filter((v) => v.fork !== 'easy')

  return {
    additionals: {},
    params,
    threadKey,
  }
}

const filterThreadsData = (
  threadsData: ThreadsData,
  ng?: VideoData['comment']['ng'] | null
): ThreadsData => {
  let { globalComments, threads } = threadsData

  if (ng) {
    // NG設定 (コメント)
    const ngWords = ng?.viewer?.items
      .filter((v) => v.type === 'word')
      .map((v) => v.source)

    // NG設定 (ユーザーID)
    const ngIds = ng?.viewer?.items
      .filter((v) => v.type === 'id')
      .map((v) => v.source)

    // NG設定 (コマンド)
    const ngCommands = ng?.viewer?.items
      .filter((v) => v.type === 'command')
      .map((v) => v.source)

    if (ngWords || ngIds || ngCommands) {
      const ngComments: (typeof threads)[0]['comments'] = []

      for (const thread of threads) {
        thread.comments = thread.comments.filter((comment) => {
          const isNg =
            // コメント
            ngWords?.some((v) => comment.body.includes(v)) ||
            // ユーザーID
            ngIds?.includes(comment.userId) ||
            // コマンド
            comment.commands.some((v) => ngCommands?.includes(v))

          if (isNg) {
            ngComments.push(comment)
          }

          return !isNg
        })
      }

      console.log('[NCOverlay] ngComments', { ngComments })
    }
  }

  return { globalComments, threads }
}

export const getThreadsData = async (videoData: {
  normal?: VideoData[]
  splited?: VideoData[]
}): Promise<{
  [videoId: string]: ThreadsData
} | null> => {
  const settings = await ChromeStorageApi.getSettings()

  videoData.normal ??= []
  videoData.splited ??= []

  let threadsDataNormal: { [id: string]: ThreadsData } = {}
  let threadsDataSplited: { [id: string]: ThreadsData } = {}

  // 通常の動画
  if (0 < videoData.normal.length) {
    for (const data of videoData.normal) {
      const res = await NiconicoApi.threads({
        nvComment: filterNvComment(data.comment.nvComment),
        server: data.comment.nvComment.server,
      })

      if (res) {
        threadsDataNormal[data.video.id] = filterThreadsData(
          res,
          settings.useNgList ? data.comment.ng : null
        )
      }
    }

    console.log('[NCOverlay] threadsData', threadsDataNormal)
  }

  // 分割されている動画
  if (0 < videoData.splited.length) {
    let tmpOffset = 0

    for (const data of videoData.splited) {
      const res = await NiconicoApi.threads({
        nvComment: filterNvComment(data.comment.nvComment),
        server: data.comment.nvComment.server,
      })

      if (res) {
        if (0 < tmpOffset) {
          for (const thread of res.threads) {
            for (const comment of thread.comments) {
              comment.vposMs += tmpOffset
            }
          }
        }

        tmpOffset += data.video.duration * 1000

        threadsDataSplited[data.video.id] = filterThreadsData(
          res,
          settings.useNgList ? data.comment.ng : null
        )
      } else {
        threadsDataSplited = {}
        break
      }
    }

    console.log('[NCOverlay] threadsData (splited)', threadsDataSplited)
  }

  if (
    0 < Object.keys(threadsDataNormal).length ||
    0 < Object.keys(threadsDataSplited).length
  ) {
    return {
      ...threadsDataNormal,
      ...threadsDataSplited,
    }
  }

  return null
}
