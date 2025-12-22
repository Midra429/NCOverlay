import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { StateInfo } from '@/ncoverlay/state'

import { MARKERS } from '@/constants/markers'

export type JikkyoMarker = number | null

/**
 * マーカーの位置を探す
 */
export function findMarkers(
  threads: V1Thread[],
  info?: StateInfo | null
): JikkyoMarker[] {
  const comments = threads
    .flatMap((thread) => thread.comments)
    .sort((a, b) => a.vposMs - b.vposMs)

  if (!comments.length) {
    return Array(MARKERS.length).fill(null)
  }

  const lastCmt = comments.at(-1)!
  const mainChapter = info?.chapters?.find((v) => v.type === 'main')
  const mainChapterEndMs = mainChapter?.endMs ?? 0

  let prevVposMs = 0

  return MARKERS.map(({ key, regexp, range }) => {
    const rangeStart = range[0] ?? -Infinity
    const rangeEnd = range[1] ?? Infinity

    const minVposMs = Math.max(
      prevVposMs,
      rangeStart,
      key === 'ed' || key === 'cPart' ? mainChapterEndMs : 0
    )
    const maxVposMs = Math.min(lastCmt.vposMs, rangeEnd)

    const filtered = comments.filter(({ vposMs, body }) => {
      return minVposMs <= vposMs && vposMs <= maxVposMs && regexp.test(body)
    })
    const len = filtered.length

    let tmpCount = 0
    let tmpVposMs = 0

    for (let i = 0; i < len; i++) {
      const { vposMs } = filtered[i]

      const commentsInRange = filtered.slice(i).filter((val) => {
        return val.vposMs - vposMs <= 8000
      })
      const count = commentsInRange.length

      if (tmpCount < count) {
        const first = commentsInRange[0]
        const last = commentsInRange.at(-1)!

        const adjustOffset = Math.trunc((last.vposMs - first.vposMs) / 8)

        tmpCount = count
        tmpVposMs = first.vposMs + adjustOffset
      }
    }

    if (tmpCount) {
      prevVposMs = tmpVposMs

      return tmpVposMs
    }

    return null
  })
}
