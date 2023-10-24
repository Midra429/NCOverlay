import type { InputFormat, InputFormatType } from '@xpadev-net/niconicomments'
import type { ChromeStorageChanges } from '@/types/chrome/storage'
import type {
  ChromeMessage,
  ChromeResponse,
  ChromeResponseResult,
} from '@/types/chrome/message'
import type { VideoData } from '@/types/niconico/video'
import { ChromeMessageTypeCheck } from '@/types/chrome/message'
import NiconiComments from '@xpadev-net/niconicomments'
import { ChromeStorageApi } from '@/utils/chrome/storage'
import { setActionBadge } from './utils/setActionBadge'
import { setActionTitle } from './utils/setActionTitle'
import { sendToPopup } from './utils/sendToPopup'
import { sendToSidePanel } from './utils/sendToSidePanel'

const kawaiiRegExp = /kawaii|かわいい|可愛い/i

export class NCOverlay {
  #video: HTMLVideoElement
  #canvas: HTMLCanvasElement

  #niconiComments: NiconiComments

  #videoData?: VideoData[]
  #commentsData?: InputFormat
  #commentsFormat?: InputFormatType

  #commentsCount: number = 0
  #isPlaying: boolean = false
  #loopIntervalMs: number = Math.round(1000 / 60)

  onPlaying?: (this: this, e: Event) => void
  onPause?: (this: this, e: Event) => void
  onSeeked?: (this: this, e: Event) => void
  onTimeupdate?: (this: this, e: Event) => void
  onLoadedmetadata?: (this: this, e: Event) => void

  get video() {
    return this.#video
  }
  get canvas() {
    return this.#canvas
  }

  constructor(
    video: HTMLVideoElement,
    input: {
      data?: VideoData[]
      comments?: InputFormat
      format?: InputFormatType
    } = {}
  ) {
    console.log('[NCOverlay] NCOverlay.video', video)

    // Videoにイベント追加
    this.#video = video
    this.#video.classList.add('NCOverlay-Video')
    this.#video.addEventListener('playing', this.#listener.playing)
    this.#video.addEventListener('pause', this.#listener.pause)
    this.#video.addEventListener('seeked', this.#listener.seeked)
    this.#video.addEventListener('timeupdate', this.#listener.timeupdate)
    this.#video.addEventListener(
      'loadedmetadata',
      this.#listener.loadedmetadata
    )

    // Canvas作成
    this.#canvas = document.createElement('canvas')
    this.#canvas.classList.add('NCOverlay-Canvas')
    this.#canvas.width = 1920
    this.#canvas.height = 1080

    this.init(input)

    // メタデータを既に持っていた場合
    if (HTMLMediaElement.HAVE_METADATA <= this.#video.readyState) {
      console.log('[NCOverlay] video.readyState >= HAVE_METADATA')

      setTimeout(() => {
        this.#listener.loadedmetadata(new Event('loadedmetadata'))
      }, 100)
    }

