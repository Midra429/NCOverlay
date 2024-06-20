import type { DeepPartial } from 'utility-types'
import type { V1Thread } from '@xpadev-net/niconicomments'

import equal from 'fast-deep-equal'

import { uid } from '@/utils/uid'
import { storage } from '@/utils/storage/extension'
import { deepmerge } from '@/utils/deepmerge'

export type NCOStateJson = {
  _id: string
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
    this.slots.clear()
  }

  getJSON(): NCOStateJson {
    return {
      _id: this.id,
      slots: this.slots.getAll(),
    }
  }

  setJSON(json: NCOStateJson | null) {
    if (json?.slots) {
      this.slots.set(json.slots)
    } else {
      this.slots.clear()
    }
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
            vposMs: cmt.vposMs + (slot.offset ?? 0),
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

    set: (slots: Slot[]) => {
      const old = this.slots.getAll()

      this.#slots.clear()

      for (const slot of slots) {
        this.#slots.set(slot.id, slot)
      }

      if (!equal(slots, old)) {
        this.#trigger('change', 'slots')
      }
    },

    add: (...slots: Slot[]) => {
      const old = this.slots.getAll()

      for (const slot of slots) {
        this.#slots.set(slot.id, slot)
      }

      if (!equal(slots, old)) {
        this.#trigger('change', 'slots')
      }
    },

    update: (data: SlotUpdate) => {
      const slot = this.#slots.get(data.id)

      if (!slot) return

      const newSlot: Slot = deepmerge(slot, data)

      if (!equal(newSlot, slot)) {
        this.#slots.set(newSlot.id, newSlot)

        this.#trigger('change', 'slots')
      }
    },

    remove: (...ids: string[]) => {
      let changed = false

      for (const id of ids) {
        changed ||= this.#slots.delete(id)
      }

      if (changed) {
        this.#trigger('change', 'slots')
      }
    },

    clear: () => {
      if (this.#slots.size) {
        this.#slots.clear()

        this.#trigger('change', 'slots')
      }
    },

    show: (id: string) => {
      const slot = this.#slots.get(id)

      if (!slot) return

      if (slot.hidden) {
        slot.hidden = false

        this.#trigger('change', 'slots')
      }
    },

    hide: (id: string) => {
      const slot = this.#slots.get(id)

      if (!slot) return

      if (!slot.hidden) {
        slot.hidden = true

        this.#trigger('change', 'slots')
      }
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
