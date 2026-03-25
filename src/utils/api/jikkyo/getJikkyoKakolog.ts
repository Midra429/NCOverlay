import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'
import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { NCOState } from '@/ncoverlay/state'
import type { JikkyoChapter } from '@/utils/api/jikkyo/findChapters'
import type { JikkyoMarker } from '@/utils/api/jikkyo/findMarkers'

import { KAWAII_REGEXP } from '@/constants'
import { findMarkers } from '@/utils/api/jikkyo/findMarkers'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

import { findChapters } from './findChapters'

export interface GetJikkyoKakologParams {
  jkChId: JikkyoChannelId
  starttime: number | Date
  endtime: number | Date
}

export interface GetJikkyoKakologResult {
  thread: V1Thread
  markers: JikkyoMarker[]
  chapters: JikkyoChapter[]
  kawaiiCount: number
}

/**
 * ニコニコ実況 過去ログを取得
 * @param params `"${jkChId}:${starttime}-${endtime}"` | `GetJikkyoKakologParams`
 */
export async function getJikkyoKakolog(
  state: NCOState,
  params: string | GetJikkyoKakologParams
): Promise<GetJikkyoKakologResult | null> {
  if (typeof params === 'string') {
    const [jkChId, time] = params.split(':')
    const [starttime, endtime] = time.split('-')

    params = {
      jkChId: jkChId as JikkyoChannelId,
      starttime: Number(starttime),
      endtime: Number(endtime),
    }
  }

  // 過去ログ取得
  const thread = await ncoApiProxy.jikkyo.kakolog(
    params.jkChId,
    {
      starttime: params.starttime,
      endtime: params.endtime,
      format: 'json',
    },
    {
      compatV1Thread: true,
      userAgent: EXT_USER_AGENT,
    }
  )

  if (!thread) {
    return null
  }

  const info = await state.get('info')

  const markers = findMarkers([thread], info)
  const chapters = findChapters(markers, info)

  const kawaiiCount = thread.comments.filter((cmt) => {
    return KAWAII_REGEXP.test(cmt.body)
  }).length

  return { thread, markers, chapters, kawaiiCount }
}
