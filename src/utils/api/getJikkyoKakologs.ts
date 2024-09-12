import type { V1Thread } from '@xpadev-net/niconicomments'
import type { JikkyoChannelId } from '@midra/nco-api/types/constants'

import { ncoApiProxy } from '@/proxy/nco-api'

import { findMarkers } from './findMarkers'

/**
 * ニコニコ実況 過去ログを取得
 */
export const getJikkyoKakologs = async (
  params: {
    jkChId: JikkyoChannelId
    starttime: number | Date
    endtime: number | Date
  }[]
): Promise<
  ({
    thread: V1Thread
    markers: (number | null)[]
  } | null)[]
> => {
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

      return { thread, markers }
    } else {
      return null
    }
  })
}
