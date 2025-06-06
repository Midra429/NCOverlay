import type { V1Thread } from '@xpadev-net/niconicomments'

import { MARKERS } from '@/constants/markers'

/**
 * マーカーの位置を探す
 */
export const findMarkers = (threads: V1Thread[]): (number | null)[] => {
  const comments = threads
    .flatMap((thread) => thread.comments)
    .sort((a, b) => a.vposMs - b.vposMs)

  return MARKERS.map(({ regexp, range }) => {
    let tmpCount = 0
    let tmpVposMs = 0

    const rangeStart = range?.[0] && range[0] * 1000
    const rangeEnd = range?.[1] && range[1] * 1000

    comments
      .filter((cmt) => {
        if (rangeStart && cmt.vposMs < rangeStart) return false
        if (rangeEnd && rangeEnd < cmt.vposMs) return false
        return regexp.test(cmt.body)
      })
      .forEach((cmt, idx, ary) => {
        const commentsInRange = ary.slice(idx).filter((val) => {
          return val.vposMs - cmt.vposMs <= 5000
        })
        const count = commentsInRange.length

        if (tmpCount < count) {
          const first = commentsInRange.at(0)!
          const last = commentsInRange.at(-1)!

          tmpCount = count
          tmpVposMs = Math.trunc(
            first.vposMs + (last.vposMs - first.vposMs) / 4
          )
        }
      })

    if (tmpCount && tmpVposMs) {
      return tmpVposMs
    }

    return null
  })
}
