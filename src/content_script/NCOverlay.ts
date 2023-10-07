import type { InputFormat, InputFormatType } from '@xpadev-net/niconicomments'
import type { ChromeStorageChanges } from '@/types/chrome/storage'
import type {
  ChromeMessage,
  ChromeResponse,
  ChromeResponseResult,
} from '@/types/chrome/message'
import type { VideoData } from '@/types/niconico/video'
import { isChromeMessageGetFromPage } from '@/types/chrome/message'
import NiconiComments from '@xpadev-net/niconicomments'
import { ChromeStorageApi } from '@/utils/storage'
import { setBadgeText } from '@/content_script/utils/setBadgeText'
import { sendToPopup } from '@/content_script/utils/sendToPopup'

export class NCOverlay {
  #video: HTMLVideoElement
  #canvas: HTMLCanvasElement
  #niconiComments: NiconiComments

  #videoData?: VideoData[]
  #commentsData?: InputFormat
  #commentsFormat?: InputFormatType

  #isEmpty: boolean = true
  #isPlaying: boolean = false

  onPlaying?: (e: Event) => void
  onPause?: (e: Event) => void
  onSeeked?: (e: Event) => void
  onLoadedmetadata?: (e: Event) => void

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

    const isPlaying = this.#isPlaying

    if (this.#niconiComments) {
      this.stop()
      this.clear()
    }

    this.#isEmpty =
      !input.comments ||
      (Array.isArray(input.comments) && input.comments.length === 0)

    if (this.#isEmpty) {
      input.comments = undefined
      input.format = 'empty'
    }

    this.#videoData = input.data
    this.#commentsData = input.comments
    this.#commentsFormat = input.format ?? 'v1'

    this.#niconiComments = new NiconiComments(
      this.#canvas,
      this.#commentsData,
      {
        format: this.#commentsFormat,
      }
    )

    let commentsCount = 0
    if (NiconiComments.typeGuard.v1.threads(this.#commentsData)) {
      for (const data of this.#commentsData) {
        commentsCount += data.comments.length
      }
    }

    console.log('[NCOverlay] commentsCount', commentsCount)

    this.#update()

    if (isPlaying) {
      this.start()
    }

    let badgeText = ''
    if (0 < commentsCount) {
      if (1000 <= commentsCount) {
        badgeText = `${Math.round((commentsCount / 1000) * 10) / 10}k`
      } else {
        badgeText = commentsCount.toString()
      }
    }

    setBadgeText(badgeText)

    sendToPopup({
      videoData: this.#videoData,
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
    this.#video.removeEventListener(
      'loadedmetadata',
      this.#listener.loadedmetadata
    )

    this.#canvas.remove()

    setBadgeText('')
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
  }

  #loop() {
    if (this.#isPlaying && !this.#isEmpty) {
      this.#update()

      requestAnimationFrame(() => this.#loop())
    }
  }

  #listener = {
    playing: (e: Event) => {
      console.log('[NCOverlay] Event: playing')

      this.start()

      if (this.onPlaying) {
        this.onPlaying(e)
      }
    },

    pause: (e: Event) => {
      console.log('[NCOverlay] Event: pause')

      this.stop()

      if (this.onPause) {
        this.onPause(e)
      }
    },

    seeked: (e: Event) => {
      console.log('[NCOverlay] Event: seeked', this.#video.currentTime)

      this.#update()

      if (this.onSeeked) {
        this.onSeeked(e)
      }
    },

    loadedmetadata: (e: Event) => {
      console.log('[NCOverlay] Event: loadedmetadata')

      if (this.onLoadedmetadata) {
        this.onLoadedmetadata(e)
      }
    },

    chromeOnMessage: (
      message: ChromeMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: <T extends keyof ChromeResponseResult = any>(
        response: ChromeResponse<T>
      ) => void
    ) => {
      if (isChromeMessageGetFromPage(message)) {
        sendResponse({
          type: message.type,
          result: {
            videoData: this.#videoData,
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
