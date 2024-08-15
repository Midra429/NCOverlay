import type { KeyHandler } from 'hotkeys-js'
import type { StorageKey } from '@/types/storage'
import type { NCOverlay } from '.'
import type { NCOState } from './state'

import hotkeys from 'hotkeys-js'

import { storage } from '@/utils/storage/extension'

const register = (
  key: Extract<StorageKey, `settings:kbd:${string}`>,
  method: (...args: Parameters<KeyHandler>) => void
) => {
  let tmpShortcutKey: string | null = null

  return storage.loadAndWatch(key, (shortcutKey) => {
    if (tmpShortcutKey) {
      hotkeys.unbind(tmpShortcutKey)
    }

    tmpShortcutKey = shortcutKey

    if (shortcutKey) {
      hotkeys(shortcutKey, (event, handler) => {
        event.preventDefault()

        method(event, handler)

        return false
      })
    }
  })
}

export class NCOKeyboard {
  readonly state: NCOState

  readonly #jumpMarker: NCOverlay['jumpMarker']

  readonly #storageOnChangeRemoveListeners: (() => void)[] = []

  constructor(
    state: NCOState,
    functions: {
      jumpMarker: NCOverlay['jumpMarker']
    }
  ) {
    this.state = state
    this.#jumpMarker = functions.jumpMarker

    this.#registerEventListener()
  }

  dispose() {
    this.#unregisterEventListener()
  }

  async getOffset() {
    return (await this.state.get('offset')) ?? 0
  }

  async setOffset(offset: number) {
    return this.state.set('offset', offset)
  }

  async #registerEventListener() {
    this.#storageOnChangeRemoveListeners.push(
      register('settings:kbd:increaseGlobalOffset', async () => {
        this.setOffset((await this.getOffset()) + 1)
      }),

      register('settings:kbd:decreaseGlobalOffset', async () => {
        this.setOffset((await this.getOffset()) - 1)
      }),

      register('settings:kbd:resetMarker', () => {
        this.#jumpMarker(null)
      }),

      register('settings:kbd:jumpMarkerToOP', () => {
        this.#jumpMarker('OP')
      }),

      register('settings:kbd:jumpMarkerToA', () => {
        this.#jumpMarker('A')
      }),

      register('settings:kbd:jumpMarkerToB', () => {
        this.#jumpMarker('B')
      }),

      register('settings:kbd:jumpMarkerToC', () => {
        this.#jumpMarker('C')
      })
    )
  }

  #unregisterEventListener() {
    while (this.#storageOnChangeRemoveListeners.length) {
      this.#storageOnChangeRemoveListeners.pop()?.()
    }

    hotkeys.unbind()
  }
}
