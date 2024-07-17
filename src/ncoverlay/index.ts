import type { Runtime } from 'wxt/browser'
import type { NgSetting } from '@midra/nco-api/utils/applyNgSetting'
import type { StorageOnChangeRemoveListener } from '@/utils/storage'
import type { setBadge } from '@/utils/extension/setBadge'
import type { SlotUpdate } from './state'

import { applyNgSetting } from '@midra/nco-api/utils/applyNgSetting'

import { NICONICO_COLOR_COMMANDS } from '@/constants'

import { Logger } from '@/utils/logger'
import { uid } from '@/utils/uid'
import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'
import { utilsMessenger } from '@/utils/messaging'

import { ncoMessenger } from './messaging'
import { NCOState } from './state'
import { NCOSearcher } from './searcher'
import { NCORenderer } from './renderer'

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

  #storageOnChangeRemoveListeners: StorageOnChangeRemoveListener[] = []
  #port: Runtime.Port

  constructor(video: HTMLVideoElement) {
    this.id = `${Date.now()}.${uid()}`
    this.state = new NCOState(this.id)
    this.searcher = new NCOSearcher(this.state)
    this.renderer = new NCORenderer(video)

    this.#port = webext.runtime.connect()
    this.#port.onMessage.addListener((message) => {
      if (message === 'ping') {
        this.#port.postMessage(`pong:${this.id}`)
      }
    })

    this.#registerEventListener()

    this.#setBadge(null)

    // 既にメタデータ読み込み済みの場合
    if (HTMLMediaElement.HAVE_METADATA <= this.renderer.video.readyState) {
      window.setTimeout(() => {
        this.#trigger('loadedmetadata', new Event('loadedmetadata'))
      }, 500)
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
  setGlobalOffset(ms: number | null) {
    const changed = ms ? this.state.offset.set(ms) : this.state.offset.clear()

    if (changed) {
      this.updateRendererThreads()
    }

    return changed
  }

  /**
   * 指定したマーカーの位置にジャンプ
   */
  jumpMarker(markerIdx: number | null) {
    const slots = this.state.slots.getAll()

    if (!slots) return

    if (markerIdx === null) {
      slots.forEach((slot) => {
        this.state.slots.update({
          id: slot.id,
          offset: 0,
        })
      })
    } else {
      const currentTimeMs = this.renderer.video.currentTime * 1000

      slots.forEach((slot) => {
        const marker = slot.markers?.[markerIdx]

        if (marker) {
          this.state.slots.update({
            id: slot.id,
            offset: marker * -1 + currentTimeMs,
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
    let threads = this.state.slots.getThreads()

    if (threads) {
      const ngSetting: NgSetting = {
        word: [],
        command: [],
        id: [],
      }

      const {
        'settings:ng:largeComments': ngLargeComments,
        'settings:ng:fixedComments': ngFixedComments,
        'settings:ng:coloredComments': ngColoredComments,
      } = await settings.get(
        'settings:ng:largeComments',
        'settings:ng:fixedComments',
        'settings:ng:coloredComments'
      )

      if (ngLargeComments) {
        ngSetting.command.push('big')
      }

      if (ngFixedComments) {
        ngSetting.command.push('ue', 'shita')
      }

      if (ngColoredComments) {
        ngSetting.command.push(
          ...Object.keys(NICONICO_COLOR_COMMANDS),
          /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
        )
      }

      threads = applyNgSetting(threads, ngSetting)
    }

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
    utilsMessenger.sendMessage('setBadge', [{ text, color }])
  }

  /**
   * イベントリスナー
   */
  #videoEventListeners: {
    [type in keyof HTMLVideoElementEventMap]?: (evt: Event) => void
  } = {
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

    loadedmetadata: (evt) => {
      this.#trigger('loadedmetadata', evt)
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

    // 検索ステータス ロード中
    this.searcher.addEventListener('loading', () => {
      const size = this.state.slots.size()

      this.#setBadge(size ? size.toString() : null, 'yellow')
    })

    // 検索ステータス 完了
    this.searcher.addEventListener('ready', () => {
      const size = this.state.slots.size()

      this.#setBadge(size ? size.toString() : null, 'green')

      this.updateRendererThreads()

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
      settings.loadAndWatch('settings:ng:largeComments', () => {
        this.updateRendererThreads()
      }),

      // 設定 (NG設定:固定コメントを非表示)
      settings.loadAndWatch('settings:ng:fixedComments', () => {
        this.updateRendererThreads()
      }),

      // 設定 (NG設定:色付きコメントを非表示)
      settings.loadAndWatch('settings:ng:coloredComments', () => {
        this.updateRendererThreads()
      })
    )

    // メッセージ (インスタンスのID取得)
    ncoMessenger.onMessage('getId', () => {
      return this.id
    })

    // メッセージ (スロット 更新)
    ncoMessenger.onMessage('updateSlot', ({ data }) => {
      return this.updateSlot(...data)
    })

    // メッセージ (オフセット 全体)
    ncoMessenger.onMessage('setGlobalOffset', ({ data }) => {
      return this.setGlobalOffset(...data)
    })

    // メッセージ (マーカー)
    ncoMessenger.onMessage('jumpMarker', ({ data }) => {
      return this.jumpMarker(...data)
    })

    // メッセージ (描画データ 更新)
    ncoMessenger.onMessage('updateRendererThreads', () => {
      return this.updateRendererThreads()
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

  removeAllEventListeners() {
    for (const key in this.#listeners) {
      delete this.#listeners[key as keyof NCOverlayEventMap]
    }
  }
}
