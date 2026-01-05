import type {
  V1Comment,
  V1Thread,
} from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { DeepPartial } from 'utility-types'
import type { VodKey } from '@/types/constants'
import type {
  JikkyoChapter,
  VideoChapter,
} from '@/utils/api/jikkyo/findChapters'
import type { JikkyoMarker } from '@/utils/api/jikkyo/findMarkers'
import type { StorageOnChangeCallback } from '@/utils/storage'
import type { NCOSearcherAutoSearchArgs } from './searcher'

import equal from 'fast-deep-equal'

import {
  COLOR_CODE_REGEXP,
  NICONICO_COLOR_COMMANDS,
  NICONICO_DEFAULT_DURATION,
} from '@/constants'
import { deepmerge } from '@/utils/deepmerge'
import { logger } from '@/utils/logger'
import { filterThreadsByJikkyoChapters } from '@/utils/api/jikkyo/findChapters'
import { isNgComment } from '@/utils/api/niconico/applyNgSetting'
import { findAssistedCommentIds } from '@/utils/api/niconico/findAssistedCommentIds'
import { getNgSettings } from '@/utils/api/niconico/getNgSettings'
import { settings } from '@/utils/settings/extension'
import { storage } from '@/utils/storage/extension'

export interface NCOStateItems {
  [key: `state:${number}:status`]: StateStatus | null
  [key: `state:${number}:vod`]: StateVod | null
  [key: `state:${number}:info`]: StateInfo | null
  [key: `state:${number}:offset`]: StateOffset | null
  [key: `state:${number}:slots`]: StateSlot[] | null
  [key: `state:${number}:slotDetails`]: StateSlotDetail[] | null
}

export type NCOStateItemKey =
  keyof NCOStateItems extends `state:${number}:${infer K}` ? K : never

export type NCOStateArrayItemKey = {
  [K in keyof NCOStateItems]: NCOStateItems[K] extends unknown[] | null
    ? K
    : never
}[keyof NCOStateItems] extends `state:${number}:${infer K}`
  ? K
  : never

export type NCOStateItem<T extends NCOStateItemKey> =
  NCOStateItems[`state:${number}:${T}`]

export type StateStatus =
  | 'pending'
  | 'searching'
  | 'loading'
  | 'ready'
  | 'error'

export type StateVod = VodKey

export type StateInfo = Partial<NCOSearcherAutoSearchArgs> & {
  chapters?: VideoChapter[]
}

export type StateOffset = number

export interface StateSlot {
  /**
   * 動画ID or `${jkChId}:${starttime}-${endtime}`
   */
  id: string
  threads: V1Thread[]
  isAutoLoaded?: boolean
}

export interface StateSlotDetailBase {
  /**
   * 動画ID or `${jkChId}:${starttime}-${endtime}`
   */
  id: string
  status: 'pending' | 'loading' | 'ready' | 'error'
  offsetMs?: number
  translucent?: boolean
  hidden?: boolean
  skip?: boolean
  isAutoLoaded?: boolean
}

export interface StateSlotDetailDefault extends StateSlotDetailBase {
  type: 'normal' | 'official' | 'danime' | 'chapter' | 'szbh'
  info: {
    id: string
    source: 'niconico'
    channelId?: number
    title: string
    duration: number
    date: number
    tags: string[]
    count: {
      view: number
      comment: number
      kawaii?: number
    }
    thumbnail?: string
  }
}

export interface StateSlotDetailJikkyo extends StateSlotDetailBase {
  type: 'jikkyo'
  info: {
    id: string | null
    source: 'syobocal' | 'tver' | 'nhkPlus' | null
    title: string
    duration: number
    date: [start: number, end: number]
    count: {
      comment: number
      kawaii?: number
    }
  }
  markers: JikkyoMarker[]
  chapters: JikkyoChapter[]
}

export interface StateSlotDetailNicolog extends StateSlotDetailBase {
  type: 'nicolog'
  info: {
    id: string
    source: 'nicolog'
    title: string
    duration: null
    date: number
    count: {
      comment: number
      kawaii?: number
    }
  }
}

export interface StateSlotDetailFile extends StateSlotDetailBase {
  type: 'file'
  info: {
    id: null
    source: null
    title: string
    duration: null
    date: number
    count: {
      comment: number
      kawaii?: number
    }
  }
}

export type StateSlotDetail =
  | StateSlotDetailDefault
  | StateSlotDetailJikkyo
  | StateSlotDetailNicolog
  | StateSlotDetailFile

export type StateSlotDetailUpdate = DeepPartial<StateSlotDetail> &
  Required<Pick<StateSlotDetail, 'id'>>

export interface NcoV1Comment extends V1Comment {
  _raw: {
    commands: string[]
  }
  _nco: {
    slotType: StateSlotDetail['type']
  }
}

