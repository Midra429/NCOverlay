import type { ParsedResult } from '@midra/nco-utils/parse'
import type { VodKey } from '@/types/constants'
import type { VideoChapter } from '@/utils/api/jikkyo/findChapters'
import type { NCOSearcherAutoSearchArgs } from './searcher'
import type { StateFileDetail, StateInfo } from './state'

import { parse } from '@midra/nco-utils/parse'

import { logger } from '@/utils/logger'
import { settings } from '@/utils/settings/extension'
import { sendExtensionMessage } from '@/messaging/extension'

import { NCOverlay } from '.'

export interface PlayingInfo {
  input: string | ParsedResult
  duration: number
  chapters?: VideoChapter[]
  disableParse?: boolean
  disableAdjustJikkyoOffset?: boolean
  isNhkOndemand?: boolean
}

export interface NCOPatcherInit {
  getInfo: (nco: NCOverlay) => Promise<PlayingInfo | null>
  appendCanvas: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void
  autoSearch?: (
    nco: NCOverlay,
    args: NCOSearcherAutoSearchArgs & StateInfo
  ) => Promise<void>
}

export interface NCOPatcherFunctions {
  getCurrentTime?: () => number
}

export class NCOPatcher {
  readonly #vod
  readonly #init
  readonly #functions

  #tabId: number | null = null
  #video: HTMLVideoElement | null = null
  #nco: NCOverlay | null = null

  get nco() {
    return this.#nco
  }

  constructor(
    vod: VodKey,
    init: NCOPatcherInit,
    functions?: NCOPatcherFunctions
  ) {
    logger.log('new NCOPatcher()')

    this.#vod = vod
    this.#init = init
    this.#functions = functions
  }

  async dispose() {
    logger.log('NCOPatcher.dispose()')

    await this.#nco?.dispose()

    this.#video = null
    this.#nco = null
  }

  async setVideo(
    video: HTMLVideoElement,
    fileDetail: StateFileDetail | null = null
  ) {
    if (this.#video === video) return

    logger.log('NCOPatcher.setVideo()')

    this.#video = video

    if (this.#tabId === null) {
      const tab = await sendExtensionMessage('bg:getCurrentTab', null)

      this.#tabId = tab?.id!
    }

    await this.#nco?.dispose()

    this.#nco = new NCOverlay(this.#tabId, this.#video, this.#functions)

    this.#nco.state.set('vod', this.#vod)
    this.#nco.state.set('fileDetail', fileDetail)

    const loadInfo = async () => {
      if (!this.#nco) return

      logger.log('NCOPatcher.setVideo > loadInfo()')

      try {
        const info = await this.#init.getInfo(this.#nco)

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

        const args: StateInfo = {
          input: parsed ?? '',
          duration: info ? Math.floor(info.duration) : 0,
          chapters: info?.chapters,
          disableAdjustJikkyoOffset: info?.disableAdjustJikkyoOffset,
          isNhkOndemand: info?.isNhkOndemand,
        }

        await this.#nco.state.set('info', args)

        logger.log('state.info', args)
      } catch (err) {
        logger.error('NCOPatcher.setVideo > loadInfo()', err)
      }
    }

    const autoSearch = async () => {
      if (!this.#nco) return

      logger.log('NCOPatcher.setVideo > autoSearch()')

      const status = await this.#nco.state.get('status')

      if (status === 'searching' || status === 'loading') {
        return
      }

      await this.#nco.state.set('status', 'searching')

      try {
        const info = await this.#nco.state.get('info')

        const [targets, jikkyoChannelIds, jikkyoIgnoreRerun] =
          await settings.get(
            'autoSearch:targets',
            'autoSearch:jikkyoChannelIds',
            'autoSearch:jikkyoIgnoreRerun'
          )

        const args: (NCOSearcherAutoSearchArgs & StateInfo) | null = {
          input: '',
          duration: 0,
          targets,
          jikkyoChannelIds,
          jikkyoIgnoreRerun,
          ...info,
        }

        // 自動検索
        if (targets.length && args.input && args.duration) {
          if (this.#init.autoSearch) {
            await this.#init.autoSearch(this.#nco, args)
          } else {
            await this.#nco.searcher.autoSearch(args)
          }
        }
      } catch (err) {
        logger.error('NCOPatcher.setVideo > autoSearch()', err)
      }

      await this.#nco.state.set('status', 'ready')
    }

    let prev: number | null = null

    this.#nco.addEventListener('loadedmetadata', async function () {
      const now = performance.now()
      const isSkip = prev !== null && now - prev < 1000

      prev = now

      if (isSkip) return

      await this.clear()

      await loadInfo()

      if (await settings.get('autoSearch:manual')) return

      await autoSearch()
    })

    this.#nco.addEventListener('reload', async function () {
      await this.state.remove('status')
      await this.state.remove('slots', { isAutoLoaded: true })
      await this.state.remove('slotDetails', { isAutoLoaded: true })

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

        sendExtensionMessage('bg:timeupdate', {
          id: this.id,
          time: this.renderer.getCurrentTime() * 1000,
        })
      }
    })

    this.#init.appendCanvas(this.#nco.video, this.#nco.canvas)
  }
}
