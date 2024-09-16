import type { BaseOptions, V1Thread } from '@xpadev-net/niconicomments'
import type { StorageItems } from '@/types/storage'

import NiconiComments from '@xpadev-net/niconicomments'

import { logger } from '@/utils/logger'
import { getObjectFitRect } from '@/utils/dom/getObjectFitRect'
import { sendUtilsMessage } from '@/utils/extension/messaging'

type NiconiCommentsOptions = Partial<Omit<BaseOptions, 'mode' | 'format'>>

/**
 * NCOverlayの描画担当
 */
export class NCORenderer {
  readonly video: HTMLVideoElement
  readonly canvas: HTMLCanvasElement

  #niconicomments: NiconiComments | null = null
  #threads: V1Thread[] | null = null
  #options: NiconiCommentsOptions | null = null
  #offset: number = 0

  #intervalMs: number = 1000 / 60
  #frameId: number = 0
  #lastFrameTime: number = 0

  constructor(video: HTMLVideoElement) {
    this.video = video
    this.video.classList.add('NCOverlay-Video')

    this.canvas = document.createElement('canvas')
    this.canvas.classList.add('NCOverlay-Canvas')
    this.canvas.width = 1920
    this.canvas.height = 1080
  }

  dispose() {
    this.clear()

    this.#options = null

    this.canvas.remove()

    this.video.classList.remove('NCOverlay-Video')
    this.canvas.classList.remove('NCOverlay-Canvas')
  }

  clear() {
    this.stop()

    this.#niconicomments?.clear()
    this.#niconicomments = null
    this.#threads = null
    this.#offset = 0

    document.body.classList.remove('NCOverlay-Capture')
  }

  /**
   * @description `reload()` 必須
   */
  setThreads(threads: V1Thread[] | null) {
    this.#threads = threads
  }

  /**
   * @description `reload()` 必須
   */
  setOptions(options: NiconiCommentsOptions | null) {
    this.#options = options
  }

  setOffset(offset: number) {
    if (this.#offset !== offset) {
      this.#offset = offset

      if (!this.#frameId) {
        this.render()
      }
    }
  }

  /**
   * @param fps 1以上 or 0 (無制限)
   */
  setFps(fps: number) {
    this.#intervalMs = 0 < fps ? 1000 / fps : 0
  }

  /**
   * @param opacity 0 ~ 1
   */
  setOpacity(opacity: number) {
    this.canvas.style.opacity = opacity.toString()
  }

  reload() {
    this.#niconicomments?.clear()
    this.#niconicomments = null

    if (this.#threads) {
      this.#niconicomments = new NiconiComments(this.canvas, this.#threads, {
        mode: 'html5',
        format: 'v1',
        ...this.#options,
      })

      this.render()
    }
  }

  render() {
    const time = this.video.currentTime - this.#offset

    this.#niconicomments?.drawCanvas(0 < time ? (time * 100) | 0 : 0)
  }

  start() {
    this.#frameId = window.requestAnimationFrame((time) => {
      this.#frameReqCallback(time)
    })
  }

  stop() {
    window.cancelAnimationFrame(this.#frameId)

    this.#frameId = 0
  }

  #frameReqCallback(time: number) {
    if (this.#intervalMs) {
      const delta = time - this.#lastFrameTime

      if (this.#intervalMs < delta) {
        this.#lastFrameTime = time - (delta % this.#intervalMs)

        this.render()
      }
    } else {
      this.render()
    }

    this.start()
  }

  /**
   * スクリーンショット
   */
  async capture(format: StorageItems['settings:capture:format']) {
    document.body.classList.add('NCOverlay-Capture')

    return new Promise<{
      format: 'jpeg' | 'png'
      data?: number[]
    }>((resolve) => {
      setTimeout(async () => {
        let data: number[] | undefined

        try {
          data = await sendUtilsMessage('captureTab', {
            rect: getObjectFitRect(true, this.canvas, 1920, 1080),
            scale: window.devicePixelRatio,
            format,
          })
        } catch (err) {
          logger.error('capture', err)
        }

        document.body.classList.remove('NCOverlay-Capture')

        resolve({ format, data })
      }, 100)
    })
  }
}
