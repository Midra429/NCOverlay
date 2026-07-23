import type { KeyHandler } from 'hotkeys-js'
import type { SettingsKey } from '@/types/storage'
import type { NCOverlay } from '.'
import type { NCOState } from './state'

import hotkeys from 'hotkeys-js'

import { settings } from '@/utils/settings/extension'
import { storage } from '@/utils/storage/extension'

interface NCOKeyboardFunctions {
  readonly jumpMarker: NCOverlay['jumpMarker']
}

function register(
  key: Extract<SettingsKey, `kbd:${string}`> extends `kbd:${infer K}`
    ? K
    : never,
  method: (...args: Parameters<KeyHandler>) => void
) {
  let tmpShortcutKey: string | null = null

  return settings.watch(`kbd:${key}`, (shortcutKey) => {
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
      register('toggleDisplayComment', async () => {
        const opacity = await settings.get('comment:opacity')

        // 非表示
        if (opacity) {
          await storage.set('tmp:comment:opacity', opacity)
          await settings.set('comment:opacity', 0)
        }
        // 表示
        else {
          const tmpOpacity = await storage.get('tmp:comment:opacity')

          await settings.set('comment:opacity', tmpOpacity || 100)
        }
      }),

      register('increaseGlobalOffset', async () => {
        this.setOffset((await this.getOffset()) + 1)
      }),

      register('decreaseGlobalOffset', async () => {
        this.setOffset((await this.getOffset()) - 1)
      }),

      register('resetGlobalOffset', async () => {
        this.setOffset(null)
      }),

      register('jumpMarkerToStart', () => {
        this.#functions.jumpMarker('start')
      }),

      register('jumpMarkerToOP', () => {
        this.#functions.jumpMarker('op')
      }),

      register('jumpMarkerToA', () => {
        this.#functions.jumpMarker('aPart')
      }),

      register('jumpMarkerToB', () => {
        this.#functions.jumpMarker('bPart')
      }),

      register('jumpMarkerToED', () => {
        this.#functions.jumpMarker('ed')
      }),

      register('jumpMarkerToC', () => {
        this.#functions.jumpMarker('cPart')
      }),

      register('resetMarker', () => {
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
