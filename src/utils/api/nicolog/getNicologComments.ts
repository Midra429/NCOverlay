import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { GetDataFormatted } from '@midra/nco-utils/types/api/nicolog/get'

import { KAWAII_REGEXP } from '@/constants'

import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

/**
 * nicologのコメントを取得
 */
export async function getNicologComments(paths: string[]): Promise<
  ({
    data: GetDataFormatted
    threads: V1Thread[]
    commentCount: number
    kawaiiCount: number
  } | null)[]
> {
  const details = await Promise.all(
    paths.map((path) => ncoApiProxy.nicolog.get({ path }))
  )

  const files = await Promise.all(
    details.map((detail) => {
      return (
        detail && ncoApiProxy.nicolog.file(detail, { compatV1Thread: true })
      )
    })
  )

  return files.map((threads, idx) => {
    if (threads) {
      const data = details[idx]!

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

      return { data, threads, commentCount, kawaiiCount }
    } else {
      return null
    }
  })
}
