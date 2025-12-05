import type { BaseOptions } from '@xpadev-net/niconicomments'
import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { StorageItems } from '@/types/storage'

import NiconiComments from '@xpadev-net/niconicomments'

import { logger } from '@/utils/logger'
import { getObjectFitRect } from '@/utils/dom/getObjectFitRect'
import { sendUtilsMessage } from '@/utils/extension/messaging'

interface NiconiCommentsOptions
  extends Partial<Omit<BaseOptions, 'mode' | 'format'>> {}

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
  #startTimestamp: number = 0
  #startTime: number = 0
  #startTimeVpos: number = 0
  #playbackRate: number = 1

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
  }

  clear() {
    this.stop()

    this.#niconicomments?.clear()
    this.#niconicomments = null
    this.#threads = null

    this.#offset = 0
    this.#startTimestamp = 0
    this.#startTime = 0
    this.#startTimeVpos = 0
    this.#playbackRate = 1

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
      this.#startTimeVpos = Math.max((this.#startTime - this.#offset) * 100, 0)

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

  updateTime() {
    this.#startTimestamp = performance.now()
    this.#startTime = this.video.currentTime
    this.#startTimeVpos = Math.max((this.#startTime - this.#offset) * 100, 0)
    this.#playbackRate = this.video.playbackRate
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

      this.updateTime()
      this.render()
    }
  }

  render() {
    const vpos =
      this.#startTimeVpos +
      ((performance.now() - this.#startTimestamp) * this.#playbackRate) / 10

    this.#niconicomments?.drawCanvas(vpos)
  }

  start() {
    this.#stopRequestAnimationFrame()

    this.updateTime()

    this.#startRequestAnimationFrame()
  }

  stop() {
    this.#stopRequestAnimationFrame()
  }

  #startRequestAnimationFrame() {
    this.#frameId = requestAnimationFrame(this.#animationFrameCallback)
  }

  #stopRequestAnimationFrame() {
    if (this.#frameId) {
      cancelAnimationFrame(this.#frameId)

      this.#frameId = 0
    }
  }

  #animationFrameCallback = (time: number) => {
    if (this.#intervalMs) {
      const delta = time - this.#lastFrameTime

      if (this.#intervalMs < delta) {
        this.#lastFrameTime = time - (delta % this.#intervalMs)

        this.render()
      }
    } else {
      this.render()
    }

    this.#startRequestAnimationFrame()
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
