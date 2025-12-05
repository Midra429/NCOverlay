import type { ParsedResult } from '@midra/nco-utils/parse'
import type { VodKey } from '@/types/constants'
import type { NCOSearcherAutoSearchArgs } from './searcher'

import { parse } from '@midra/nco-utils/parse'

import { logger } from '@/utils/logger'
import { settings } from '@/utils/settings/extension'

import { NCOverlay } from '.'
import { ncoMessenger } from './messaging'

export interface PlayingInfo {
  input: string | ParsedResult
  duration: number
  disableParse?: boolean
}

export class NCOPatcher {
  readonly #vod
  readonly #getInfo
  readonly #appendCanvas
  readonly #autoSearch

  #video: HTMLVideoElement | null = null
  #nco: NCOverlay | null = null

  get nco() {
    return this.#nco
  }

  constructor(
    vod: VodKey,
    init: {
      getInfo: (nco: NCOverlay) => Promise<PlayingInfo | null>
      appendCanvas: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void
      autoSearch?: (
        nco: NCOverlay,
        args: NCOSearcherAutoSearchArgs
      ) => Promise<void>
    }
  ) {
    this.#vod = vod
    this.#getInfo = init.getInfo
    this.#appendCanvas = init.appendCanvas
    this.#autoSearch = init.autoSearch
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

    this.#nco.state.set('vod', this.#vod)

    const loadInfo = async () => {
      if (!this.#nco) return

      try {
        const info = await this.#getInfo(this.#nco)

        let parsed: ParsedResult | undefined

        if (info) {
          const { input } = info

          if (info.disableParse) {
            parsed =
              typeof input === 'string'
                ? {
                    ...parse(''),
                    input: input,
                    title: input,
                    titleStripped: input,
                  }
                : input
          } else {
            parsed = parse(input)
          }
        }

        const args: Partial<NCOSearcherAutoSearchArgs> = {
          input: parsed ?? '',
          duration: info ? Math.floor(info.duration) : 0,
        }

        await this.#nco.state.set('info', args)

        logger.log('state.info', args)
      } catch (err) {
        logger.error('patcher:loadInfo', err)
      }
    }

    const autoSearch = async () => {
      if (!this.#nco) return

      const status = await this.#nco.state.get('status')

      if (status === 'searching' || status === 'loading') {
        return
      }

      await this.#nco.state.set('status', 'searching')

      try {
        const info = await this.#nco.state.get('info')

        const [targets, jikkyoChannelIds] = await settings.get(
          'settings:autoSearch:targets',
          'settings:autoSearch:jikkyoChannelIds'
        )

        const args: NCOSearcherAutoSearchArgs | null = {
          input: '',
          duration: 0,
          targets,
          jikkyoChannelIds,
          ...info,
        }

        // 自動検索
        if (targets.length && args.input && args.duration) {
          if (this.#autoSearch) {
            await this.#autoSearch(this.#nco, args)
          } else {
            await this.#nco.searcher.autoSearch(args)
          }
        }
      } catch (err) {
        logger.error('patcher:autoSearch', err)
      }

      await this.#nco.state.set('status', 'ready')
    }

    this.#nco.addEventListener('loadedmetadata', async function () {
      await this.clear()

      await loadInfo()

      if (await settings.get('settings:autoSearch:manual')) return

      await autoSearch()
    })

    this.#nco.addEventListener('reload', async function () {
      await Promise.all([
        this.state.remove('status'),
        this.state.remove('slots', { isAutoLoaded: true }),
        this.state.remove('slotDetails', { isAutoLoaded: true }),
      ])

      await loadInfo()
      await autoSearch()
    })

    const intervalMs = 250
    let lastTime = performance.now()

    this.#nco.addEventListener('timeupdate', function () {
      const time = performance.now()
      const delta = time - lastTime

      if (intervalMs < delta) {
        lastTime = time - (delta % intervalMs)

        ncoMessenger
          .sendMessage('timeupdate', {
            id: this.id,
            time: this.renderer.video.currentTime * 1000,
          })
          .catch(() => {})
      }
    })

    this.#appendCanvas(this.#video, this.#nco.renderer.canvas)
  }
}
