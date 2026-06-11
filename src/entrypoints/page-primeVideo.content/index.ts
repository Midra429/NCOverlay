import type { VodKey } from '@/types/constants'
import type {
  GetVodPlaybackResources,
  PlaybackUrls,
} from '@/types/vod/primeVideo/getVodPlaybackResources'
import type {
  Catalog,
  PlayerChromeResources,
} from '@/types/vod/primeVideo/playerChromeResources'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import { LRUQueue } from '@/utils/queue'
import { querySelectorAsync } from '@/utils/dom/querySelectorAsync'
import { checkVodEnable } from '@/utils/extension/page/checkVodEnable'
import { onPageMessage } from '@/messaging/page'

const vod: VodKey = 'primeVideo'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_start',
  world: 'MAIN',
  main: () => void main(),
})

// "シーズン1、エピソード1 サブタイトル"
const SUBTITLE_REGEXP =
  /^シーズン(?<season>\d+)、エピソード(?<episode>\d+)\s(?<subtitle>.+)$/
// "S1 E1 サブタイトル"
const SUBTITLE_SHORT_REGEXP =
  /^S(?<season>\d+)\sE(?<episode>\d+)\s(?<subtitle>.+)$/

export interface GetCurrentData {
  id: string
  playbackUrls: PlaybackUrls
  catalog: Catalog
}

function convertURL(input: string): URL {
  return new URL(input, URL.canParse(input) ? undefined : location.href)
}

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('page', vod)

  const playbackUrlsQueue = new LRUQueue<PlaybackUrls>(25)
  const catalogQueue = new LRUQueue<Catalog>(25)

  onPageMessage('page:primeVideo:getCurrentData', async () => {
    const titleTextElem = await querySelectorAsync(
      document.body,
      '.dv-player-fullscreen .atvwebplayersdk-title-text:not(:empty)'
    )
    const subtitleTextElem = document.body.querySelector(
      '.dv-player-fullscreen :is(.atvwebplayersdk-subtitle-text, .atvwebplayersdk-episode-info)'
    )

    // タイトル
    const titleText = titleTextElem?.textContent ?? null
    // "シーズン1、エピソード1 サブタイトル" or "S1 E1 サブタイトル"
    const subtitleText = subtitleTextElem?.textContent ?? null

    logger.log('titleText', titleText)
    logger.log('subtitleText', subtitleText)

    if (!titleText) {
      return null
    }

    const {
      season,
      episode,
      subtitle,
    }: {
      season?: string
      episode?: string
      subtitle?: string
    } =
      (
        subtitleText?.match(SUBTITLE_REGEXP) ??
        subtitleText?.match(SUBTITLE_SHORT_REGEXP)
      )?.groups ?? {}

    const seasonNum = season ? Number(season) : -1
    const episodeNum = episode ? Number(episode) : -1

    const catalogQueueItem = catalogQueue.find((val) => {
      if (val.type === 'MOVIE') {
        return val.title === titleText && !subtitleText
      } else {
        return (
          val.seriesTitle === titleText &&
          val.seasonNumber === seasonNum &&
          val.episodeNumber === episodeNum &&
          val.title === subtitle
        )
      }
    })

    if (!catalogQueueItem) {
      return null
    }

    const id = catalogQueueItem[0]
    const catalog = catalogQueueItem[1]
    const playbackUrls = playbackUrlsQueue.get(id)

    if (!playbackUrls) {
      return null
    }

    return { id, playbackUrls, catalog }
  })

  // fetch
  window.fetch = new Proxy(window.fetch, {
    apply: async (
      target,
      thisArg,
      argArray: Parameters<typeof window.fetch>
    ) => {
      const promise = Reflect.apply(target, thisArg, argArray)
      let response: Response | undefined

      try {
        const [input] = argArray

        if (typeof input !== 'string') {
          throw new Error()
        }

        const { pathname, search, searchParams } = convertURL(input)

        // GetVodPlaybackResources
        if (pathname.endsWith('/GetVodPlaybackResources')) {
          const titleId = searchParams.get('titleId')

          if (titleId && !playbackUrlsQueue.hit(titleId)) {
            response = await promise

            const json: GetVodPlaybackResources = await response.clone().json()
            const {
              vodPlaylistedPlaybackUrls: {
                result: { playbackUrls },
              },
            } = json

            playbackUrlsQueue.add(titleId, playbackUrls)
          }
        }
        // playerChromeResources
        else if (pathname.endsWith('/playerChromeResources/v1')) {
          // catalogMetadataV2
          if (search.includes('catalogMetadataV2')) {
            const entityId = searchParams.get('entityId')

            if (entityId && !catalogQueue.hit(entityId)) {
              response = await promise

              const json: PlayerChromeResources = await response.clone().json()
              const {
                resources: {
                  catalogMetadataV2: { catalog },
                },
              } = json

              catalogQueue.add(entityId, catalog)
            }
          }
        }
      } catch {}

      return response ?? promise
    },
  })

  // XMLHttpRequest
  const $send = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.send = function (body) {
    const $onload = this.onload

    this.onload = function (evt) {
      try {
        if (this.status !== 200) {
          throw new Error()
        }

        const { pathname, search, searchParams } = convertURL(this.responseURL)

        // GetVodPlaybackResources
        if (pathname.endsWith('/GetVodPlaybackResources')) {
          const titleId = searchParams.get('titleId')

          if (titleId && !playbackUrlsQueue.hit(titleId)) {
            const json: GetVodPlaybackResources = JSON.parse(this.responseText)
            const {
              vodPlaylistedPlaybackUrls: {
                result: { playbackUrls },
              },
            } = json

            playbackUrlsQueue.add(titleId, playbackUrls)
          }
        }
        // playerChromeResources
        else if (pathname.endsWith('/playerChromeResources/v1')) {
          // catalogMetadataV2
          if (search.includes('catalogMetadataV2')) {
            const entityId = searchParams.get('entityId')

            if (entityId && !catalogQueue.hit(entityId)) {
              const json: PlayerChromeResources = JSON.parse(this.responseText)
              const {
                resources: {
                  catalogMetadataV2: { catalog },
                },
              } = json

              catalogQueue.add(entityId, catalog)
            }
          }
        }
      } catch {}

      return $onload?.apply(this, [evt])
    }

    return $send.apply(this, [body])
  }
}
