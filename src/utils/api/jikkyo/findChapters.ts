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
  duration: number
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

  const marker = Object.fromEntries(
    MARKERS.map((val, idx) => {
      const marker = markers[idx]
      return [val.key, marker !== null ? marker - 1000 : null]
    })
  ) as Record<MarkerKey, number | null>

  if (marker.start === null) {
    return []
  }

  const durationMs = duration * 1000
  const halfDuration = durationMs / 2

  let avantChapter: VideoChapter | undefined
  let opChapter: VideoChapter | undefined
  let avantOpChapter: VideoChapter | undefined
  let mainChapter: VideoChapter | undefined
  let edChapter: VideoChapter | undefined
  let cPartChapter: VideoChapter | undefined

  for (const chapter of chapters) {
    switch (chapter.type) {
      case 'avant':
        avantChapter ??= chapter
        break

      case 'op':
        opChapter ??= chapter
        break

      case 'avant_op':
        avantOpChapter ??= chapter
        break

      case 'main':
        mainChapter ??= chapter
        break

      case 'ed':
        edChapter ??= chapter
        break

      case 'cPart':
        cPartChapter ??= chapter
        break

      case 'op-ed':
        if (chapter.startMs < halfDuration) {
          opChapter ??= chapter
        } else {
          edChapter ??= chapter
        }
        break
    }
  }

  if (!mainChapter) {
    return []
  }

  let avantJkChapter: JikkyoChapter | undefined
  let opJkChapter: JikkyoChapter | undefined
  let aPartJkChapter: JikkyoChapter | undefined
  let bPartJkChapter: JikkyoChapter | undefined
  let edJkChapter: JikkyoChapter | undefined
  let cPartJkChapter: JikkyoChapter | undefined
  const cmJkChapters: JikkyoChapter[] = []
  const otherJkChapters: JikkyoChapter[] = []

  // OP
  if (opChapter) {
    const startMs =
      0 < opChapter.startMs
        ? // アバン後にOP
          marker.op
        : // 出OP
          marker.start

    if (startMs !== null) {
      const endMs = startMs + opChapter.duration

      opJkChapter = {
        type: 'op',
        startMs,
        endMs,
      }

      console.log('opJkChapter:', opJkChapter)
    }
  }

  // ED
  if (edChapter) {
    let startMs: number | undefined
    let endMs: number | undefined

    if (marker.ed !== null) {
      startMs = marker.ed
      endMs = startMs + edChapter.duration
    } else if (marker.cPart !== null) {
      endMs = marker.cPart
      startMs = endMs - edChapter.duration
    } else if (marker.op !== null && halfDuration < marker.op) {
      startMs = marker.op
      endMs = startMs + edChapter.duration
    }

    if (startMs != null && endMs != null) {
      edJkChapter = {
        type: 'ed',
        startMs,
        endMs,
      }

      console.log('edJkChapter:', edJkChapter)
    }
  }

  // EDがないと判定不可
  if (!edJkChapter) {
    return []
  }

  // 本編
  {
    const aPartStartMs = marker.aPart
    const bPartStartMs = marker.bPart

    if (aPartStartMs === null) {
      return []
    }

    const cmDuration = edJkChapter.startMs - aPartStartMs - mainChapter.duration

    // CMあり (A/Bパート)
    if (0 < cmDuration && bPartStartMs !== null) {
      const aPartEndMs = bPartStartMs - cmDuration
      const bPartEndMs = edJkChapter.startMs

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

      console.log('aPartJkChapter:', aPartJkChapter)
      console.log('bPartJkChapter:', bPartJkChapter)
    }
    // CMなし (Aパートのみ)
    else if (Math.abs(cmDuration) < 4000 && bPartStartMs === null) {
      const endMs = edJkChapter.startMs
      const startMs = endMs - mainChapter.duration

      aPartJkChapter = {
        type: 'aPart',
        startMs,
        endMs,
      }

      console.log('aPartJkChapter:', aPartJkChapter)
    }
  }

  // Aパートがない場合は無効
  if (!aPartJkChapter) {
    return []
  }

  // Cパート
  if (cPartChapter) {
    const startMs = marker.cPart ?? edJkChapter.endMs
    const endMs = startMs + cPartChapter.duration

    cPartJkChapter = {
      type: 'cPart',
      startMs,
      endMs,
    }

    console.log('cPartJkChapter:', cPartJkChapter)
  }

  // アバン
  if (avantChapter && opJkChapter) {
    const endMs = opJkChapter.startMs
    const tmpStartMs = endMs - avantChapter.duration
    let startMs: number

    // 配信のほうがアバンが長い
    if (tmpStartMs < 0) {
      startMs = 0

      const otherStartMs = tmpStartMs
      const otherEndMs = 0

      otherJkChapters.push({
        type: 'other',
        startMs: otherStartMs,
        endMs: otherEndMs,
        isAdd: true,
      })

      console.log('otherJkChapters:', otherJkChapters)
    } else {
      startMs = tmpStartMs

      if (0 < startMs) {
        const otherStartMs = 0
        const otherEndMs = startMs

        otherJkChapters.push({
          type: 'other',
          startMs: otherStartMs,
          endMs: otherEndMs,
          isRemove: true,
        })

        console.log('otherJkChapters:', otherJkChapters)
      }
    }

    avantJkChapter = {
      type: 'avant',
      startMs,
      endMs,
    }

    console.log('avantJkChapter:', avantJkChapter)
  }

  // アバン(あらすじ) + OP
  if (
    avantOpChapter &&
    !avantJkChapter &&
    !opJkChapter &&
    marker.start !== null &&
    marker.op !== null
  ) {
    const avantDuration = marker.op - marker.start
    const opDuration = avantOpChapter.duration - avantDuration

    const avantStartMs = marker.start
    const avantEndMs = avantStartMs + avantDuration
    const opStartMs = marker.op
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

    console.log('avantJkChapter:', avantJkChapter)
    console.log('opJkChapter:', opJkChapter)
  }

  const jkChapters: JikkyoChapter[] = [
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
  const jkChapterCount = jkChapters.length

  const jkChapterResults: JikkyoChapter[] = []

  // 間を詰める
  for (let i = 0; i < jkChapterCount; i++) {
    const prev = jkChapters[i - 1]
    const current = jkChapters[i]

    let startMs: number | undefined
    let endMs: number | undefined

    if (prev) {
      if (prev.endMs < current.startMs) {
        const duration = current.startMs - prev.endMs

        startMs = prev.endMs
        endMs = startMs + duration
      }
    } else if (0 < current.startMs) {
      startMs = 0
      endMs = current.startMs
    }

    if (startMs != null && endMs != null) {
      jkChapterResults.push({
        type: 'other',
        startMs,
        endMs,
        isRemove: true,
      })
    }

    jkChapterResults.push(current)
  }

  return jkChapterResults
}

export function filterThreadsByJikkyoChapters(
  threads: V1Thread[],
  chapters: JikkyoChapter[]
): V1Thread[] {
  const adjustChapters = chapters.filter((v) => v.isAdd || v.isRemove)

  return threads.map<V1Thread>((thread) => {
    const comments = [...thread.comments]
    const commentCount = comments.length

    let totalOffsetMs = 0

    for (const chapter of adjustChapters) {
      const startMs = chapter.startMs - totalOffsetMs
      const endMs = chapter.endMs - totalOffsetMs
      const offsetMs = chapter.isRemove ? endMs - startMs : startMs - endMs

      for (let i = 0; i < commentCount; i++) {
        const cmt = comments[i]

        if (!cmt) continue

        const { vposMs } = cmt

        if (vposMs < startMs) {
          continue
        }

        if (vposMs <= endMs) {
          delete comments[i]

          continue
        }

        comments[i] = {
          ...cmt,
          vposMs: vposMs - offsetMs,
        }
      }

      totalOffsetMs += offsetMs
    }

    return {
      ...thread,
      comments: comments.filter((v) => v != null),
    }
  })
}
