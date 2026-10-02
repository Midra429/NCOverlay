import type { WatchResponse } from '@midra/nco-utils/api/services/niconico/watch'
import type * as ThreadsV1 from '@midra/nco-utils/types/api/niconico/threads/v1'

import { KAWAII_REGEXP } from '@/constants'
import { sleep } from '@/utils/sleep'
import { applyNgSettings } from '@/utils/api/niconico/applyNgSetting'
import { extractNgSettings } from '@/utils/api/niconico/extractNgSettings'
import { filterNvComment } from '@/utils/api/niconico/filterNvComment'
import { settings } from '@/utils/settings/extension'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

export interface GetNiconicoCommentResult {
  watchResponse: WatchResponse
  threads: ThreadsV1.Thread[]
  kawaiiCount: number
}

/**
 * ニコニコ動画のコメント取得
 */
export async function getNiconicoComment(
  query: string | WatchResponse,
  when?: number
): Promise<GetNiconicoCommentResult | null> {
  const [useNiconicoCredentials, _amount] = await settings.get(
    'comment:useNiconicoCredentials',
    'comment:amount'
  )
  // コメント表示量を一時的に1倍固定にする
  const amount = 1

  // 動画情報取得
  const watchResponse =
    typeof query === 'string'
      ? await ncoApiProxy.niconico.watch(
          query,
          useNiconicoCredentials ? 'include' : 'omit'
        )
      : query

  if (!watchResponse) {
    return null
  }

  // 取得するコメントの種類をフィルター
  filterNvComment(watchResponse)

  const { type, data, rawData } = watchResponse

  // コメント取得
  let threadsData: ThreadsV1.Data | null

  // 複数回取得
  if (useNiconicoCredentials && 1 < amount) {
    const additionals = {
      when: when || Math.floor(Date.now() / 1000),
      res_from: -1000,
    }

    const baseThreadsData = await ncoApiProxy.niconico.threads(
      watchResponse,
      additionals
    )
    const baseMainThread = baseThreadsData?.threads
      .filter((v) => v.fork === 'main')
      .reduce((prev, current) => {
        return prev.commentCount < current.commentCount ? current : prev
      })

    // コメントがない or 少ない
    if (!baseMainThread?.comments[0] || baseMainThread.comments[0].no < 5) {
      threadsData = baseThreadsData
    }
    // コメントがある
    else {
      // baseMainThreadのみを取得するためにNvCommentのtargetsをフィルター
      switch (type) {
        case 'v3':
        case 'v4': {
          rawData.comment.nvComment.params.targets =
            rawData.comment.nvComment.params.targets.filter((val) => {
              return (
                val.fork === baseMainThread.fork && val.id === baseMainThread.id
              )
            })

          break
        }
      }

      additionals.when = Math.floor(
        new Date(baseMainThread.comments[0].postedAt).getTime() / 1000
      )

      // 複数回
      let count = amount - 1

      while (0 < count--) {
        const threadsData = await ncoApiProxy.niconico.threads(
          watchResponse,
          additionals
        )
        const mainThread = threadsData?.threads.find((val) => {
          return (
            val.fork === baseMainThread.fork && val.id === baseMainThread.id
          )
        })

        if (!mainThread?.comments[0]) break

        baseMainThread.comments.push(...mainThread.comments)

        if (mainThread.comments[0].no < 5) break

        additionals.when = Math.floor(
          new Date(mainThread.comments[0].postedAt).getTime() / 1000
        )

        await sleep(1000)
      }

      baseMainThread.comments.sort((a, b) => a.no - b.no)

      threadsData = baseThreadsData
    }
  }
  // 1回
  else {
    threadsData = await ncoApiProxy.niconico.threads(watchResponse, {
      when,
    })
  }

  if (!threadsData) {
    return null
  }

  // コメントのNG設定を適用
  const threads = applyNgSettings(
    threadsData.threads,
    extractNgSettings(data.comment.ng)
  )

  const kawaiiCount = threads
    .map((thread) => {
      return thread.comments.filter((cmt) => {
        return KAWAII_REGEXP.test(cmt.body)
      }).length
    })
    .reduce((prev, current) => prev + current, 0)

  return { watchResponse, threads, kawaiiCount }
}
