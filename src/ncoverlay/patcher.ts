import type { ContentScriptContext } from 'wxt/client'

import { settings } from '@/utils/settings/extension'

import { NCOverlay } from '.'

export class NCOPatcher {
  #ctx
  #getInfo
  #appendCanvas

  #video: HTMLVideoElement | null = null
  #nco: NCOverlay | null = null

  constructor(init: {
    ctx: ContentScriptContext
    getInfo: () => Promise<{ title: string; duration: number } | null>
    appendCanvas: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void
  }) {
    this.#ctx = init.ctx
    this.#getInfo = init.getInfo
    this.#appendCanvas = init.appendCanvas

    this.#ctx.onInvalidated(() => this.dispose())
  }

  dispose() {
    this.#nco?.renderer.canvas.remove()
    this.#nco?.dispose(true)

    this.#video = null
    this.#nco = null
  }

  setVideo(video: HTMLVideoElement) {
    if (this.#video !== video) {
      this.dispose()

      this.#video = video

      this.#nco = new NCOverlay(this.#video, this.#ctx)

      this.#nco.addEventListener('loadedmetadata', async () => {
        if (!this.#nco) return

        this.#nco.initialize()

        const values = await settings.get(
          'settings:comment:autoLoad',
          'settings:comment:autoLoadSzbh',
          'settings:comment:autoLoadJikkyo'
        )

        // 自動読み込み
        if (values['settings:comment:autoLoad']) {
          const info = await this.#getInfo()

          if (info) {
            await this.#nco.searcher.autoLoad(info, {
              szbh: values['settings:comment:autoLoadSzbh'],
              jikkyo: values['settings:comment:autoLoadJikkyo'],
            })
          }
        }
      })

      this.#appendCanvas(this.#video, this.#nco.renderer.canvas)
    }
  }
}