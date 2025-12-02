import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { GetDataFormatted } from '@midra/nco-utils/types/api/nicolog/get'

import { KAWAII_REGEXP } from '@/constants'

import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

export interface GetNicologCommentResult {
  detail: GetDataFormatted
  threads: V1Thread[]
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
