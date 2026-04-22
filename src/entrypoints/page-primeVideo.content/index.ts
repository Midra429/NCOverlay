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
import { checkVodEnable } from '@/utils/extension/page/checkVodEnable'
import { onMessageInPage } from '@/messaging/to-page'

const vod: VodKey = 'primeVideo'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_start',
  world: 'MAIN',
  main: () => void main(),
})

const MP4_URL_REGEXP = /\/([0-9a-f-]+)_video_\d+\.mp4$/
const MPD_URL_REGEXP = /\/([0-9a-f-]+)_corrected\.mpd$/i
// "シーズン1、エピソード1 サブタイトル"
const SUBTITLE_REGEXP =
  /^シーズン(?<season>\d+)、エピソード(?<episode>\d+)\s(?<subtitle>.+)$/

export interface GetCurrentData {
  id: string
  playbackUrls: PlaybackUrls
  catalog: Catalog
}

function isGetVodPlaybackResources(xhr: XMLHttpRequest): boolean {
  return (
    xhr.status === 200 && xhr.responseURL.includes('/GetVodPlaybackResources')
  )
}

function isPlayerChromeResources(xhr: XMLHttpRequest): boolean {
  return (
    xhr.status === 200 && xhr.responseURL.includes('/playerChromeResources/')
  )
}

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('page', vod)

  let mpdId: string | null = null

  const playbackUrlsQueue = new LRUQueue<PlaybackUrls>(25)
  const catalogQueue = new LRUQueue<Catalog>(25)

  onMessageInPage('getCurrentData', () => {
    let id: string | undefined
    let playbackUrls: PlaybackUrls | undefined
    let catalog: Catalog | undefined

    if (mpdId) {
      const playbackUrlsQueueItem = playbackUrlsQueue.find((playbackUrls) => {
        return playbackUrls.intraTitlePlaylist.some(({ urls }) => {
          return urls?.some(({ url }) => {
            const matched = url.match(MPD_URL_REGEXP)

            return matched?.[1] === mpdId
          })
        })
      })

      if (playbackUrlsQueueItem) {
        id = playbackUrlsQueueItem[0]
        playbackUrls = playbackUrlsQueueItem[1]
        catalog = catalogQueue.get(id)
      }
    }

    if (!catalog) {
      // タイトル
      const titleText = document.body.querySelector(
        '.atvwebplayersdk-title-text'
      )?.textContent
      // シーズン1、エピソード1 サブタイトル
      const subtitleText = document.body.querySelector(
        '.atvwebplayersdk-subtitle-text'
      )?.textContent

      logger.log('titleText', titleText)
      logger.log('subtitleText', subtitleText)

      if (!titleText || !subtitleText) {
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
      } = subtitleText.match(SUBTITLE_REGEXP)?.groups ?? {}

      const seasonNum = season ? Number(season) : -1
      const episodeNum = episode ? Number(episode) : -1

      const catalogQueueItem = catalogQueue.find((val) => {
        return (
          val.seriesTitle === titleText &&
          val.seasonNumber === seasonNum &&
          val.episodeNumber === episodeNum &&
          val.title === subtitle
        )
      })

      if (catalogQueueItem) {
        id = catalogQueueItem[0]
        catalog = catalogQueueItem[1]
        playbackUrls = playbackUrlsQueue.get(id)
      }
    }

    if (!id || !playbackUrls || !catalog) {
      return null
    }

    return { id, playbackUrls, catalog }
  })

  const $send = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.send = function (body) {
    const $onload = this.onload

    this.onload = function (evt) {
      try {
        const url = URL.canParse(this.responseURL)
          ? new URL(this.responseURL)
          : new URL(this.responseURL, location.origin)
        const { pathname, search, searchParams } = url

        // .mp4
        if (pathname.endsWith('.mp4')) {
          const matched = pathname.match(MP4_URL_REGEXP)

          if (matched) {
            mpdId = matched[1]
          }
        }
        // GetVodPlaybackResources
        else if (isGetVodPlaybackResources(this)) {
          const titleId = searchParams.get('titleId')

          if (titleId && !playbackUrlsQueue.hit(titleId)) {
            const {
              vodPlaylistedPlaybackUrls: {
                result: { playbackUrls },
              },
            } = JSON.parse(this.responseText) as GetVodPlaybackResources

            playbackUrlsQueue.add(titleId, playbackUrls)
          }
        }
        // playerChromeResources
        else if (isPlayerChromeResources(this)) {
          // catalogMetadataV2
          if (search.includes('catalogMetadataV2')) {
            const entityId = searchParams.get('entityId')

            if (entityId && !catalogQueue.hit(entityId)) {
              const {
                resources: {
                  catalogMetadataV2: { catalog },
                },
              } = JSON.parse(this.responseText) as PlayerChromeResources

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
