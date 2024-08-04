import type { VodKey } from '@/types/constants'
import type { AutoLoadInput } from './searcher'

import { ncoParser } from '@midra/nco-parser'

import { Logger } from '@/utils/logger'
import { settings } from '@/utils/settings/extension'
import { getNcoApiProxy } from '@/proxy-service/NcoApiProxy'

import { NCOverlay } from '.'
import { ncoMessenger } from './messaging'

const ncoApiProxy = getNcoApiProxy()

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
    getInfo: (video: HTMLVideoElement | null) => Promise<{
      rawText: string
      duration: number
    } | null>
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

      // 自動読み込み
      if (await settings.get('settings:comment:autoLoad')) {
        this.#nco.state.status.set('searching')

        const info = await this.#getInfo(this.#video)

        let input: AutoLoadInput | null = null

        if (info) {
          const { rawText, duration } = info

          if (await settings.get('settings:experimental:useAiParser')) {
            const result = await ncoApiProxy.nco.ai.parse(
              rawText,
              EXT_USER_AGENT
            )

            if (result) {
              input = { ...result, duration }
            }
          }

          if (!input) {
            const extracted = ncoParser.extract(rawText)

            input = {
              title: extracted.title,
              seasonText: extracted.season?.text,
              seasonNumber: extracted.season?.number,
              episodeText: extracted.episode?.text,
              episodeNumber: extracted.episode?.number,
              subtitle: extracted.subtitle,
              duration,
            }
          }
        }

        const parsed = { ...info, ...input }

        Logger.log('parsed', parsed)

        this.#nco.state.vod.set(this.#vod)
        this.#nco.state.title.set(JSON.stringify(parsed, null, 2))

        if (input) {
          await this.#nco.searcher.autoLoad(input, {
            szbh: await settings.get('settings:comment:autoLoadSzbh'),
            jikkyo: await settings.get('settings:comment:autoLoadJikkyo'),
          })
        }

        this.#nco.state.status.set('ready')
      }
    })

    let tmpTime = -1

    this.#nco.addEventListener('timeupdate', function () {
      const time = Math.floor(this.renderer.video.currentTime)

      if (tmpTime !== time) {
        tmpTime = time

        ncoMessenger
          .sendMessage('timeupdate', {
            id: this.id,
            time,
          })
          .catch(() => {})
      }
    })

    this.#appendCanvas(this.#video, this.#nco.renderer.canvas)
  }
}
