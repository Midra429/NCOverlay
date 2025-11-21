import type { V1Thread } from '@xpadev-net/niconicomments'
import type { GetDataFormatted } from '@midra/nco-utils/types/api/nicolog/get'

import { KAWAII_REGEXP } from '@/constants'

import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

/**
 * nicologのコメントを取得
 */
export async function getNicologComments(paths: string[]): Promise<
  ({
    data: GetDataFormatted
    thread: V1Thread
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

  return files.map((thread, idx) => {
    if (thread) {
      const data = details[idx]!

      const kawaiiCount = thread.comments.filter((cmt) => {
        return KAWAII_REGEXP.test(cmt.body)
      }).length

      return { data, thread, kawaiiCount }
    } else {
      return null
    }
  })
}
