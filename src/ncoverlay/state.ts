import type {
  V1Comment,
  V1Thread,
} from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { DeepPartial } from 'utility-types'
import type { VodKey } from '@/types/constants'
import type { StorageOnChangeCallback } from '@/utils/storage'
import type { NCOSearcherAutoSearchArgs } from './searcher'

import equal from 'fast-deep-equal'

import { deepmerge } from '@/utils/deepmerge'
import { logger } from '@/utils/logger'
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

export type StateInfo = Partial<NCOSearcherAutoSearchArgs>

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
  markers: (number | null)[]
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
  _nco: {
    slotType: StateSlotDetail['type']
  }
}

export interface NcoV1Thread extends Omit<V1Thread, 'comments'> {
  comments: NcoV1Comment[]
  _nco: {}
}

export async function filterDisplayThreads(
  slots: StateSlot[] | null,
  details: StateSlotDetail[] | null
): Promise<NcoV1Thread[] | null> {
  if (!slots?.length || !details?.length) {
    return null
  }

  const threadMap = new Map<string, NcoV1Thread>()

  const [ngSettings, hideAssistedComments] = await Promise.all([
    getNgSettings(),
    settings.get('settings:comment:hideAssistedComments'),
  ])

  let cmtCnt = 0
  let assistedCmtCnt = 0

  for (const { id, status, offsetMs, translucent, hidden, type } of details) {
    if (hidden || status !== 'ready') {
      continue
    }

    const slot = slots.find((slot) => slot.id === id)

    if (!slot) continue

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
        const isNg = isNgComment(cmt, ngSettings)
        const isAssisted = assistedCommentIds?.includes(cmt.id)

        if (isNg || isAssisted) continue

        // オフセット
        const vposMs = cmt.vposMs + (offsetMs ?? 0)

        // 半透明
        const commands = translucent
          ? [...new Set([...cmt.commands, 'nico:opacity:0.5'])]
          : cmt.commands

        comments.push({
          ...cmt,
          vposMs,
          commands,
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
    return filterDisplayThreads(
      ...(await Promise.all([this.get('slots'), this.get('slotDetails')]))
    )
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
