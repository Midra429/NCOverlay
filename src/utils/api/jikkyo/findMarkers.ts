import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'

import { MARKERS } from '@/constants/markers'

export type JikkyoMarker = number | null

/**
 * マーカーの位置を探す
 */
export function findMarkers(threads: V1Thread[]): JikkyoMarker[] {
  const comments = threads
    .flatMap((thread) => thread.comments)
    .sort((a, b) => a.vposMs - b.vposMs)

  if (!comments.length) {
    return Array(MARKERS.length).fill(null)
  }

  const lastCmt = comments.at(-1)!

  return MARKERS.map(({ regexp, range }) => {
    const rangeStart = range[0] ? range[0] : 0
    const rangeEnd = range[1] ? range[1] : lastCmt.vposMs

    const filtered = comments.filter(({ vposMs, body }) => {
      return rangeStart <= vposMs && vposMs <= rangeEnd && regexp.test(body)
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
      return tmpVposMs
    }

    return null
  })
}
