import type { GetDataFormatted } from '@midra/nco-utils/types/api/nicolog/get'
import type * as ThreadsV1 from '@midra/nco-utils/types/api/niconico/threads/v1'

import { KAWAII_REGEXP } from '@/constants'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

export interface GetNicologCommentResult {
  detail: GetDataFormatted
  threads: ThreadsV1.Thread[]
  commentCount: number
  kawaiiCount: number
}

/**
 * nicologのコメントを取得
 */
export async function getNicologComment(
  path: string
): Promise<GetNicologCommentResult | null> {
  const detail = await ncoApiProxy.nicolog.get({ path })

  if (!detail) {
    return null
  }

  const threads = await ncoApiProxy.nicolog.file(detail, {
    compatV1Thread: true,
  })

  if (!threads) {
    return null
  }

  const commentCount = threads.reduce(
    (prev, current) => prev + current.comments.length,
    0
  )
  const kawaiiCount = threads
    .map((thread) => {
      return thread.comments.filter((cmt) => {
        return KAWAII_REGEXP.test(cmt.body)
      }).length
    })
    .reduce((prev, current) => prev + current, 0)

  return { detail, threads, commentCount, kawaiiCount }
}