export interface NcoV1Thread extends Omit<V1Thread, 'comments'> {
  comments: NcoV1Comment[]
  _nco: {}
}

const DURATION_COMMAND_REGEXP = /(?<=^@)[\d\.]+$/

export async function filterDisplayThreads(
  ncoState: NCOState
): Promise<NcoV1Thread[] | null> {
  const [slots, details] = await Promise.all([
    ncoState.get('slots'),
    ncoState.get('slotDetails'),
  ])

  if (!slots?.length || !details?.length) {
    return null
  }

  const threadMap = new Map<string, NcoV1Thread>()

  const [
    ngSettings,
    [
      speed,
      commentCustomize,
      hideAssistedComments,
      adjustJikkyoOffset,
      jikkyoOnlyAdjustable,
    ],
  ] = await Promise.all([
    getNgSettings(),
    settings.get(
      'settings:comment:speed',
      'settings:comment:customize',
      'settings:comment:hideAssistedComments',
      'settings:comment:adjustJikkyoOffset',
      'settings:autoSearch:jikkyoOnlyAdjustable'
    ),
  ])

  let cmtCnt = 0
  let assistedCmtCnt = 0

  for (const detail of details) {
    const {
      id,
      status,
      offsetMs,
      translucent,
      hidden,
      skip,
      type,
      isAutoLoaded,
    } = detail

    if (hidden || status !== 'ready') {
      continue
    }

    const slot = slots.find((slot) => slot.id === id)

    if (!slot) continue

    // 実況: オフセット自動調節
    if (type === 'jikkyo') {
      if (adjustJikkyoOffset) {
        if (detail.chapters.length) {
          slot.threads = filterThreadsByJikkyoChapters(
            slot.threads,
            detail.chapters
          )
        } else if (isAutoLoaded && jikkyoOnlyAdjustable) {
          if (!skip) {
            await ncoState.update('slotDetails', ['id'], {
              id,
              skip: true,
            })
          }

          continue
        }
      }

      if (skip) {
        await ncoState.update('slotDetails', ['id'], {
          id,
          skip: false,
        })
      }
    }

    const customizeData = commentCustomize[type === 'chapter' ? 'danime' : type]
    const customColor = customizeData?.color
    const customOpacity = customizeData?.opacity

    let customColorCommand: string | undefined
    let customOpacityCommand: string | undefined
    let customDurationCommand: string | undefined
    let opacity = 1

    // 色
    if (
      customColor != null &&
      COLOR_CODE_REGEXP.test(customColor) &&
      customColor !== '#FFFFFF'
    ) {
      customColorCommand = customColor
    }

    // 不透明度
    if (customOpacity != null) {
      opacity *= customOpacity / 100
    }

    // 半透明
    if (translucent) {
      opacity *= 0.5
    }

    if (opacity !== 1) {
      customOpacityCommand = `nico:opacity:${opacity}`
    }

    // 速度
    if (speed !== 1) {
      customDurationCommand = `@${Math.round((NICONICO_DEFAULT_DURATION / speed) * 100) / 100}`
    }

    for (const thread of slot.threads) {
      const key = `${thread.fork}:${thread.id}`

      if (threadMap.has(key)) continue

      // コメントアシストと予想されるコメント
      const assistedCommentIds =
        hideAssistedComments &&
        type !== 'jikkyo' &&
        type !== 'nicolog' &&
        type !== 'file'
          ? findAssistedCommentIds(thread.comments)
          : null

      cmtCnt += thread.comments.length
      assistedCmtCnt += assistedCommentIds?.length ?? 0

      const comments: NcoV1Comment[] = []

      for (const cmt of thread.comments) {
        if (
          // コメントアシスト
          assistedCommentIds?.includes(cmt.id) ||
          // NG
          isNgComment(cmt, ngSettings)
        ) {
          continue
        }

        // オフセット
        const vposMs = cmt.vposMs + (offsetMs ?? 0)

        let commands = [...cmt.commands]
        let isPremium = cmt.isPremium

        // 色
        if (customColorCommand) {
          const existsColorCommand = commands.some((command) => {
            return (
              NICONICO_COLOR_COMMANDS.includes(command) ||
              COLOR_CODE_REGEXP.test(command)
            )
          })

          if (!existsColorCommand) {
            // isPremiumじゃないと一部カラーコマンドが使えない
            isPremium = true

            commands.push(customColorCommand)
            commands.push('nco:customize:color')
          }
        }

        // 不透明度
        if (customOpacityCommand) {
          commands.push(customOpacityCommand)
          commands.push('nco:customize:opacity')
        }

        // 速度
        if (
          customDurationCommand &&
          !commands.includes('ue') &&
          !commands.includes('shita')
        ) {
          const durationCommand = commands.find((cmd) => {
            return DURATION_COMMAND_REGEXP.test(cmd)
          })

          if (durationCommand) {
            const customDuration = Number(
              durationCommand.match(DURATION_COMMAND_REGEXP)![0]
            )

            commands.push(
              `@${Math.round((customDuration / speed) * 100) / 100}`
            )
          } else {
            commands.push(customDurationCommand)
          }

          commands.push('nco:customize:speed')
        }

        comments.push({
          ...cmt,
          vposMs,
          commands,
          isPremium,
          _raw: {
            commands: cmt.commands,
          },
          _nco: {
            slotType: type,
          },
        })
      }

      const commentCount = comments.length

      if (thread.commentCount) {
        threadMap.set(key, {
          ...thread,
          comments,
          commentCount,
          _nco: {},
        })
      }
    }
  }

  if (hideAssistedComments) {
    logger.log('assistedComment', `${assistedCmtCnt} / ${cmtCnt}`)
  }

  const threads = [...threadMap.values()]

  return threads.length ? threads : null
}

