import type { Marker } from '@/constants/markers'
import type { Browser } from '@/utils/webext'

import equal from 'fast-deep-equal'
import { uid } from '@midra/nco-utils/common/uid'

import { MARKERS } from '@/constants/markers'

import { logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'
import { sendUtilsMessage } from '@/utils/extension/messaging'

import { NCOState } from './state'
import { NCOSearcher } from './searcher'
import { NCORenderer } from './renderer'
import { NCOKeyboard } from './keyboard'
import { ncoMessenger } from './messaging'

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
  readonly id: string
  readonly state: NCOState
  readonly searcher: NCOSearcher
  readonly renderer: NCORenderer
  readonly keyboard: NCOKeyboard

  readonly #storageOnChangeRemoveListeners: (() => void)[] = []
  readonly #port: Browser.runtime.Port

  constructor(video: HTMLVideoElement) {
    this.id = `${Date.now()}.${uid()}`
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

    sendUtilsMessage('setBadge', { text: null })

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

    sendUtilsMessage('setBadge', { text: null })
  }

  async clear() {
    await this.state.clear()
    this.renderer.clear()

    await sendUtilsMessage('setBadge', { text: null })
  }

  /**
   * 指定したマーカーの位置にジャンプ
   */
  async jumpMarker(marker: number | Marker['shortLabel'] | null) {
    const oldDetails = await this.state.get('slotDetails')
    const newDetails = structuredClone(oldDetails)

    if (marker === null) {
      if (newDetails) {
        for (const detail of newDetails) {
          delete detail.offsetMs
        }
      }
    } else {
      const markerIdx =
        typeof marker === 'string'
          ? MARKERS.findIndex((v) => v.shortLabel === marker)
          : marker

      const currentTimeMs = this.renderer.video.currentTime * 1000

      if (newDetails) {
        for (const detail of newDetails) {
          const marker = detail.markers?.[markerIdx]

          if (marker) {
            detail.offsetMs = marker * -1 + currentTimeMs
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

    // ストレージの監視
    this.#storageOnChangeRemoveListeners.push(
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

      // 設定（コメント:コメントアシストの表示を抑制）
      settings.onChange(
        'settings:comment:hideAssistedComments',
        this.#updateRendererThreads
      ),

      // 設定 (NG設定)
      settings.onChange('settings:ng:words', this.#updateRendererThreads),
      settings.onChange('settings:ng:commands', this.#updateRendererThreads),
      settings.onChange('settings:ng:ids', this.#updateRendererThreads),
      settings.onChange(
        'settings:ng:largeComments',
        this.#updateRendererThreads
      ),
      settings.onChange(
        'settings:ng:fixedComments',
        this.#updateRendererThreads
      ),
      settings.onChange(
        'settings:ng:coloredComments',
        this.#updateRendererThreads
      ),

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

        sendUtilsMessage('setBadge', {
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
      })
    )

    // メッセージ (インスタンスのID取得)
    ncoMessenger.onMessage('getId', () => {
      return this.id
    })

    // メッセージ (現在の再生時間を取得)
    ncoMessenger.onMessage('getCurrentTime', () => {
      return this.renderer.video.currentTime
    })

    // メッセージ (再読み込み)
    ncoMessenger.onMessage('reload', () => {
      this.#trigger('reload')
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

    while (this.#storageOnChangeRemoveListeners.length) {
      this.#storageOnChangeRemoveListeners.pop()?.()
    }

    ncoMessenger.removeAllListeners()
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
    this.#listeners[type]!.push(callback)
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
