import type { DeepPartial } from 'utility-types'
import type { V1Thread } from '@xpadev-net/niconicomments'

import equal from 'fast-deep-equal'

import { uid } from '@/utils/uid'
import { storage } from '@/utils/storage/extension'
import { deepmerge } from '@/utils/deepmerge'

export type NCOStateJson = {
  _id: string
  offset: number
  slots: Slot[] | null
}

export type NCOStateEventMap = {
  change: (type: keyof NCOStateJson) => void
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

  #offset: number
  #slots: Map<string, Slot>

  #tmpSyncOff?: boolean

  /**
   * @param id NCOverlayのID
   * @param sync 同IDの別インスタンスと同期する (デフォルト: true)
   */
  constructor(id: string, sync: boolean = true) {
    this.id = `${Date.now()}.${uid()}`
    this.key = `tmp:state:${id}`
    this.sync = sync

    this.#offset = 0
    this.#slots = new Map()

    if (this.sync) {
      storage.loadAndWatch(this.key, (json) => {
        if (json?._id !== this.id) {
          this.#tmpSyncOff = true

          this.setJSON(json ?? null)

          this.#tmpSyncOff = false
        }
      })
    }
  }

  clear() {
    this.offset.clear()
    this.slots.clear()
  }

  getJSON(): NCOStateJson {
    return {
      _id: this.id,
      offset: this.offset.get(),
      slots: this.slots.getAll(),
    }
  }

  setJSON(json: NCOStateJson | null) {
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
    get: (id: string) => {
      return this.#slots.get(id) ?? null
    },

    getAll: () => {
      const slots = [...this.#slots.values()]

      return slots.length ? slots : null
    },

    getThreads: () => {
      const threadMap = new Map<string, V1Thread>()

      const slots = this.slots.getAll() ?? []

      for (const slot of slots) {
        if (slot.hidden || slot.status !== 'ready') {
          continue
        }

        for (const thread of slot.threads) {
          const comments = thread.comments.map((cmt) => ({
            ...cmt,
            vposMs: cmt.vposMs + this.#offset + (slot.offset ?? 0),
            commands: slot.translucent
              ? [...new Set([...cmt.commands, '_live'])]
              : cmt.commands,
          }))

          threadMap.set(`${thread.id}${thread.fork}`, { ...thread, comments })
        }
      }

      const threads = [...threadMap.values()]

      return threads.length ? threads : null
    },

    set: (slots: Slot[]): boolean => {
      const old = this.slots.getAll()

      if (!equal(old, slots)) {
        this.#slots.clear()

        for (const slot of slots) {
          this.#slots.set(slot.id, slot)
        }

        this.#trigger('change', 'slots')

        return true
      }

      return false
    },

    add: (...slots: Slot[]): boolean => {
      const old = this.slots.getAll()

      if (!equal(old, slots)) {
        for (const slot of slots) {
          this.#slots.set(slot.id, slot)
        }

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

      for (const id of ids) {
        changed ||= this.#slots.delete(id)
      }

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
      // @ts-ignore
      listener.call(this, ...args)
    })
  }

  addEventListener<Type extends keyof NCOStateEventMap>(
    type: Type,
    callback: NCOStateEventMap[Type]
  ) {
    this.#listeners[type] ??= []
    this.#listeners[type]!.push(callback)
  }

  removeAllEventListeners() {
    for (const key in this.#listeners) {
      delete this.#listeners[key as keyof NCOStateEventMap]
    }
  }
}
