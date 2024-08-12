import type { NCOverlay } from '.'
import type { NCOState } from './state'

import hotkeys from 'hotkeys-js'

import { MARKERS } from '@/constants'

import { storage } from '@/utils/storage/extension'

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

    const kbdOnChange = () => {
      this.#registerEventListener()
    }

    this.#storageOnChangeRemoveListeners.push(
      storage.onChange('settings:kbd:increaseGlobalOffset', kbdOnChange),
      storage.onChange('settings:kbd:decreaseGlobalOffset', kbdOnChange),
      storage.onChange('settings:kbd:jumpMarkerToOP', kbdOnChange),
      storage.onChange('settings:kbd:jumpMarkerToA', kbdOnChange),
      storage.onChange('settings:kbd:jumpMarkerToB', kbdOnChange),
      storage.onChange('settings:kbd:jumpMarkerToC', kbdOnChange)
    )
  }

  dispose() {
    this.#unregisterEventListener()
  }

  /**
   * 全体のオフセットを増やす
   */
  async #increaseGlobalOffset(seconds: number = 1) {
    const offset = (await this.state.get('offset')) ?? 0

    await this.state.set('offset', offset + seconds)
  }

  /**
   * 全体のオフセットを減らす
   */
  async #decreaseGlobalOffset(seconds: number = 1) {
    const offset = (await this.state.get('offset')) ?? 0

    await this.state.set('offset', offset - seconds)
  }

  /**
   * オフセットを「オープニング」に飛ばす
   */
  async #jumpMarkerToOP() {
    const markerIdx = MARKERS.findIndex((v) => v.shortLabel === 'OP')

    await this.#jumpMarker(markerIdx)
  }

  /**
   * オフセットを「Aパート」に飛ばす
   */
  async #jumpMarkerToA() {
    const markerIdx = MARKERS.findIndex((v) => v.shortLabel === 'A')

    await this.#jumpMarker(markerIdx)
  }

  /**
   * オフセットを「Bパート」に飛ばす
   */
  async #jumpMarkerToB() {
    const markerIdx = MARKERS.findIndex((v) => v.shortLabel === 'B')

    await this.#jumpMarker(markerIdx)
  }

  /**
   * オフセットを「Cパート」に飛ばす
   */
  async #jumpMarkerToC() {
    const markerIdx = MARKERS.findIndex((v) => v.shortLabel === 'C')

    await this.#jumpMarker(markerIdx)
  }

  async #registerEventListener() {
    hotkeys.unbind()

    const [
      increaseGlobalOffset,
      decreaseGlobalOffset,
      jumpMarkerToOP,
      jumpMarkerToA,
      jumpMarkerToB,
      jumpMarkerToC,
    ] = await Promise.all([
      storage.get('settings:kbd:increaseGlobalOffset'),
      storage.get('settings:kbd:decreaseGlobalOffset'),
      storage.get('settings:kbd:jumpMarkerToOP'),
      storage.get('settings:kbd:jumpMarkerToA'),
      storage.get('settings:kbd:jumpMarkerToB'),
      storage.get('settings:kbd:jumpMarkerToC'),
    ])

    if (increaseGlobalOffset) {
      hotkeys(increaseGlobalOffset, (event) => {
        event.preventDefault()

        this.#increaseGlobalOffset()

        return false
      })
    }

    if (decreaseGlobalOffset) {
      hotkeys(decreaseGlobalOffset, (event) => {
        event.preventDefault()

        this.#decreaseGlobalOffset()

        return false
      })
    }

    if (jumpMarkerToOP) {
      hotkeys(jumpMarkerToOP, (event) => {
        event.preventDefault()

        this.#jumpMarkerToOP()

        return false
      })
    }

    if (jumpMarkerToA) {
      hotkeys(jumpMarkerToA, (event) => {
        event.preventDefault()

        this.#jumpMarkerToA()

        return false
      })
    }

    if (jumpMarkerToB) {
      hotkeys(jumpMarkerToB, (event) => {
        event.preventDefault()

        this.#jumpMarkerToB()

        return false
      })
    }

    if (jumpMarkerToC) {
      hotkeys(jumpMarkerToC, (event) => {
        event.preventDefault()

        this.#jumpMarkerToC()

        return false
      })
    }
  }

  #unregisterEventListener() {
    while (this.#storageOnChangeRemoveListeners.length) {
      this.#storageOnChangeRemoveListeners.pop()?.()
    }

    hotkeys.unbind()
  }
}
