import type { DeepPartial } from 'utility-types'
import type { V1Thread } from '@xpadev-net/niconicomments'
import type { VodKey } from '@/types/constants'

import equal from 'fast-deep-equal'

import { Logger } from '@/utils/logger'
import { uid } from '@/utils/uid'
import { storage } from '@/utils/storage/extension'
import { deepmerge } from '@/utils/deepmerge'

export type NCOStateJson = {
  _id: string
  status: Status | null
  vod: VodKey | null
  title: string | null
  offset: number
  slots: Slot[] | null
}

export type NCOStateEventMap = {
  change: (this: NCOState, type: keyof NCOStateJson) => void
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

  getJSON(): NCOStateJson {
    return {
      _id: this.id,
      status: this.status.get(),
      vod: this.vod.get(),
      title: this.title.get(),
      offset: this.offset.get(),
      slots: this.slots.getAll(),
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

    get: (id: string) => {
      return this.#slots.get(id) ?? null
    },

    getAll: () => {
      return this.#slots.size ? [...this.#slots.values()] : null
    },

    getThreads: () => {
      const threadMap = new Map<string, V1Thread>()

      this.slots.getAll()?.forEach((slot) => {
        if (slot.hidden || slot.status !== 'ready') {
          return
        }

        slot.threads.forEach((thread) => {
          const comments = thread.comments.map((cmt) => ({
            ...cmt,
            vposMs: cmt.vposMs + this.#offset + (slot.offset ?? 0),
            commands: slot.translucent
              ? [...cmt.commands, '_live']
              : cmt.commands,
          }))

          threadMap.set(`${thread.id}${thread.fork}`, { ...thread, comments })
        })
      })

      const threads = [...threadMap.values()]

      return threads.length ? threads : null
    },

    set: (slots: Slot[]): boolean => {
      const old = this.slots.getAll()

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
      const old = this.slots.getAll()

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
