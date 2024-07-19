import type { VodKey } from '@/types/constants'
import { settings } from '@/utils/settings/extension'

import { NCOverlay } from '.'

export class NCOPatcher {
  #vod
  #getInfo
  #appendCanvas

  #video: HTMLVideoElement | null = null
  #nco: NCOverlay | null = null

  get nco() {
    return this.#nco
  }

  constructor(init: {
    vod: VodKey
    getInfo: (
      video: HTMLVideoElement | null
    ) => Promise<{ title: string; duration: number } | null>
    appendCanvas: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void
  }) {
    this.#vod = init.vod
    this.#getInfo = init.getInfo
    this.#appendCanvas = init.appendCanvas
  }

  dispose() {
    this.#nco?.dispose()

    this.#video = null
    this.#nco = null
  }

  setVideo(video: HTMLVideoElement) {
    if (this.#video === video) return

    this.dispose()

    this.#video = video
    this.#nco = new NCOverlay(this.#video)

    this.#nco.addEventListener('loadedmetadata', async () => {
      if (!this.#nco) return

      this.#nco.clear()

      this.#nco.state.status.set('pending')

      const values = await settings.get(
        'settings:comment:autoLoad',
        'settings:comment:autoLoadSzbh',
        'settings:comment:autoLoadJikkyo'
      )

      // 自動読み込み
      if (values['settings:comment:autoLoad']) {
        this.#nco.state.status.set('searching')

        const info = await this.#getInfo(this.#video)

        this.#nco.state.vod.set(this.#vod)
        this.#nco.state.title.set(info?.title ?? null)

        if (info?.title) {
          await this.#nco.searcher.autoLoad(info, {
            szbh: values['settings:comment:autoLoadSzbh'],
            jikkyo: values['settings:comment:autoLoadJikkyo'],
          })
        }
      }

      this.#nco.state.status.set('ready')
    })

    this.#appendCanvas(this.#video, this.#nco.renderer.canvas)
  }
}
