import type { MarkerKey } from '@/constants/markers'
import type { Browser } from '@/utils/webext'

import equal from 'fast-deep-equal'

import { MARKERS } from '@/constants/markers'
import { SLOTS_REFRESH_SETTINGS_KEYS } from '@/constants/settings'
import { clone } from '@/utils/clone'
import { logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'
import { sendMessageToBackground } from '@/messaging/to-background'
import { onMessageInContent } from '@/messaging/to-content'

import { NCOKeyboard } from './keyboard'
import { NCORenderer } from './renderer'
import { NCOSearcher } from './searcher'
import { NCOState } from './state'

import './style.css'

export interface NCOverlayEventMap {
  playing: (this: NCOverlay) => void
  pause: (this: NCOverlay) => void
  seeked: (this: NCOverlay) => void
  timeupdate: (this: NCOverlay) => void
  loadedmetadata: (this: NCOverlay) => void

  reload: (this: NCOverlay) => void
}

/**
 * NCOverlay
 */
export class NCOverlay {
  readonly id: number
  readonly state: NCOState
  readonly searcher: NCOSearcher
  readonly renderer: NCORenderer
  readonly keyboard: NCOKeyboard

  readonly #removeListenerCallbacks: (() => void)[] = []
  readonly #port: Browser.runtime.Port

  constructor(tabId: number, video: HTMLVideoElement) {
    this.id = tabId
    this.state = new NCOState(this.id)
    this.searcher = new NCOSearcher(this.state)
    this.renderer = new NCORenderer(video)
    this.keyboard = new NCOKeyboard(this.state, {
      jumpMarker: (...args) => this.jumpMarker(...args),
    })

    this.#port = webext.runtime.connect({ name: 'instance' })
    this.#port.onMessage.addListener((message) => {
      if (message === 'ping') {
        this.#port.postMessage(`pong:${this.id}`)
      }
    })

    this.#registerEventListener()

    sendMessageToBackground('setBadge', { text: null })

    // 既にメタデータ読み込み済みの場合
    if (HTMLMediaElement.HAVE_METADATA <= this.renderer.video.readyState) {
      setTimeout(() => {
        this.#trigger('loadedmetadata')
      }, 100)
    }
  }

  dispose() {
    logger.log('NCOverlay.dispose()')

    this.state.dispose()
    this.renderer.dispose()
    this.keyboard.dispose()

    this.#port.disconnect()

    this.#unregisterEventListener()
    this.removeAllEventListeners()

    sendMessageToBackground('setBadge', { text: null })
  }

  async clear() {
    await this.state.clear()
    this.renderer.clear()

    await sendMessageToBackground('setBadge', { text: null })
  }

  /**
   * 指定したマーカーの位置にジャンプ
   */
  async jumpMarker(key: MarkerKey | null) {
    const oldDetails = await this.state.get('slotDetails')
    const newDetails = clone(oldDetails)

    if (key === null) {
      if (newDetails) {
        for (const detail of newDetails) {
          delete detail.offsetMs
        }
      }
    } else {
      const markerIdx = MARKERS.findIndex((v) => v.key === key)

      const currentTimeMs = this.renderer.video.currentTime * 1000

      if (newDetails) {
        const adjustJikkyoOffset = await settings.get(
          'settings:comment:adjustJikkyoOffset'
        )

        for (const detail of newDetails) {
          if (
            detail.type !== 'jikkyo' ||
            (adjustJikkyoOffset && detail.chapters.length)
          ) {
            continue
          }

          const marker = detail.markers[markerIdx]

          if (marker) {
            detail.offsetMs = currentTimeMs - marker
          }
        }
      }

      await this.state.remove('offset')
    }

    await this.state.set('slotDetails', newDetails)
  }

  /**
   * 描画するコメントデータを更新する
   */
  #updateRendererThreads = async () => {
    const threads = await this.state.getThreads()

    this.renderer.setThreads(threads)
    this.renderer.reload()
  }

  /**
   * イベントリスナー
   */
  #videoEventListeners: {
    [P in keyof HTMLVideoElementEventMap]?: (evt: Event) => void
  } = {
    loadedmetadata: () => {
      this.#trigger('loadedmetadata')
    },

    playing: () => {
      this.renderer.start()

      this.#trigger('playing')
    },

    pause: () => {
      this.renderer.stop()

      this.#trigger('pause')
    },

    seeked: () => {
      this.renderer.updateTime()
      this.renderer.render()

      this.#trigger('seeked')
    },

    timeupdate: () => {
      this.#trigger('timeupdate')
    },

    ratechange: () => {
      this.renderer.updateTime()
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

    for (const key of SLOTS_REFRESH_SETTINGS_KEYS) {
      this.#removeListenerCallbacks.push(
        settings.onChange(key, this.#updateRendererThreads)
      )
    }

    // ストレージの監視
    this.#removeListenerCallbacks.push(
      // 設定 (コメント:表示サイズ)
      settings.watch('settings:comment:scale', (scale) => {
        this.renderer.setOptions({
          scale: scale / 100,
          keepCA: scale !== 100,
        })

        this.renderer.reload()
      }),

      // 設定 (コメント:不透明度)
      settings.watch('settings:comment:opacity', (opacity) => {
        this.renderer.setOpacity(opacity / 100)
      }),

      // 設定 (コメント:フレームレート)
      settings.watch('settings:comment:fps', (fps) => {
        this.renderer.setFps(fps)
      }),

      // 検索ステータス
      this.state.onChange('status', async (status) => {
        const slotDetails = (await this.state.get('slotDetails')) ?? []

        const loadingCounts = slotDetails.filter(
          (detail) => detail.status === 'loading'
        ).length
        const successCounts = slotDetails.filter(
          (detail) => detail.status === 'ready'
        ).length
        const errorCounts = slotDetails.filter(
          (detail) => detail.status === 'error'
        ).length

        sendMessageToBackground('setBadge', {
          text:
            (loadingCounts && loadingCounts.toString()) ||
            (successCounts && successCounts.toString()) ||
            (errorCounts && errorCounts.toString()) ||
            null,
          color:
            (loadingCounts && 'yellow') ||
            (successCounts && 'green') ||
            (errorCounts && 'red') ||
            undefined,
        })

        if (
          (status === 'ready' || status === 'error') &&
          !this.renderer.video.paused
        ) {
          this.renderer.start()
        }
      }),

      // 全体のオフセット
      this.state.onChange('offset', (offset) => {
        this.renderer.setOffset(offset ?? 0)
      }),

      // スロット
      this.state.onChange('slots', this.#updateRendererThreads),

      // スロットの情報
      this.state.onChange('slotDetails', (newValue, oldValue) => {
        const newVal = newValue?.map((v) => ({
          id: v.id,
          status: v.status,
          offsetMs: v.offsetMs,
          translucent: v.translucent,
          hidden: v.hidden,
        }))

        const oldVal = oldValue?.map((v) => ({
          id: v.id,
          status: v.status,
          offsetMs: v.offsetMs,
          translucent: v.translucent,
          hidden: v.hidden,
        }))

        if (!equal(newVal, oldVal)) {
          this.#updateRendererThreads()
        }
      }),

      // メッセージ (インスタンスのID取得)
      onMessageInContent('getNcoId', () => {
        return this.id
      }),

      // メッセージ (現在の再生時間を取得)
      onMessageInContent('getCurrentTime', () => {
        return this.renderer.video.currentTime
      }),

      // メッセージ (再読み込み)
      onMessageInContent('reload', () => {
        this.#trigger('reload')
      }),

      // メッセージ (マーカー)
      onMessageInContent('jumpMarker', ({ data }) => {
        return this.jumpMarker(data)
      }),

      // メッセージ (スクリーンショット)
      onMessageInContent('capture', ({ data }) => {
        return this.renderer.capture(data)
      })
    )
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

    while (this.#removeListenerCallbacks.length) {
      this.#removeListenerCallbacks.pop()?.()
    }
  }

  #listeners: {
    [P in keyof NCOverlayEventMap]?: NCOverlayEventMap[P][]
  } = {}

  #trigger<T extends keyof NCOverlayEventMap>(type: T) {
    if (this.#listeners[type]) {
      for (const listener of this.#listeners[type]) {
        try {
          listener.call(this)
        } catch (err) {
          logger.error(type, err)
        }
      }
    }
  }

  addEventListener<T extends keyof NCOverlayEventMap>(
    type: T,
    callback: NCOverlayEventMap[T]
  ) {
    this.#listeners[type] ??= []
    this.#listeners[type].push(callback)
  }

  removeEventListener<T extends keyof NCOverlayEventMap>(
    type: T,
    callback: NCOverlayEventMap[T]
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
