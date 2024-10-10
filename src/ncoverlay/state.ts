import type { DeepPartial, UnionToIntersection } from 'utility-types'
import type { V1Thread } from '@xpadev-net/niconicomments'
import type { BuildSearchQueryInput } from '@midra/nco-api/search/lib/buildSearchQuery'
import type { VodKey } from '@/types/constants'
import type { StorageOnChangeCallback } from '@/utils/storage'
import type { PlayingInfo } from '@/ncoverlay/patcher'

import equal from 'fast-deep-equal'

import { storage } from '@/utils/storage/extension'
import { deepmerge } from '@/utils/deepmerge'
import { getNgSettings } from '@/utils/extension/getNgSettings'
import { isNgComment } from '@/utils/api/applyNgSetting'

export type NCOStateItems = {
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
  [key in keyof NCOStateItems]: NCOStateItems[key] extends unknown[] | null
    ? key
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

export type StateInfo = Partial<
  UnionToIntersection<PlayingInfo> & BuildSearchQueryInput
>

export type StateOffset = number

export type StateSlot = {
  /**
   * 動画ID or `${jkChId}:${starttime}-${endtime}`
   */
  id: string
  threads: V1Thread[]
  isAutoLoaded?: boolean
}

export type StateSlotDetailBase = {
  /**
   * 動画ID or `${jkChId}:${starttime}-${endtime}`
   */
  id: string
  status: StateStatus
  markers?: (number | null)[]
  offsetMs?: number
  translucent?: boolean
  hidden?: boolean
  isAutoLoaded?: boolean
}

export type StateSlotDetailDefault = StateSlotDetailBase & {
  type: 'normal' | 'official' | 'danime' | 'chapter' | 'szbh'
  info: {
    id: string
    channelId?: number
    title: string
    duration: number
    date: number
    tags: string[]
    count: {
      view: number
      comment: number
    }
    thumbnail?: string
  }
}

export type StateSlotDetailJikkyo = StateSlotDetailBase & {
  type: 'jikkyo'
  info: {
    id: string | null
    title: string
    duration: number
    date: [start: number, end: number]
    count: {
      comment: number
    }
  }
}

export type StateSlotDetail = StateSlotDetailDefault | StateSlotDetailJikkyo

export type StateSlotDetailUpdate = DeepPartial<StateSlotDetail> &
  Required<Pick<StateSlotDetail, 'id'>>

export type V1ThreadWithType = Pick<StateSlotDetail, 'type'> & V1Thread

export type V1ThreadCommentWithType = Pick<StateSlotDetail, 'type'> &
  V1Thread['comments'][number]

export const filterDisplayThreads = async (
  slots: StateSlot[] | null,
  details: StateSlotDetail[] | null
): Promise<V1ThreadWithType[] | null> => {
  if (!slots?.length || !details?.length) {
    return null
  }

  const threadMap = new Map<string, V1ThreadWithType>()
  const ngSettings = await getNgSettings()

  details.forEach((detail) => {
    if (detail.hidden || detail.status !== 'ready') {
      return
    }

    const slot = slots.find((slot) => slot.id === detail.id)

    if (!slot) return

    slot.threads.forEach((thread) => {
      const key = `${thread.fork}:${thread.id}`

      if (threadMap.has(key)) return

      const comments = thread.comments
        .filter((cmt) => !isNgComment(cmt, ngSettings))
        .map((cmt) => {
          // オフセット
          const vposMs = cmt.vposMs + (detail.offsetMs ?? 0)

          // 半透明
          const commands = detail.translucent
            ? [...new Set([...cmt.commands, '_live'])]
            : cmt.commands

          return { ...cmt, vposMs, commands }
        })

      const commentCount = comments.length

      if (thread.commentCount) {
        threadMap.set(key, {
          ...thread,
          type: detail.type,
          comments,
          commentCount,
        })
      }
    })
  })

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

  get<Key extends NCOStateItemKey>(
    key: Key
  ): Promise<NCOStateItem<Key> | null> {
    return storage.get(`state:${this.ncoId}:${key}`)
  }

  async getThreads() {
    return filterDisplayThreads(
      await this.get('slots'),
      await this.get('slotDetails')
    )
  }

  set<Key extends NCOStateItemKey>(key: Key, value: NCOStateItem<Key>) {
    return storage.set(`state:${this.ncoId}:${key}`, value as any)
  }

  async add<Key extends NCOStateArrayItemKey>(
    key: Key,
    ...values: NonNullable<NCOStateItem<Key>>
  ) {
    const oldValue = await this.get<Key>(key)

    const exists = values.some((val) => {
      return oldValue?.some((old) => old.id === val.id)
    })

    if (!exists) {
      const value = (
        oldValue ? [...oldValue, ...values] : values
      ) as NCOStateItem<Key>

      return this.set(key, value)
    }
  }

  async update<
    Key extends NCOStateArrayItemKey,
    Value extends NonNullable<NCOStateItem<Key>>,
    UpdateValue extends Value extends Array<any> ? Value[number] : Value,
    UpdateFixedProps extends (keyof UpdateValue)[],
  >(
    key: Key,
    fixedProps: UpdateFixedProps,
    value: DeepPartial<UpdateValue> &
      Required<Pick<UpdateValue, UpdateFixedProps[number]>>
  ): Promise<boolean> {
    const oldValue = await this.get(key)

    if (!oldValue) {
      return false
    }

    if (Array.isArray(oldValue)) {
      const idx = oldValue.findIndex((old) => {
        return fixedProps.every((k) =>
          equal(old[k as keyof typeof old], value[k])
        )
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

  async remove<
    Key extends NCOStateItemKey,
    Value extends NCOStateItem<Key>,
    Target extends Value extends Array<any> ? Partial<Value[number]> : never,
  >(key: Key, target?: Target) {
    if (target) {
      const oldValue = await this.get(key)

      if (Array.isArray(oldValue)) {
        const entries = Object.entries(target)

        const newValue = oldValue.filter((old) => {
          return !entries.every(([key, val]) => {
            return equal(old[key as keyof typeof old], val)
          })
        })

        if (oldValue.length !== newValue.length) {
          return this.set(key, newValue as Value)
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

  onChange<Key extends NCOStateItemKey>(
    key: Key,
    callback: StorageOnChangeCallback<`state:${string}:${Key}`>
  ) {
    return storage.onChange(`state:${this.ncoId}:${key}`, callback)
  }
}
