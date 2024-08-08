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

        const normalized = ncoParser.normalizeAll(info?.rawText ?? '', {
          adjust: {
            letterCase: false,
          },
          remove: {
            space: false,
          },
        })

        let input: AutoLoadInput | null = null

        if (info) {
          const { duration } = info

          if (await settings.get('settings:experimental:useAiParser')) {
            const result = await ncoApiProxy.nco.ai.parse(
              normalized,
              EXT_USER_AGENT
            )

            if (result) {
              input = { ...result, duration }
            }
          }

          if (input?.episodeNumber == null) {
            const extracted = ncoParser.extract(normalized)

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

        const parsed = { ...info, normalized, ...input }

        Logger.log('parsed', parsed)

        this.#nco.state.vod.set(this.#vod)
        this.#nco.state.info.set(
          (
            [
              'rawText',
              'title',
              'seasonText',
              'seasonNumber',
              'episodeText',
              'episodeNumber',
              'subtitle',
              'duration',
            ] as (keyof typeof parsed)[]
          )
            .map((key) => `${key}: ${JSON.stringify(parsed[key])}`)
            .join('\n')
        )

        if (input) {
          const [chapter, szbh, jikkyo] = await Promise.all([
            settings.get('settings:comment:autoLoadChapter'),
            settings.get('settings:comment:autoLoadSzbh'),
            settings.get('settings:comment:autoLoadJikkyo'),
          ])

          await this.#nco.searcher.autoLoad(input, { chapter, szbh, jikkyo })
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
