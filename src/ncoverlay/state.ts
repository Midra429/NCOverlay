import type { DeepPartial } from 'utility-types'
import type { V1Thread } from '@xpadev-net/niconicomments'
import type { VodKey } from '@/types/constants'

import equal from 'fast-deep-equal'

import { Logger } from '@/utils/logger'
import { uid } from '@/utils/uid'
import { storage } from '@/utils/storage/extension'
import { deepmerge } from '@/utils/deepmerge'
import { getNgSetting } from '@/utils/extension/getNgSetting'
import { isNgComment } from '@/utils/extension/applyNgSetting'

export type NCOStateJson = {
  _id: string
  status: Status | null
  vod: VodKey | null
  title: string | null
  offset: number
  slots: Slot[] | null
}

export type NCOStateEventMap = {
  change: (this: NCOState, type: keyof Omit<NCOStateJson, '_id'>) => void
}

export type Status = 'pending' | 'searching' | 'loading' | 'ready' | 'error'

export type SlotBase = {
  /**
   * 動画ID or `${jkChId}:${starttime}-${endtime}`
   */
  id: string
  status: Status
  threads: V1Thread[]
  markers?: (number | null)[]
  offset?: number
  translucent?: boolean
  hidden?: boolean
}

export type SlotDefault = SlotBase & {
  type: 'normal' | 'danime' | 'chapter' | 'szbh'

  info: {
    id: string
    title: string
    duration: number
    date: number
    count: {
      view: number
      comment: number
    }
    thumbnail?: string
  }
}

export type SlotJikkyo = SlotBase & {
  type: 'jikkyo'

  info: {
    id: string
    title: string
    duration: number
    date: [start: number, end: number]
    count: {
      comment: number
    }
  }
}

export type Slot = SlotDefault | SlotJikkyo

export type SlotUpdate = { id: string } & DeepPartial<Slot>

