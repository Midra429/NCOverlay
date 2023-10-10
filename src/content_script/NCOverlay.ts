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
import { ChromeStorageApi } from '@/utils/chrome'
import { setActionBadge } from './utils/setActionBadge'
import { setActionTitle } from './utils/setActionTitle'
import { sendToPopup } from './utils/sendToPopup'
import { sendToSidePanel } from './utils/sendToSidePanel'

export class NCOverlay {
  #video: HTMLVideoElement
  #canvas: HTMLCanvasElement
  #niconiComments: NiconiComments

  #videoData?: VideoData[]
  #commentsData?: InputFormat
  #commentsFormat?: InputFormatType

  #commentsCount: number = 0
  #isPlaying: boolean = false

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
  get niconiComments() {
    return this.#niconiComments
  }
  get videoData() {
    return this.#videoData
  }
  get commentsData() {
    return this.#commentsData
  }
  get commentsFormat() {
    return this.#commentsFormat
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

    if (chrome?.runtime?.id) {
      chrome.storage.local.onChanged.addListener(
        this.#listener.chromeStorageOnChanged
      )
      chrome.runtime.onMessage.addListener(this.#listener.chromeOnMessage)
    }

    // 設定読み込み
    setTimeout(async () => {
      const settings = await ChromeStorageApi.get({
        enable: true,
        opacity: 100,
      })

      if (!settings.enable!) {
        this.#canvas.style.display = 'none'
      }

      this.#canvas.style.opacity = (settings.opacity! / 100).toString()
    }, 0)

    console.log('[NCOverlay] new NCOverlay()', this)
  }

  init(
    input: {
      data?: VideoData[]
      comments?: InputFormat
      format?: InputFormatType
    } = {}
  ) {
    console.log('[NCOverlay] NCOverlay.init()')

    sendToPopup({})
    sendToSidePanel({})

    const isPlaying = this.#isPlaying

    if (this.#niconiComments) {
      this.stop()
      this.clear()
    }

    this.#commentsCount = 0
    if (NiconiComments.typeGuard.v1.threads(input.comments)) {
      for (const data of input.comments) {
        this.#commentsCount += data.comments.length
      }
    }

    console.log('[NCOverlay] commentsCount', this.#commentsCount)

    this.#videoData = input.data

    if (0 < this.#commentsCount) {
      this.#commentsData = input.comments
      this.#commentsFormat = input.format ?? 'v1'
    } else {
      this.#commentsData = undefined
      this.#commentsFormat = 'empty'
    }

    this.#niconiComments = new NiconiComments(
      this.#canvas,
      this.#commentsData,
      {
        format: this.#commentsFormat,
      }
    )

    this.#update()

    if (isPlaying) {
      this.start()
    }

    if (0 < this.#commentsCount) {
      setActionBadge(
        1000 <= this.#commentsCount
          ? `${Math.round((this.#commentsCount / 1000) * 10) / 10}k`
          : this.#commentsCount.toString()
      )
      setActionTitle(
        `${this.#commentsCount.toLocaleString()}件のコメントを表示中`
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

    if (chrome?.runtime?.id) {
      chrome.storage.local.onChanged.removeListener(
        this.#listener.chromeStorageOnChanged
      )
      chrome.runtime.onMessage.removeListener(this.#listener.chromeOnMessage)
    }

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

    sendToPopup({})
    sendToSidePanel({})
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

  #update() {
    this.#niconiComments.drawCanvas(Math.floor(this.#video.currentTime * 100))

    sendToSidePanel({
      currentTime: this.#video.currentTime,
    })
  }

  #loop() {
    if (this.#isPlaying && 0 < this.#commentsCount) {
      this.#update()

      setTimeout(() => this.#loop(), 16)
      // requestAnimationFrame(() => this.#loop())
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

      this.#update()

      this.onSeeked?.(e)
    },

    timeupdate: (e: Event) => {
      this.onTimeupdate?.(e)
    },

    loadedmetadata: (e: Event) => {
      console.log('[NCOverlay] Event: loadedmetadata')

      this.onLoadedmetadata?.(e)
    },

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
    },
  }
}
