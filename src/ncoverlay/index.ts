import type { Runtime } from 'wxt/browser'
import type { setBadge } from '@/utils/extension/setBadge'
import type { SlotUpdate } from './state'

import { Logger } from '@/utils/logger'
import { uid } from '@/utils/uid'
import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'
import { sendUtilsMessage } from '@/utils/extension/messaging'

import { NCOState } from './state'
import { NCOSearcher } from './searcher'
import { NCORenderer } from './renderer'
import { ncoMessenger } from './messaging'

import './style.css'

export type NCOverlayEventMap = {
  playing: (this: NCOverlay, evt: Event) => void
  pause: (this: NCOverlay, evt: Event) => void
  seeked: (this: NCOverlay, evt: Event) => void
  timeupdate: (this: NCOverlay, evt: Event) => void
  loadedmetadata: (this: NCOverlay, evt: Event) => void
}

/**
 * NCOverlay
 */
export class NCOverlay {
  readonly id: string
  readonly state: NCOState
  readonly searcher: NCOSearcher
  readonly renderer: NCORenderer

  #storageOnChangeRemoveListeners: (() => void)[] = []
  #port: Runtime.Port

  constructor(video: HTMLVideoElement) {
    this.id = `${Date.now()}.${uid()}`
    this.state = new NCOState(this.id)
    this.searcher = new NCOSearcher(this.state)
    this.renderer = new NCORenderer(video)

    this.#port = webext.runtime.connect({ name: 'instance' })
    this.#port.onMessage.addListener((message) => {
      if (message === 'ping') {
        this.#port.postMessage(`pong:${this.id}`)
      }
    })

    this.#registerEventListener()

    this.#setBadge(null)

    // 既にメタデータ読み込み済みの場合
    if (HTMLMediaElement.HAVE_METADATA <= this.renderer.video.readyState) {
      setTimeout(() => {
        this.#trigger('loadedmetadata', new Event('loadedmetadata'))
      }, 100)
    }
  }

  dispose() {
    Logger.log('NCOverlay.dispose()')

    this.state.dispose()
    this.renderer.dispose()

    this.#port.disconnect()

    this.#unregisterEventListener()
    this.removeAllEventListeners()

    this.#setBadge(null)
  }

  clear() {
    this.state.clear()
    this.renderer.clear()
  }

  updateSlot(data: SlotUpdate): boolean {
    const changed = this.state.slots.update(data)

    if (changed) {
      this.updateRendererThreads()
    }

    return changed
  }

  /**
   * 全体のオフセットをセット
   */
  setGlobalOffset(offset: number | null): boolean {
    const changed = offset
      ? this.state.offset.set(offset)
      : this.state.offset.clear()

    if (changed) {
      this.renderer.setOffset(this.state.offset.get())
    }

    return changed
  }

  /**
   * 指定したマーカーの位置にジャンプ
   */
  jumpMarker(markerIdx: number | null) {
    const slots = this.state.slots.get()

    if (!slots) return

    if (markerIdx === null) {
      slots.forEach((slot) => {
        this.state.slots.update({
          id: slot.id,
          offsetMs: 0,
        })
      })
    } else {
      const currentTimeMs = this.renderer.video.currentTime * 1000

      slots.forEach((slot) => {
        const marker = slot.markers?.[markerIdx]

        if (marker) {
          this.state.slots.update({
            id: slot.id,
            offsetMs: marker * -1 + currentTimeMs,
          })
        }
      })

      this.state.offset.clear()
    }

    this.updateRendererThreads()
  }

  /**
   * 描画するコメントデータを更新する
   */
  async updateRendererThreads() {
    const threads = await this.state.slots.getThreads()

    this.renderer.setThreads(threads)
    this.renderer.reload()
  }

  /**
   * バッジを設定
   */
  #setBadge(
    text: string | null,
    color?: Parameters<typeof setBadge>[0]['color']
  ) {
    return sendUtilsMessage('setBadge', { text, color })
  }

  /**
   * イベントリスナー
   */
  #videoEventListeners: {
    [type in keyof HTMLVideoElementEventMap]?: (evt: Event) => void
  } = {
    loadedmetadata: (evt) => {
      this.#trigger('loadedmetadata', evt)
    },

    playing: (evt) => {
      this.renderer.stop()
      this.renderer.start()

      this.#trigger('playing', evt)
    },

    pause: (evt) => {
      this.renderer.stop()

      this.#trigger('pause', evt)
    },

    seeked: (evt) => {
      this.renderer.render()

      this.#trigger('seeked', evt)
    },

    timeupdate: (evt) => {
      this.#trigger('timeupdate', evt)
    },
  }

  /**
   * イベント登録
   */
  #registerEventListener() {
    // Video要素
    for (const key in this.#videoEventListeners) {
      const type = key as keyof HTMLVideoElementEventMap
      const listener = this.#videoEventListeners[type]!

      this.renderer.video.addEventListener(type, listener)
    }

    /**
     * 描画データの更新
     */
    const updateRenderer = () => {
      this.updateRendererThreads()
    }

    // 検索ステータス ロード中
    this.searcher.addEventListener('loading', () => {
      const size = this.state.slots.size()

      this.#setBadge(size ? size.toString() : null, 'yellow')
    })

    // 検索ステータス 完了
    this.searcher.addEventListener('ready', () => {
      const size = this.state.slots.size()

      this.#setBadge(size ? size.toString() : null, 'green')

      updateRenderer()

      if (!this.renderer.video.paused) {
        this.renderer.stop()
        this.renderer.start()
      }
    })

    // ストレージの監視
    this.#storageOnChangeRemoveListeners.push(
      // 設定 (コメント:表示サイズ)
      settings.loadAndWatch('settings:comment:scale', (scale) => {
        this.renderer.setOptions({
          scale: scale / 100,
          keepCA: scale !== 100,
        })

        this.renderer.reload()
      }),

      // 設定 (コメント:不透明度)
      settings.loadAndWatch('settings:comment:opacity', (opacity) => {
        this.renderer.setOpacity(opacity / 100)
      }),

      // 設定 (コメント:フレームレート)
      settings.loadAndWatch('settings:comment:fps', (fps) => {
        this.renderer.setFps(fps)
      }),

      // 設定 (NG設定:サイズの大きいコメントを非表示)
      settings.loadAndWatch('settings:ng:largeComments', updateRenderer),

      // 設定 (NG設定:固定コメントを非表示)
      settings.loadAndWatch('settings:ng:fixedComments', updateRenderer),

      // 設定 (NG設定:色付きコメントを非表示)
      settings.loadAndWatch('settings:ng:coloredComments', updateRenderer)
    )

    // メッセージ (インスタンスのID取得)
    ncoMessenger.onMessage('getId', () => {
      return this.id
    })

    // メッセージ (スロット 更新)
    ncoMessenger.onMessage('updateSlot', ({ data }) => {
      return this.updateSlot(data)
    })

    // メッセージ (オフセット 全体)
    ncoMessenger.onMessage('setGlobalOffset', ({ data }) => {
      return this.setGlobalOffset(data)
    })

    // メッセージ (マーカー)
    ncoMessenger.onMessage('jumpMarker', ({ data }) => {
      return this.jumpMarker(data)
    })

    // メッセージ (スクリーンショット)
    ncoMessenger.onMessage('capture', ({ data }) => {
      return this.renderer.capture(data)
    })
  }

  /**
   * イベント登録解除
   */
  #unregisterEventListener() {
    for (const key in this.#videoEventListeners) {
      const type = key as keyof HTMLVideoElementEventMap
      const listener = this.#videoEventListeners[type]!

      this.renderer.video.removeEventListener(type, listener)
    }

    this.state.removeAllEventListeners()
    this.searcher.removeAllEventListeners()

    while (this.#storageOnChangeRemoveListeners.length) {
      this.#storageOnChangeRemoveListeners.pop()?.()
    }

    ncoMessenger.removeAllListeners()
  }

  #listeners: {
    [type in keyof NCOverlayEventMap]?: NCOverlayEventMap[type][]
  } = {}

  #trigger<Type extends keyof NCOverlayEventMap>(
    type: Type,
    ...args: Parameters<NCOverlayEventMap[Type]>
  ) {
    this.#listeners[type]?.forEach((listener) => {
      try {
        listener.call(this, ...args)
      } catch (err) {
        Logger.error(type, err)
      }
    })
  }

  addEventListener<Type extends keyof NCOverlayEventMap>(
    type: Type,
    callback: NCOverlayEventMap[Type]
  ) {
    this.#listeners[type] ??= []
    this.#listeners[type]!.push(callback)
  }

  removeEventListener<Type extends keyof NCOverlayEventMap>(
    type: Type,
    callback: NCOverlayEventMap[Type]
  ) {
    this.#listeners[type] = this.#listeners[type]?.filter(
      (cb) => cb !== callback
    )
  }

  removeAllEventListeners() {
    for (const key in this.#listeners) {
      delete this.#listeners[key as keyof NCOverlayEventMap]
    }
  }
}