/**
 * NCOverlayのデータ管理担当
 */
export class NCOState {
  readonly id: number

  constructor(id: number) {
    this.id = id
  }

  dispose() {
    this.clear()
  }

  async get<K extends NCOStateItemKey, V extends NCOStateItem<K>>(
    key: K,
    target?: V extends unknown[] ? Partial<V[number]> : never
  ): Promise<NCOStateItem<K> | null> {
    const value = await storage.get(`state:${this.id}:${key}`)

    if (target) {
      if (Array.isArray(value)) {
        const entries = Object.entries(target)

        const filtered = value.filter((val) => {
          return entries.every(([k, v]) => {
            return equal(val[k as keyof typeof val], v)
          })
        })

        return filtered as NCOStateItem<K>
      }
    } else {
      return value
    }

    return null
  }

  async getThreads() {
    return filterDisplayThreads(this)
  }

  set<K extends NCOStateItemKey>(key: K, value: NCOStateItem<K>) {
    return storage.set(`state:${this.id}:${key}`, value as any)
  }

  async add<K extends NCOStateArrayItemKey>(
    key: K,
    ...values: NonNullable<NCOStateItem<K>>
  ) {
    const oldValue = await this.get(key)

    const exists = values.some((val) => {
      return oldValue?.some((old) => old.id === val.id)
    })

    if (!exists) {
      const value = (
        oldValue ? [...oldValue, ...values] : values
      ) as NCOStateItem<K>

      return this.set(key, value)
    }
  }

  async update<
    K extends NCOStateArrayItemKey,
    V extends NonNullable<NCOStateItem<K>>,
    U extends V extends unknown[] ? V[number] : V,
    P extends keyof U = never,
  >(
    key: K,
    fixedPropKeys: readonly P[],
    value: DeepPartial<U> & Required<Pick<U, P>>
  ): Promise<boolean> {
    const oldValue = await this.get(key)

    if (!oldValue) {
      return false
    }

    if (Array.isArray(oldValue)) {
      const idx = oldValue.findIndex((old) => {
        return fixedPropKeys.every((key) => {
          return equal((old as U)[key], value[key])
        })
      })

      if (idx !== -1) {
        const newValue = deepmerge(oldValue[idx], value)

        if (!equal(oldValue[idx], newValue)) {
          oldValue[idx] = newValue

          await this.set(key, oldValue)

          return true
        }
      }
    } else {
      const newValue = deepmerge(oldValue, value)

      if (!equal(oldValue, newValue)) {
        await this.set(key, newValue)

        return true
      }
    }

    return false
  }

  async remove<K extends NCOStateItemKey, V extends NCOStateItem<K>>(
    key: K,
    target?: V extends unknown[] ? Partial<V[number]> : never
  ) {
    if (target) {
      const oldValue = await this.get(key)

      if (Array.isArray(oldValue)) {
        const entries = Object.entries(target)

        const newValue = oldValue.filter((old) => {
          return !entries.every(([k, v]) => {
            return equal(old[k as keyof typeof old], v)
          })
        })

        if (oldValue.length !== newValue.length) {
          return this.set(key, newValue as V)
        }
      }
    } else {
      return storage.remove(`state:${this.id}:${key}`)
    }
  }

  async clear() {
    await Promise.all([
      this.remove('status'),
      this.remove('vod'),
      this.remove('info'),
      this.remove('offset'),
      this.remove('slots'),
      this.remove('slotDetails'),
    ])
  }

  onChange<K extends NCOStateItemKey>(
    key: K,
    callback: StorageOnChangeCallback<`state:${number}:${K}`>
  ) {
    return storage.onChange(`state:${this.id}:${key}`, callback)
  }
}
