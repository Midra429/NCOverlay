import type { KeyHandler } from 'hotkeys-js'
import type { StorageKey } from '@/types/storage'
import type { NCOverlay } from '.'
import type { NCOState } from './state'

import hotkeys from 'hotkeys-js'

import { storage } from '@/utils/storage/extension'

type NCOKeyboardFunctions = Readonly<{
  jumpMarker: NCOverlay['jumpMarker']
}>

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
  readonly #state: NCOState
  readonly #functions: NCOKeyboardFunctions

  readonly #storageOnChangeRemoveListeners: (() => void)[] = []

  constructor(state: NCOState, functions: NCOKeyboardFunctions) {
    this.#state = state
    this.#functions = functions

    this.#registerEventListener()
  }

  dispose() {
    this.#unregisterEventListener()
  }

  async getOffset() {
    return (await this.#state.get('offset')) ?? 0
  }

  async setOffset(offset: number | null) {
    return this.#state.set('offset', offset)
  }

  async #registerEventListener() {
    this.#storageOnChangeRemoveListeners.push(
      register('settings:kbd:increaseGlobalOffset', async () => {
        this.setOffset((await this.getOffset()) + 1)
      }),

      register('settings:kbd:decreaseGlobalOffset', async () => {
        this.setOffset((await this.getOffset()) - 1)
      }),

      register('settings:kbd:resetGlobalOffset', async () => {
        this.setOffset(null)
      }),

      register('settings:kbd:jumpMarkerToOP', () => {
        this.#functions.jumpMarker('OP')
      }),

      register('settings:kbd:jumpMarkerToA', () => {
        this.#functions.jumpMarker('A')
      }),

      register('settings:kbd:jumpMarkerToB', () => {
        this.#functions.jumpMarker('B')
      }),

      register('settings:kbd:jumpMarkerToC', () => {
        this.#functions.jumpMarker('C')
      }),

      register('settings:kbd:resetMarker', () => {
        this.#functions.jumpMarker(null)
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
