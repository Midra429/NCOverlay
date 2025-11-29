import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'

import { KAWAII_REGEXP } from '@/constants'

import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

import { findMarkers } from '@/utils/extension/findMarkers'

/**
 * ニコニコ実況 過去ログを取得
 */
export async function getJikkyoKakologs(
  params: {
    jkChId: JikkyoChannelId
    starttime: number | Date
    endtime: number | Date
  }[]
): Promise<
  ({
    thread: V1Thread
    markers: (number | null)[]
    kawaiiCount: number
  } | null)[]
> {
  // 過去ログ取得
  const kakologs = await Promise.all(
    params.map(({ jkChId, starttime, endtime }) => {
      return ncoApiProxy.jikkyo.kakolog(
        jkChId,
        {
          starttime,
          endtime,
          format: 'json',
        },
        {
          compatV1Thread: true,
          userAgent: EXT_USER_AGENT,
        }
      )
    })
  )

  return kakologs.map((thread) => {
    if (thread) {
      const markers = findMarkers([thread])

      const kawaiiCount = thread.comments.filter((cmt) => {
        return KAWAII_REGEXP.test(cmt.body)
      }).length

      return { thread, markers, kawaiiCount }
    } else {
      return null
    }
  })
}
