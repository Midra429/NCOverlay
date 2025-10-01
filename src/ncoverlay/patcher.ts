import type { ExtractedResult } from '@midra/nco-utils/parse/libs/extract'
import type { VodKey } from '@/types/constants'
import type { NCOSearcherAutoLoadArgs } from './searcher'

import { parse } from '@midra/nco-utils/parse'

import { logger } from '@/utils/logger'
import { settings } from '@/utils/settings/extension'

import { NCOverlay } from '.'
import { ncoMessenger } from './messaging'

export type PlayingInfo = {
  input: string
  duration: number
  disableExtract?: boolean
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
    autoLoad?: (nco: NCOverlay, args: NCOSearcherAutoLoadArgs) => Promise<void>
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

        let parsed: ExtractedResult | undefined
        let duration: NCOSearcherAutoLoadArgs['duration'] | undefined

        if (info) {
          duration = Math.floor(info.duration)

          if (info.disableExtract) {
            parsed = {
              ...parse(''),
              input: info.input,
              title: info.input,
              titleStripped: info.input,
            }
          } else {
            parsed = parse(info.input)
          }
        }

        const autoLoads = await settings.get('settings:comment:autoLoads')

        const args: NCOSearcherAutoLoadArgs = {
          input: parsed ?? '',
          duration: duration ?? 0,
          targets: {
            official: autoLoads.includes('official'),
            danime: autoLoads.includes('danime'),
            chapter: autoLoads.includes('chapter'),
            szbh: autoLoads.includes('szbh'),
          },
        }

        const stateInfo = { ...args }

        await this.#nco.state.set('vod', this.#vod)
        await this.#nco.state.set('info', stateInfo)

        logger.log('state.vod', this.#vod)
        logger.log('state.info', stateInfo)

        // 自動検索
        if (autoLoads.length && args.input && args.duration) {
          args.jikkyo = autoLoads.includes('jikkyo')
          args.jikkyoChannelIds = await settings.get(
            'settings:comment:jikkyoChannelIds'
          )

          if (this.#autoLoad) {
            await this.#autoLoad(this.#nco, args)
          } else {
            await this.#nco.searcher.autoLoad(args)
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