export const filterDisplayThreads = async (
  slots: Slot[],
  offset: number = 0
): Promise<V1Thread[] | null> => {
  if (!slots.length) {
    return null
  }

  const threadMap = new Map<string, V1Thread>()
  const ngSetting = await getNgSetting()

  slots.forEach((slot) => {
    if (slot.hidden || slot.status !== 'ready') {
      return
    }

    slot.threads.forEach((thread) => {
      const key = `${thread.id}${thread.fork}`

      if (threadMap.has(key)) {
        return
      }

      const comments = thread.comments.flatMap((cmt) => {
        // NG
        if (isNgComment(cmt, ngSetting)) {
          return []
        }

        // オフセット
        const vposMs = cmt.vposMs + offset + (slot.offset ?? 0)

        if (vposMs < 0) {
          return []
        }

        // 半透明
        const commands = slot.translucent
          ? [...new Set([...cmt.commands, '_live'])]
          : cmt.commands

        return { ...cmt, vposMs, commands }
      })

      const commentCount = comments.length

      if (thread.commentCount) {
        threadMap.set(key, { ...thread, comments, commentCount })
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
  readonly id: string
  readonly key: `tmp:state:${string}`
  readonly sync: boolean

  #status: Status | null = null
  #vod: VodKey | null = null
  #title: string | null = null
  #offset: number = 0
  #slots: Map<string, Slot> = new Map()

  #tmpSyncOff?: boolean
  #onChangeRemoveListener?: () => void

  /**
   * @param id NCOverlayのID
   * @param sync 同IDの別インスタンスと同期する (デフォルト: true)
   */
  constructor(id: string, sync: boolean = true) {
    this.id = `${Date.now()}.${uid()}`
    this.key = `tmp:state:${id}`
    this.sync = sync

    if (this.sync) {
      this.#onChangeRemoveListener = storage.loadAndWatch(this.key, (json) => {
        if (json?._id !== this.id) {
          this.#tmpSyncOff = true

          this.setJSON(json ?? null)

          this.#tmpSyncOff = false
        }
      })
    }
  }

  dispose() {
    this.clear()

    this.#onChangeRemoveListener?.()

    storage.remove(this.key)
  }

  clear() {
    this.status.clear()
    this.vod.clear()
    this.title.clear()
    this.offset.clear()
    this.slots.clear()
  }

  getJSON<
    Keys extends (keyof Omit<NCOStateJson, '_id'>)[],
    Result = Keys['length'] extends 0
      ? NCOStateJson
      : { [key in Keys[number]]: NCOStateJson[key] },
  >(...keys: Keys): Result {
    switch (keys.length) {
      case 0:
        return {
          _id: this.id,
          status: this.status.get(),
          vod: this.vod.get(),
          title: this.title.get(),
          offset: this.offset.get(),
          slots: this.slots.get(),
        } satisfies NCOStateJson as Result

      default:
        return {
          _id: this.id,
          ...Object.fromEntries(keys.map((key) => [key, this[key].get()])),
        } satisfies Partial<NCOStateJson> as Result
    }
  }

  setJSON(json: NCOStateJson | null) {
    if (json?.status) {
      this.status.set(json.status)
    } else {
      this.status.clear()
    }

    if (json?.vod) {
      this.vod.set(json.vod)
    } else {
      this.vod.clear()
    }

    if (json?.title) {
      this.title.set(json.title)
    } else {
      this.title.clear()
    }

    if (json?.offset) {
      this.offset.set(json.offset)
    } else {
      this.offset.clear()
    }

    if (json?.slots) {
      this.slots.set(json.slots)
    } else {
      this.slots.clear()
    }
  }

  status = {
    get: () => this.#status,

    set: (status: Status | null): boolean => {
      if (this.#status !== status) {
        this.#status = status

        this.#trigger('change', 'status')

        return true
      }

      return false
    },

    clear: () => {
      return this.status.set(null)
    },
  }

  vod = {
    get: () => this.#vod,

    set: (vod: VodKey | null): boolean => {
      if (this.#vod !== vod) {
        this.#vod = vod

        this.#trigger('change', 'vod')

        return true
      }

      return false
    },

    clear: () => {
      return this.vod.set(null)
    },
  }

  title = {
    get: () => this.#title,

    set: (title: string | null): boolean => {
      if (this.#title !== title) {
        this.#title = title?.trim() || null

        this.#trigger('change', 'title')

        return true
      }

      return false
    },

    clear: () => {
      return this.title.set(null)
    },
  }

  offset = {
    get: () => this.#offset,

    set: (ms: number): boolean => {
      if (this.#offset !== ms) {
        this.#offset = ms

        this.#trigger('change', 'offset')

        return true
      }

      return false
    },

    clear: () => {
      return this.offset.set(0)
    },
  }

  slots = {
    size: () => {
      return this.#slots.size
    },

    get: <
      SlotIds extends string[],
      Result = (SlotIds['length'] extends 1 ? Slot : Slot[]) | null,
    >(
      ...ids: SlotIds
    ): Result => {
      switch (ids.length) {
        case 0:
          return (this.#slots.size ? [...this.#slots.values()] : null) as Result

        case 1:
          return (this.#slots.get(ids[0]) ?? null) as Result

        default:
          const slots = ids.flatMap((id) => this.#slots.get(id) ?? [])

          return (slots.length ? slots : null) as Result
      }
    },

    getThreads: () => {
      return filterDisplayThreads(this.slots.get() ?? [], this.#offset)
    },

    set: (slots: Slot[]): boolean => {
      const old = this.slots.get()

      if (!equal(old, slots)) {
        this.#slots.clear()

        slots.forEach((slot) => {
          this.#slots.set(slot.id, slot)
        })

        this.#trigger('change', 'slots')

        return true
      }

      return false
    },

    add: (...slots: Slot[]): boolean => {
      const old = this.slots.get()

      if (!equal(old, slots)) {
        slots.forEach((slot) => {
          this.#slots.set(slot.id, slot)
        })

        this.#trigger('change', 'slots')

        return true
      }

      return false
    },

    update: (data: SlotUpdate): boolean => {
      const slot = this.#slots.get(data.id)

      if (slot) {
        const newSlot: Slot = deepmerge(slot, data)

        if (!equal(slot, newSlot)) {
          this.#slots.set(newSlot.id, newSlot)

          this.#trigger('change', 'slots')

          return true
        }
      }

      return false
    },

    remove: (...ids: string[]): boolean => {
      let changed = false

      ids.forEach((id) => {
        changed ||= this.#slots.delete(id)
      })

      if (changed) {
        this.#trigger('change', 'slots')

        return true
      }

      return false
    },

    clear: (): boolean => {
      if (this.#slots.size) {
        this.#slots.clear()

        this.#trigger('change', 'slots')

        return true
      }

      return false
    },
  }

  #listeners: {
    [type in keyof NCOStateEventMap]?: NCOStateEventMap[type][]
  } = {}

  #trigger<Type extends keyof NCOStateEventMap>(
    type: Type,
    ...args: Parameters<NCOStateEventMap[Type]>
  ) {
    if (this.sync && !this.#tmpSyncOff && type === 'change') {
      storage.set(this.key, this.getJSON())
    }

    this.#listeners[type]?.forEach((listener) => {
      try {
        listener.call(this, ...args)
      } catch (err) {
        Logger.error(type, err)
      }
    })
  }

  addEventListener<Type extends keyof NCOStateEventMap>(
    type: Type,
    callback: NCOStateEventMap[Type]
  ) {
    this.#listeners[type] ??= []
    this.#listeners[type]!.push(callback)
  }

  removeEventListener<Type extends keyof NCOStateEventMap>(
    type: Type,
    callback: NCOStateEventMap[Type]
  ) {
    this.#listeners[type] = this.#listeners[type]?.filter(
      (cb) => cb !== callback
    )
  }

  removeAllEventListeners() {
    for (const key in this.#listeners) {
      delete this.#listeners[key as keyof NCOStateEventMap]
    }
  }
}
