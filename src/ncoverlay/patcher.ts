import type { BuildSearchQueryInput } from '@midra/nco-api/search/lib/buildSearchQuery'
import type { VodKey } from '@/types/constants'
import type { NCOSearcherAutoLoadOptions } from './searcher'

import { ncoParser } from '@midra/nco-parser'

import { logger } from '@/utils/logger'
import { settings } from '@/utils/settings/extension'

import { NCOverlay } from '.'
import { ncoMessenger } from './messaging'

export type PlayingInfo =
  | {
      rawText: string
      duration: number
      disableExtract?: boolean
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
  readonly #autoLoad

  #video: HTMLVideoElement | null = null
  #nco: NCOverlay | null = null

  get nco() {
    return this.#nco
  }

  constructor(init: {
    vod: VodKey
    getInfo: (nco: NCOverlay) => Promise<PlayingInfo | null>
    appendCanvas: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void
    autoLoad?: (
      nco: NCOverlay,
      input: BuildSearchQueryInput,
      options: NCOSearcherAutoLoadOptions
    ) => Promise<void>
  }) {
    this.#vod = init.vod
    this.#getInfo = init.getInfo
    this.#appendCanvas = init.appendCanvas
    this.#autoLoad = init.autoLoad
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

            if (!info.disableExtract) {
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
              delete info.disableExtract
            }
          } else {
            const { title, season } = ncoParser.extract(`${info.workTitle} #01`)

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
            title: extracted.title ?? undefined,
            seasonText: extracted.season?.text,
            seasonNumber: extracted.season?.number,
            episodeText: extracted.episode?.text,
            episodeNumber: extracted.episode?.number,
            subtitle: extracted.subtitle ?? undefined,
            duration: info.duration,
          }
        }

        const parsed = { ...info, ...input }

        await this.#nco.state.set('vod', this.#vod)
        await this.#nco.state.set('info', parsed)

        logger.log('state.vod:', this.#vod)
        logger.log('state.info:', parsed)

        const autoLoads = await settings.get('settings:comment:autoLoads')

        // 自動検索
        if (autoLoads.length && input) {
          const jikkyoChannelIds = await settings.get(
            'settings:comment:jikkyoChannelIds'
          )

          const options: NCOSearcherAutoLoadOptions = {
            official: autoLoads.includes('official'),
            danime: autoLoads.includes('danime'),
            chapter: autoLoads.includes('chapter'),
            szbh: autoLoads.includes('szbh'),
            jikkyo: autoLoads.includes('jikkyo'),
            jikkyoChannelIds,
          }

          if (this.#autoLoad) {
            await this.#autoLoad(this.#nco, input, options)
          } else {
            await this.#nco.searcher.autoLoad(input, options)
          }
        }
      } catch (err) {
        logger.error('patcher:load', err)
      }

      await this.#nco.state.set('status', 'ready')
    }

    this.#nco.addEventListener('loadedmetadata', async function () {
      await this.clear()

      load()
    })

    this.#nco.addEventListener('reload', async function () {
      await Promise.all([
        this.state.remove('status'),
        this.state.remove('slots', { isAutoLoaded: true }),
        this.state.remove('slotDetails', { isAutoLoaded: true }),
      ])

      load()
    })

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
