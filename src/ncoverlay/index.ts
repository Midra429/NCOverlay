import type { ContentScriptContext } from 'wxt/client'
import type { StorageOnChangeRemoveListener } from '@/utils/storage'
import type { setBadge } from '@/utils/extension/setBadge'
import type { SlotUpdate } from './state'

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
  #heartbeatIntervalId?: number

  constructor(video: HTMLVideoElement, ctx: ContentScriptContext) {
    this.id = `${Date.now()}.${uid()}`
    this.state = new NCOState(this.id)
    this.searcher = new NCOSearcher(this.state)
    this.renderer = new NCORenderer(video)

    this.#setBadge(null)

    this.#registerEventListener()

    ctx.onInvalidated(() => this.dispose())

    // 既にメタデータ読み込み済みの場合
    if (HTMLMediaElement.HAVE_METADATA <= this.renderer.video.readyState) {
      window.setTimeout(() => {
        this.#trigger('loadedmetadata', new Event('loadedmetadata'))
      })
    }

    // 生存確認
    const port = webext.runtime.connect()

    this.#heartbeatIntervalId = window.setInterval(() => {
      port.postMessage(`heartbeat:${this.id}`)
    }, 5000)

    port.onDisconnect.addListener(() => {
      window.clearInterval(this.#heartbeatIntervalId)
    })
  }

  dispose() {
    Logger.log('NCOverlay.dispose()')

    this.state.dispose()
    this.renderer.dispose()

    this.#setBadge(null)

    this.#unregisterEventListener()
    this.removeAllEventListeners()

    window.clearInterval(this.#heartbeatIntervalId)
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
      for (const slot of slots) {
        this.state.slots.update({
          id: slot.id,
          offset: 0,
        })
      }
    } else {
      const currentTimeMs = this.renderer.video.currentTime * 1000

      for (const slot of slots) {
        const marker = slot.markers?.[markerIdx]

        if (marker) {
          this.state.slots.update({
            id: slot.id,
            offset: marker * -1 + currentTimeMs,
          })
        }
      }
    }

    this.updateRendererThreads()
  }

  /**
   * 描画するコメントデータを更新する
   */
  updateRendererThreads() {
    const threads = this.state.slots.getThreads()

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
    utilsMessenger.sendMessage('c-b:setBadge', [{ text, color }])
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
      this.#setBadge(
        this.state.slots.getAll()?.length?.toString() ?? null,
        'yellow'
      )
    })

    // 検索ステータス 完了
    this.searcher.addEventListener('ready', () => {
      this.#setBadge(
        this.state.slots.getAll()?.length?.toString() ?? null,
        'green'
      )

      this.updateRendererThreads()

      if (!this.renderer.video.paused) {
        this.renderer.stop()
        this.renderer.start()
      }
    })

    // 設定 (コメント:表示サイズ)
    this.#storageOnChangeRemoveListeners.push(
      settings.loadAndWatch('settings:comment:scale', (scale) => {
        this.renderer.setOptions({
          scale: scale / 100,
          keepCA: scale !== 100,
        })

        this.renderer.reload()
      })
    )

    // 設定 (コメント:不透明度)
    this.#storageOnChangeRemoveListeners.push(
      settings.loadAndWatch('settings:comment:opacity', (opacity) => {
        this.renderer.setOpacity(opacity / 100)
      })
    )

    // 設定 (コメント:フレームレート)
    this.#storageOnChangeRemoveListeners.push(
      settings.loadAndWatch('settings:comment:fps', (fps) => {
        this.renderer.setFps(fps)
      })
    )

    // メッセージ (インスタンスのID取得)
    ncoMessenger.onMessage('p-c:getId', () => {
      return this.id
    })

    // メッセージ (スロット 更新)
    ncoMessenger.onMessage('p-c:updateSlot', ({ data }) => {
      return this.updateSlot(...data)
    })

    // メッセージ (オフセット 全体)
    ncoMessenger.onMessage('p-c:setGlobalOffset', ({ data }) => {
      return this.setGlobalOffset(...data)
    })

    // メッセージ (マーカー)
    ncoMessenger.onMessage('p-c:jumpMarker', ({ data }) => {
      return this.jumpMarker(...data)
    })

    // メッセージ (描画データ 更新)
    ncoMessenger.onMessage('p-c:updateRendererThreads', () => {
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
    if (type in this.#listeners) {
      for (const listener of this.#listeners[type]!) {
        try {
          listener.call(this, ...args)
        } catch (err) {
          Logger.error(type, err)
        }
      }
    }
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
