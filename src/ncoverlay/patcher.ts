import type { BuildSearchQueryInput } from '@midra/nco-api/search/lib/buildSearchQuery'
import type { VodKey } from '@/types/constants'

import { ncoParser } from '@midra/nco-parser'

import { Logger } from '@/utils/logger'
import { settings } from '@/utils/settings/extension'

import { NCOverlay } from '.'
import { ncoMessenger } from './messaging'

export type PlayingInfo =
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
    getInfo: (nco: NCOverlay) => Promise<PlayingInfo | null>
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

    const load = async () => {
      if (!this.#nco) return

      const status = await this.#nco.state.get('status')

      if (status === 'searching' || status === 'loading') {
        return
      }

      this.#nco.clear()

      const autoLoads = await settings.get('settings:comment:autoLoads')

      // 自動検索
      if (autoLoads.length) {
        await this.#nco.state.set('status', 'searching')

        try {
          const info = await this.#getInfo(this.#nco)

          let input: BuildSearchQueryInput | undefined

          if (info) {
            info.duration = Math.floor(info.duration)

            let rawText: string

            let extracted: ReturnType<typeof ncoParser.extract> = {
              normalized: '',
              title: null,
              season: null,
              episode: null,
              subtitle: null,
            }

            if ('rawText' in info) {
              rawText = info.rawText

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
              const { title, season } = ncoParser.extract(
                `${info.workTitle} #01`
              )

              rawText = [info.workTitle, info.episodeTitle]
                .filter(Boolean)
                .join(' ')

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
              rawText,
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

          await this.#nco.state.set('vod', this.#vod)
          await this.#nco.state.set('info', parsed)

          Logger.log('state.vod:', this.#vod)
          Logger.log('state.info:', parsed)

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
    }

    this.#nco.addEventListener('loadedmetadata', load)
    this.#nco.addEventListener('reload', load)

    this.#nco.addEventListener('timeupdate', function () {
      ncoMessenger
        .sendMessage('timeupdate', {
          id: this.id,
          time: this.renderer.video.currentTime * 1000,
        })
        .catch(() => {})
    })

    this.#appendCanvas(this.#video, this.#nco.renderer.canvas)
  }
}
