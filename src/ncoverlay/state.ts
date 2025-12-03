import type { DeepPartial } from 'utility-types'
import type {
  V1Thread,
  V1Comment,
} from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { VodKey } from '@/types/constants'
import type { StorageOnChangeCallback } from '@/utils/storage'
import type { NCOSearcherAutoLoadArgs } from './searcher'

import equal from 'fast-deep-equal'

import { logger } from '@/utils/logger'
import { storage } from '@/utils/storage/extension'
import { settings } from '@/utils/settings/extension'
import { deepmerge } from '@/utils/deepmerge'
import { getNgSettings } from '@/utils/api/niconico/getNgSettings'
import { isNgComment } from '@/utils/api/niconico/applyNgSetting'
import { findAssistedCommentIds } from '@/utils/api/niconico/findAssistedCommentIds'

export interface NCOStateItems {
  [key: `state:${string}:status`]: StateStatus | null
  [key: `state:${string}:vod`]: StateVod | null
  [key: `state:${string}:info`]: StateInfo | null
  [key: `state:${string}:offset`]: StateOffset | null
  [key: `state:${string}:slots`]: StateSlot[] | null
  [key: `state:${string}:slotDetails`]: StateSlotDetail[] | null
}

export type NCOStateItemKey =
  keyof NCOStateItems extends `state:${string}:${infer K}` ? K : never

export type NCOStateArrayItemKey = {
  [K in keyof NCOStateItems]: NCOStateItems[K] extends unknown[] | null
    ? K
    : never
}[keyof NCOStateItems] extends `state:${string}:${infer K}`
  ? K
  : never

export type NCOStateItem<T extends NCOStateItemKey> =
  NCOStateItems[`state:${string}:${T}`]

export type StateStatus =
  | 'pending'
  | 'searching'
  | 'loading'
  | 'ready'
  | 'error'

export type StateVod = VodKey

export type StateInfo = Partial<NCOSearcherAutoLoadArgs>

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
  markers?: (number | null)[]
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
  const ngSettings = await getNgSettings()
  const hideAssistedComments = await settings.get(
    'settings:comment:hideAssistedComments'
  )

  let cmtCnt = 0
  let assistedCmtCnt = 0

  for (const detail of details) {
    if (detail.hidden || detail.status !== 'ready') {
      continue
    }

    const slot = slots.find((slot) => slot.id === detail.id)

    if (!slot) continue

    for (const thread of slot.threads) {
      const key = `${thread.fork}:${thread.id}`

      if (threadMap.has(key)) continue

      // コメントアシストと予想されるコメント
      const assistedCommentIds =
        hideAssistedComments &&
        detail.type !== 'jikkyo' &&
        detail.type !== 'nicolog' &&
        detail.type !== 'file'
          ? findAssistedCommentIds(thread.comments)
          : null

      cmtCnt += thread.comments.length
      assistedCmtCnt += assistedCommentIds?.length ?? 0

      const comments = thread.comments
        .filter((cmt) => {
          const isNg = isNgComment(cmt, ngSettings)
          const isAssisted = assistedCommentIds?.includes(cmt.id)

          return !(isNg || isAssisted)
        })
        .map<NcoV1Comment>((cmt) => {
          // オフセット
          const vposMs = cmt.vposMs + (detail.offsetMs ?? 0)

          // 半透明
          const commands = detail.translucent
            ? [...new Set([...cmt.commands, 'nico:opacity:0.5'])]
            : cmt.commands

          return {
            ...cmt,
            vposMs,
            commands,
            _nco: {
              slotType: detail.type,
            },
          }
        })

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
  readonly ncoId: string

  constructor(ncoId: string) {
    this.ncoId = ncoId
  }

  dispose() {
    this.clear()
  }

  async get<K extends NCOStateItemKey, V extends NCOStateItem<K>>(
    key: K,
    target?: V extends unknown[] ? Partial<V[number]> : never
  ): Promise<NCOStateItem<K> | null> {
    const value = await storage.get(`state:${this.ncoId}:${key}`)

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
    return storage.set(`state:${this.ncoId}:${key}`, value as any)
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
      return storage.remove(`state:${this.ncoId}:${key}`)
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
    callback: StorageOnChangeCallback<`state:${string}:${K}`>
  ) {
    return storage.onChange(`state:${this.ncoId}:${key}`, callback)
  }
}
