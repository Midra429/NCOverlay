import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { MarkerKey } from '@/constants/markers'
import type { StateInfo } from '@/ncoverlay/state'
import type { VodKey } from '@/types/constants'
import type { JikkyoMarker } from './findMarkers'

import { MARKERS } from '@/constants/markers'

export const SUPPORTED_VOD_KEYS: VodKey[] = ['dAnime', 'dmmTv']

export type VideoChapterType =
  | 'avant'
  | 'op'
  | 'avant_op'
  | 'main'
  | 'ed'
  | 'cPart'
  | 'op-ed'
  | 'other'

export interface VideoChapter {
  type: VideoChapterType
  startMs: number
  endMs: number
}

export type JikkyoChapterType =
  | 'avant'
  | 'op'
  | 'aPart'
  | 'cm'
  | 'bPart'
  | 'ed'
  | 'cPart'
  | 'other'

export interface JikkyoChapter {
  type: JikkyoChapterType
  startMs: number
  endMs: number
  isAdd?: boolean
  isRemove?: boolean
}

export function findChapters(
  markers: JikkyoMarker[],
  info: StateInfo | null
): JikkyoChapter[] {
  if (!info) return []

  const { duration, chapters } = info

  if (
    !markers.length ||
    markers.every((v) => v === null) ||
    !duration ||
    !chapters?.length
  ) {
    return []
  }

  const durationMs = duration * 1000
  const halfDuration = durationMs / 2

  chapters.sort((a, b) => a.startMs - b.startMs)

  const marker = Object.fromEntries(
    MARKERS.map((v, i) => [v.key, markers[i]])
  ) as Record<MarkerKey, number | null>

  const avantChapter = chapters.find((v) => v.type === 'avant')
  const opChapter = chapters.find((v) => v.type === 'op')
  const avantOpChapter = chapters.find((v) => v.type === 'avant_op')
  const mainChapter = chapters.find((v) => v.type === 'main')
  const edChapter = chapters.find((v) => v.type === 'ed')
  const cPartChapter = chapters.find((v) => v.type === 'cPart')
  const opEdChapter = chapters.find((v) => v.type === 'op-ed')
  // const otherChapters = chapters.filter((v) => v.type === 'other')

  let avantJkChapter: JikkyoChapter | undefined
  let opJkChapter: JikkyoChapter | undefined
  let aPartJkChapter: JikkyoChapter | undefined
  let bPartJkChapter: JikkyoChapter | undefined
  let edJkChapter: JikkyoChapter | undefined
  let cPartJkChapter: JikkyoChapter | undefined
  const cmJkChapters: JikkyoChapter[] = []
  const otherJkChapters: JikkyoChapter[] = []

  if (!mainChapter) {
    return []
  }

  // アバン
  if (avantChapter) {
    const avantDurationByChapter = avantChapter.endMs - avantChapter.startMs

    let startMs: number | undefined
    let endMs: number | undefined

    if (marker.start !== null && marker.op !== null) {
      const avantDurationByMarker = marker.op - marker.start
      const durationDiff = avantDurationByChapter - avantDurationByMarker

      // アバン手前のクレジット部分の調節
      if (5000 <= durationDiff) {
        startMs = marker.start
        endMs = marker.op

        const otherStartMs = startMs - durationDiff
        const otherEndMs = startMs

        otherJkChapters.push({
          type: 'other',
          startMs: otherStartMs,
          endMs: otherEndMs,
          isAdd: true,
        })
      }
    }

    startMs ??= marker.start ?? avantChapter.startMs
    endMs ??= startMs + avantDurationByChapter

    avantJkChapter = {
      type: 'avant',
      startMs,
      endMs,
    }
  }

  // OP
  if (opChapter) {
    const startMs = avantJkChapter
      ? // アバン後にOP
        marker.op
      : // 出OP
        (marker.start ?? marker.op)

    if (startMs !== null) {
      const opDuration = opChapter.endMs - opChapter.startMs
      const endMs = startMs + opDuration

      opJkChapter = {
        type: 'op',
        startMs,
        endMs,
      }
    }
  }

  // アバン(あらすじ) + OP
  if (avantOpChapter) {
    if (
      !avantJkChapter &&
      !opJkChapter &&
      marker.start !== null &&
      marker.op !== null
    ) {
      const avantOpDuration = avantOpChapter.endMs - avantOpChapter.startMs
      const avantDuration = marker.op - marker.start
      const opDuration = avantOpDuration - avantDuration

      if (60000 < opDuration && opDuration <= 100000) {
        const avantStartMs = marker.start
        const avantEndMs = avantStartMs + avantDuration
        const opStartMs = avantEndMs
        const opEndMs = opStartMs + opDuration

        avantJkChapter = {
          type: 'avant',
          startMs: avantStartMs,
          endMs: avantEndMs,
        }
        opJkChapter = {
          type: 'op',
          startMs: opStartMs,
          endMs: opEndMs,
        }
      }
    }
  }

  // ED
  if (edChapter) {
    const edDuration = edChapter.endMs - edChapter.startMs
    let startMs: number | undefined
    let endMs: number | undefined

    if (marker.ed !== null) {
      startMs = marker.ed
      endMs = startMs + edDuration
    } else if (marker.cPart !== null) {
      endMs = marker.cPart
      startMs = endMs - edDuration
    } else if (marker.op !== null && halfDuration < marker.op) {
      startMs = marker.op
      endMs = startMs + edDuration
    }

    if (startMs != null && endMs != null) {
      edJkChapter = {
        type: 'ed',
        startMs,
        endMs,
      }
    }
  }

  // OP or ED
  if (opEdChapter) {
    const isEd = halfDuration < opEdChapter.startMs
    const opEdDuration = opEdChapter.endMs - opEdChapter.startMs

    if (isEd) {
      let startMs: number | undefined
      let endMs: number | undefined

      if (marker.op !== null || marker.ed !== null) {
        startMs = (marker.ed ?? marker.op)!
        endMs = startMs + opEdDuration
      } else if (marker.cPart !== null) {
        endMs = marker.cPart
        startMs = endMs - opEdDuration
      }

      if (startMs != null && endMs != null && halfDuration < endMs) {
        edJkChapter = {
          type: 'ed',
          startMs,
          endMs,
        }
      }
    } else {
      const startMs = avantJkChapter
        ? // アバン後にOP
          marker.op
        : // 出OP
          (marker.start ?? marker.op)

      if (startMs !== null && startMs < halfDuration) {
        const endMs = startMs + opEdDuration

        opJkChapter = {
          type: 'op',
          startMs,
          endMs,
        }
      }
    }
  }

  // Cパート
  if (cPartChapter) {
    const startMs = marker.cPart ?? edJkChapter?.endMs

    if (startMs != null) {
      const cPartDuration = cPartChapter.endMs - cPartChapter.startMs
      const endMs = startMs + cPartDuration

      cPartJkChapter = {
        type: 'cPart',
        startMs,
        endMs,
      }
    }
  }

  // 本編
  if (edJkChapter) {
    if (marker.start !== null || marker.aPart !== null) {
      const aPartStartMs = (marker.aPart ?? marker.start)!
      const bPartStartMs = marker.bPart

      const mainDuration = mainChapter.endMs - mainChapter.startMs
      const cmDuration = edJkChapter.startMs - aPartStartMs - mainDuration

      // CMあり (A/Bパート)
      if (0 < cmDuration && bPartStartMs !== null) {
        const aPartEndMs = bPartStartMs - cmDuration
        const bPartEndMs = edJkChapter.startMs
        const cmStartMs = aPartEndMs
        const cmEndMs = bPartStartMs

        aPartJkChapter = {
          type: 'aPart',
          startMs: aPartStartMs,
          endMs: aPartEndMs,
        }
        bPartJkChapter = {
          type: 'bPart',
          startMs: bPartStartMs,
          endMs: bPartEndMs,
        }

        cmJkChapters.push({
          type: 'cm',
          startMs: cmStartMs,
          endMs: cmEndMs,
          isRemove: true,
        })
      }
      // CMなし (Aパートのみ)
      else if (Math.abs(cmDuration) < 2000 && bPartStartMs === null) {
        const aPartEndMs = aPartStartMs + mainDuration

        aPartJkChapter = {
          type: 'aPart',
          startMs: aPartStartMs,
          endMs: aPartEndMs,
        }
      }
    }
  }

  // Aパートがない場合は無効
  if (!aPartJkChapter) {
    return []
  }

  const jikkyoChapters: JikkyoChapter[] = [
    avantJkChapter,
    opJkChapter,
    aPartJkChapter,
    bPartJkChapter,
    edJkChapter,
    cPartJkChapter,
    ...cmJkChapters,
    ...otherJkChapters,
  ]
    .filter((v) => v != null)
    .sort((a, b) => a.startMs - b.startMs)
  const jikkyoChapterCount = jikkyoChapters.length

  const results: JikkyoChapter[] = []

  // 間を埋める
  for (let i = 0; i < jikkyoChapterCount; i++) {
    const prev = jikkyoChapters[i - 1]
    const current = jikkyoChapters[i]

    let startMs: number | undefined
    let endMs: number | undefined
    let isAdd: boolean | undefined
    let isRemove: boolean | undefined

    if (prev) {
      if (prev.endMs < current.startMs) {
        const duration = current.startMs - prev.endMs

        startMs = prev.endMs
        endMs = startMs + duration
        isRemove = true
      }
    } else if (0 < current.startMs) {
      startMs = 0
      endMs = current.startMs
      isAdd = true
    }

    if (startMs != null && endMs != null) {
      results.push({
        type: 'other',
        startMs,
        endMs,
        isAdd,
        isRemove,
      })
    }

    results.push(current)
  }

  return results
}

export function filterThreadsByJikkyoChapters(
  threads: V1Thread[],
  chapters: JikkyoChapter[]
): V1Thread[] {
  threads = structuredClone(threads)

  const adjustChapters = chapters.filter((v) => v.isAdd || v.isRemove)

  for (const thread of threads) {
    const comments = thread.comments
    const commentCount = comments.length

    let totalOffsetMs = 0

    for (const chapter of adjustChapters) {
      const startMs = chapter.startMs - totalOffsetMs
      const endMs = chapter.endMs - totalOffsetMs
      const offsetMs = chapter.isRemove ? endMs - startMs : startMs - endMs

      for (let i = 0; i < commentCount; i++) {
        const cmt = comments[i]

        if (!cmt) continue

        if (cmt.vposMs < startMs) {
          continue
        }

        if (cmt.vposMs <= endMs) {
          delete comments[i]

          continue
        }

        cmt.vposMs -= offsetMs
      }

      totalOffsetMs += offsetMs
    }

    thread.comments = thread.comments.filter((v) => v != null)
  }

  return threads
}
