import type { ContentScriptContext } from 'wxt/client'
import type { StorageOnChangeRemoveListener } from '@/utils/storage'
import type { Slot } from './state'

import { Logger } from '@/utils/logger'
import { uid } from '@/utils/uid'
import { settings } from '@/utils/settings/extension'

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

  constructor(video: HTMLVideoElement, ctx: ContentScriptContext) {
    this.id = `${Date.now()}.${uid()}`
    this.state = new NCOState(this.id)
    this.searcher = new NCOSearcher(this.state)
    this.renderer = new NCORenderer(video)

    // 既にメタデータ読み込み済みの場合
    if (HTMLMediaElement.HAVE_METADATA <= this.renderer.video.readyState) {
      window.setTimeout(() => {
        this.#trigger('loadedmetadata', new Event('loadedmetadata'))
      })
    }

    ctx.onInvalidated(() => this.dispose(true))

    this.initialize()
  }

  /**
   * 初期化
   */
  initialize() {
    Logger.log('NCOverlay.initialize()')

    this.dispose()

    this.#registerEventListener()

    this.renderer.video.classList.add('NCOverlay-Video')
    this.renderer.canvas.classList.add('NCOverlay-Canvas')
  }

  /**
   * 解放
   */
  dispose(force?: boolean) {
    Logger.log(`NCOverlay.dispose(${force ?? ''})`)

    this.#unregisterEventListener()

    this.state.clear()
    this.renderer.clear()

    if (force) {
      this.removeAllEventListeners()

      this.renderer.video.classList.remove('NCOverlay-Video')
      this.renderer.canvas.classList.remove('NCOverlay-Canvas')
    }
  }

  /**
   * データ設定
   * @description 既存のデータを置き換える
   */
  setSlots(slots: Slot[]) {
    this.state.slots.set(slots)
  }

  /**
   * データ追加
   * @description 既存のデータに追加する
   */
  addSlot(...slots: Slot[]) {
    this.state.slots.add(...slots)
  }

  /**
   * 指定したマーカーの位置にジャンプ
   */
  jumpMarker(markerIdx: number | null) {
    const slots = this.state.slots.getAll()

    if (!slots) return

    if (markerIdx === null) {
      slots.forEach((slot) => {
        delete slot.offset
      })
    } else {
      const currentTimeMs = this.renderer.video.currentTime * 1000

      slots.forEach((slot) => {
        const marker = slot.markers?.[markerIdx]

        if (marker) {
          slot.offset = marker * -1 + currentTimeMs
        }
      })
    }

    const threads = this.state.slots.getThreads()

    this.renderer.setThreads(threads)
    this.renderer.reload()
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

    // // データ 変更時
    // this.state.addEventListener('change', (type) => {
    //   switch (type) {
    //     case 'slots': {
    //       break
    //     }
    //   }
    // })

    // 検索ステータス 変更時
    this.searcher.addEventListener('ready', () => {
      const threads = this.state.slots.getThreads()

      this.renderer.setThreads(threads)
      this.renderer.reload()
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

    // メッセージ (マーカー)
    ncoMessenger.onMessage('p-c:jumpMarker', ({ data }) => {
      return this.jumpMarker(data)
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
      // @ts-ignore
      listener.call(this, ...args)
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
