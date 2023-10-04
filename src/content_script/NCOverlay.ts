import type { InputFormat, InputFormatType } from '@xpadev-net/niconicomments'
import NiconiComments from '@xpadev-net/niconicomments'

export class NCOverlay {
  #video: HTMLVideoElement
  #canvas: HTMLCanvasElement
  #niconiComments: NiconiComments

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

  constructor(
    video: HTMLVideoElement,
    data: InputFormat = [],
    format?: InputFormatType
  ) {
    console.log('[NCOverlay] video', video)

    this.#video = video
    this.#video.classList.add('NCOverlay-Video')
    this.#video.addEventListener('playing', this.#listener.playing)
    this.#video.addEventListener('pause', this.#listener.pause)
    this.#video.addEventListener('seeked', this.#listener.seeked)
    this.#video.addEventListener(
      'loadedmetadata',
      this.#listener.loadedmetadata
    )

    if (this.#video.duration && this.onLoadedmetadata) {
      this.#video.dispatchEvent(new Event('loadedmetadata'))
    }

    this.#canvas = document.createElement('canvas')
    this.#canvas.classList.add('NCOverlay-Canvas')
    this.#canvas.width = 1920
    this.#canvas.height = 1080

    this.init(data, format)
  }

  init(data: InputFormat, format: InputFormatType = 'v1') {
    console.log('[NCOverlay] NCOverlay.init()')

    const isPlaying = this.#isPlaying

    if (this.#niconiComments) {
      this.stop()
      this.clear()
    }

    this.#niconiComments = new NiconiComments(this.#canvas, data, {
      format: format,
    })

    if (isPlaying) {
      this.start()
    }
  }

  dispose() {
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
    if (this.#isPlaying) {
      this.#update()

      requestAnimationFrame(() => this.#loop())
    }
  }

  #listener = {
    playing: (e: Event) => {
      console.log('[NCOverlay] Event: playing')

      this.start()

      if (typeof this.onPlaying === 'function') {
        this.onPlaying(e)
      }
    },

    pause: (e: Event) => {
      console.log('[NCOverlay] Event: pause')

      this.stop()

      if (typeof this.onPause === 'function') {
        this.onPause(e)
      }
    },

    seeked: (e: Event) => {
      console.log('[NCOverlay] Event: seeked')
      console.log(`[NCOverlay] currentTime: ${this.#video.currentTime}`)

      this.#update()

      if (typeof this.onSeeked === 'function') {
        this.onSeeked(e)
      }
    },

    loadedmetadata: (e: Event) => {
      console.log('[NCOverlay] Event: loadedmetadata')

      if (this.onLoadedmetadata) {
        this.onLoadedmetadata(e)
      }
    },
  }
}