    chrome.storage.local.onChanged.addListener(
      this.#listener.chromeStorageOnChanged
    )
    chrome.runtime.onMessage.addListener(this.#listener.chromeOnMessage)

    document.addEventListener('ncoverlay:capture', this.#listener.capture)

    // 設定読み込み
    setTimeout(async () => {
      const settings = await ChromeStorageApi.getSettings()

      if (!settings.enable) {
        this.#canvas.style.display = 'none'
      }

      this.#canvas.style.opacity = (settings.opacity / 100).toString()

      this.setFPS(settings.lowPerformance ? 30 : 60)
    }, 0)

    console.log('[NCOverlay] new NCOverlay()', this)
  }

  init(input?: {
    data?: VideoData[]
    comments?: InputFormat
    format?: InputFormatType
  }) {
    const isReset = typeof input === 'undefined'
    const isFirst = !isReset && Object.keys(input).length === 0

    if (isReset) {
      console.log('[NCOverlay] NCOverlay.init()')
    } else if (!isFirst) {
      console.log('[NCOverlay] NCOverlay.init(input)')
    }

    sendToPopup(null)
    sendToSidePanel(null)

    const isPlaying = this.#isPlaying

    if (this.#niconiComments) {
      this.stop()
      this.clear()
    }

    this.#commentsCount = 0
    let kawaiiPct = 0

    if (!isFirst && !isReset) {
      let kawaiiCount = 0

      if (NiconiComments.typeGuard.v1.threads(input.comments)) {
        for (const data of input.comments) {
          this.#commentsCount += data.comments.length
          kawaiiCount += data.comments.filter((v) =>
            kawaiiRegExp.test(v.body)
          ).length
        }
      }

      console.log('[NCOverlay] commentsCount', this.#commentsCount)
      console.log('[NCOverlay] kawaiiCount', kawaiiCount)

      kawaiiPct =
        Math.round((kawaiiCount / this.#commentsCount) * 100 * 10) / 10

      console.log(`[NCOverlay] kawaiiPct: ${kawaiiPct}%`)
    }

    this.#videoData = input?.data

    if (0 < this.#commentsCount) {
      this.#commentsData = input?.comments
      this.#commentsFormat = input?.format ?? 'v1'
    } else {
      this.#commentsData = undefined
      this.#commentsFormat = 'empty'
    }

    this.#niconiComments = new NiconiComments(
      this.#canvas,
      this.#commentsData,
      { format: this.#commentsFormat }
    )

    this.#render()

    if (isPlaying || !this.#video.paused) {
      this.start()
    }

    if (0 < this.#commentsCount) {
      setActionBadge(
        1000 <= this.#commentsCount
          ? `${Math.round((this.#commentsCount / 1000) * 10) / 10}k`
          : this.#commentsCount.toString()
      )
      setActionTitle(
        `${this.#commentsCount.toLocaleString()}件のコメント (かわいい率: ${kawaiiPct}%)`
      )
    } else {
      setActionBadge('')
      setActionTitle('')
    }

    sendToPopup({
      videoData: this.#videoData,
      commentsCount: this.#commentsCount,
    })
    sendToSidePanel({
      commentsData: this.#commentsData,
      currentTime: this.#video.currentTime,
    })
  }

  dispose() {
    console.log('[NCOverlay] NCOverlay.dispose()')

    chrome.storage.local.onChanged.removeListener(
      this.#listener.chromeStorageOnChanged
    )
    chrome.runtime.onMessage.removeListener(this.#listener.chromeOnMessage)

    document.removeEventListener('ncoverlay:capture', this.#listener.capture)

    this.stop()
    this.clear()

    this.#video.classList.remove('NCOverlay-Video')
    this.#video.removeEventListener('playing', this.#listener.playing)
    this.#video.removeEventListener('pause', this.#listener.pause)
    this.#video.removeEventListener('seeked', this.#listener.seeked)
    this.#video.removeEventListener('timeupdate', this.#listener.timeupdate)
    this.#video.removeEventListener(
      'loadedmetadata',
      this.#listener.loadedmetadata
    )

    this.#canvas.remove()

    setActionBadge('')
    setActionTitle('')

    sendToPopup(null)
    sendToSidePanel(null)
  }

  clear() {
    this.#niconiComments.clear()
  }

  start() {
    if (!this.#isPlaying) {
      this.#isPlaying = true
      this.#loop()
    }
  }

  stop() {
    if (this.#isPlaying) {
      this.#isPlaying = false
    }
  }

  setFPS(fps: number) {
    this.#loopIntervalMs = Math.round(1000 / fps)
  }

  capture() {
    const canvas = document.createElement('canvas')
    canvas.width = this.#canvas.width
    canvas.height = this.#canvas.height

    const context = canvas.getContext('2d')

    context!.drawImage(this.#video, 0, 0, canvas.width, canvas.height)
    context!.drawImage(this.#canvas, 0, 0)

    const img = document.createElement('img')
    img.src = canvas.toDataURL('image/png')

    const ref = window.open()
    if (ref) {
      img.style.display = 'block'
      img.style.maxWidth = '100%'
      img.style.maxHeight = '100%'
      img.style.margin = 'auto'
      img.style.backgroundColor = 'hsl(0, 0%, 90%)'

      ref.document.body.style.display = 'flex'
      ref.document.body.style.height = '100%'
      ref.document.body.style.margin = '0px'
      ref.document.body.style.backgroundColor = 'rgb(14, 14, 14)'

      ref.document.body.appendChild(img)
    }
  }

  #render() {
    this.#niconiComments.drawCanvas(Math.floor(this.#video.currentTime * 100))
  }

  #_tmp_time: number = -1

  #loop() {
    if (this.#isPlaying && 0 < this.#commentsCount) {
      this.#render()

      const currentTime = Math.floor(this.#video.currentTime)
      if (this.#_tmp_time !== currentTime) {
        this.#_tmp_time = currentTime
        sendToSidePanel({ currentTime })
      }

      setTimeout(() => this.#loop(), this.#loopIntervalMs)
    }
  }

  #listener = {
    playing: (e: Event) => {
      console.log('[NCOverlay] Event: playing')

      this.start()

      this.onPlaying?.(e)
    },

    pause: (e: Event) => {
      console.log('[NCOverlay] Event: pause')

      this.stop()

      this.onPause?.(e)
    },

    seeked: (e: Event) => {
      console.log('[NCOverlay] Event: seeked', this.#video.currentTime)

      this.#render()

      this.onSeeked?.(e)
    },

    timeupdate: (e: Event) => {
      this.onTimeupdate?.(e)
    },

    loadedmetadata: (e: Event) => {
      console.log('[NCOverlay] Event: loadedmetadata')

      this.onLoadedmetadata?.(e)
    },

    capture: () => this.capture(),

    chromeOnMessage: (
      message: ChromeMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: <T extends keyof ChromeResponseResult = any>(
        response: ChromeResponse<T>
      ) => void
    ) => {
      // ページから取得
      if (ChromeMessageTypeCheck['chrome:getFromPage'](message)) {
        sendResponse({
          type: message.type,
          result: {
            videoData: this.#videoData,
            commentsData: this.#commentsData,
            commentsCount: this.#commentsCount,
            currentTime: this.#video.currentTime,
          },
        })

        return true
      }

      return false
    },

    chromeStorageOnChanged: (changes: ChromeStorageChanges) => {
      if (typeof changes.enable?.newValue !== 'undefined') {
        if (changes.enable.newValue) {
          this.#canvas.style.display = 'block'
        } else {
          this.#canvas.style.display = 'none'
        }
      }

      if (typeof changes.opacity?.newValue !== 'undefined') {
        this.#canvas.style.opacity = (changes.opacity.newValue / 100).toString()
      }

      if (typeof changes.lowPerformance?.newValue !== 'undefined') {
        this.setFPS(changes.lowPerformance.newValue ? 30 : 60)
      }
    },
  }
}
