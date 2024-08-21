import type { VodKey } from '@/types/constants'
import type { AutoLoadInput } from './searcher'

import { ncoParser } from '@midra/nco-parser'

import { Logger } from '@/utils/logger'
import { settings } from '@/utils/settings/extension'

import { NCOverlay } from '.'
import { ncoMessenger } from './messaging'

export class NCOPatcher {
  readonly #vod
  readonly #getInfo
  readonly #appendCanvas

  #video: HTMLVideoElement | null = null
  #nco: NCOverlay | null = null

  get nco() {
    return this.#nco
  }

  constructor(init: {
    vod: VodKey
    getInfo: (video: HTMLVideoElement | null) => Promise<
      | (
          | {
              rawText: string
              duration: number
            }
          | {
              /** <作品名> */
              workTitle: string
              /** <話数> <サブタイトル> */
              episodeTitle?: string | null
              duration: number
            }
        )
      | null
    >
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

      const autoLoads = await settings.get('settings:comment:autoLoads')

      // 自動読み込み
      if (autoLoads.length) {
        await this.#nco.state.set('status', 'searching')

        try {
          const info = await this.#getInfo(this.#video)

          let input: AutoLoadInput | undefined

          if (info) {
            info.duration = Math.floor(info.duration)

            let extracted: ReturnType<typeof ncoParser.extract> = {
              normalized: '',
              title: null,
              season: null,
              episode: null,
              subtitle: null,
            }

            if ('rawText' in info) {
              extracted = ncoParser.extract(
                ncoParser.normalizeAll(info.rawText, {
                  adjust: {
                    letterCase: false,
                  },
                  remove: {
                    space: false,
                  },
                })
              )
            } else {
              const { title, season } = ncoParser.extract(info.workTitle)

              extracted.title = title
              extracted.season = season

              if (info.episodeTitle) {
                const { episode, subtitle } = ncoParser.extract(
                  ncoParser.normalizeAll(`タイトル ${info.episodeTitle}`, {
                    adjust: {
                      letterCase: false,
                    },
                    remove: {
                      space: false,
                    },
                  })
                )

                extracted.episode = episode
                extracted.subtitle = subtitle
              }
            }

            input = {
              title: extracted.title,
              seasonText: extracted.season?.text,
              seasonNumber: extracted.season?.number,
              episodeText: extracted.episode?.text,
              episodeNumber: extracted.episode?.number,
              subtitle: extracted.subtitle,
              duration: info.duration,
            }
          }

          const parsed = { ...info, ...input }

          Logger.log('parsed:', parsed)

          const stateInfo = Object.entries(parsed)
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join('\n')

          await this.#nco.state.set('vod', this.#vod)
          await this.#nco.state.set('info', stateInfo)

          Logger.log('state.vod:', this.#vod)
          Logger.log('state.info:', '\n' + stateInfo)

          if (input) {
            await this.#nco.searcher.autoLoad(input, {
              normal: autoLoads.includes('normal'),
              szbh: autoLoads.includes('szbh'),
              chapter: autoLoads.includes('chapter'),
              jikkyo: autoLoads.includes('jikkyo'),
            })
          }
        } catch (err) {
          Logger.error('comment:autoLoad', err)
        }

        await this.#nco.state.set('status', 'ready')
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
