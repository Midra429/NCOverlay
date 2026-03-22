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
import xhook from 'xhook'

import { MATCHES } from '@/constants/matches'
import { Queue } from '@/utils/queue'
import { onMessageInPage } from '@/messaging/to-page'

const vod: VodKey = 'primeVideo'

const MP4_URL_REGEXP = /\/([0-9a-f-]+)_video_\d+\.mp4$/
const MPD_URL_REGEXP = /\/([0-9a-f-]+)_corrected\.mpd$/i

export interface PlaybackUrlsQueueItem {
  titleId: string
  playbackUrls: PlaybackUrls
}

export interface CatalogQueueItem {
  entityId: string
  catalog: Catalog
}

function isGetVodPlaybackResources(
  req: xhook.Request,
  res: xhook.Response
): boolean {
  return (
    res.status === 200 &&
    res.headers['content-type'] === 'application/json' &&
    req.url.includes('/GetVodPlaybackResources')
  )
}

function isPlayerChromeResources(
  req: xhook.Request,
  res: xhook.Response
): boolean {
  return (
    res.status === 200 &&
    res.headers['content-type'] === 'application/json' &&
    req.url.includes('/playerChromeResources/')
  )
}

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_start',
  world: 'MAIN',
  main: () => {
    let currentMpdId: string | null = null

    const playbackUrlsQueue = new Queue<PlaybackUrlsQueueItem>(25)
    const catalogQueue = new Queue<CatalogQueueItem>(25)

    onMessageInPage('getCurrentData', () => {
      if (!currentMpdId) {
        return null
      }

      const playbackUrlsQueueItem = playbackUrlsQueue.find(
        ({ playbackUrls }) => {
          return playbackUrls.intraTitlePlaylist.some(({ urls }) => {
            return urls?.some(({ url }) => {
              const matched = url.match(MPD_URL_REGEXP)

              return matched?.[1] === currentMpdId
            })
          })
        }
      )

      if (!playbackUrlsQueueItem) {
        return null
      }

      const catalogQueueItem = catalogQueue.find(
        (v) => v.entityId === playbackUrlsQueueItem.titleId
      )

      if (!catalogQueueItem) {
        return null
      }

      return {
        ...playbackUrlsQueueItem,
        ...catalogQueueItem,
      }
    })

    xhook.after((req, res) => {
      try {
        const url = URL.canParse(req.url)
          ? new URL(req.url)
          : new URL(req.url, location.origin)
        const { pathname, search, searchParams } = url

        // .mp4
        if (pathname.endsWith('.mp4')) {
          const matched = pathname.match(MP4_URL_REGEXP)

          if (matched) {
            currentMpdId = matched[1]
          }
        }
        // GetVodPlaybackResources
        else if (isGetVodPlaybackResources(req, res)) {
          const titleId = searchParams.get('titleId')

          if (
            !titleId ||
            playbackUrlsQueue.find((v) => v.titleId === titleId)
          ) {
            return
          }

          const {
            vodPlaylistedPlaybackUrls: {
              result: { playbackUrls },
            },
          } = JSON.parse(res.text) as GetVodPlaybackResources

          playbackUrlsQueue.enqueue({ titleId, playbackUrls })
        }
        // playerChromeResources
        else if (isPlayerChromeResources(req, res)) {
          // catalogMetadataV2
          if (search.includes('catalogMetadataV2')) {
            const entityId = searchParams.get('entityId')

            if (
              !entityId ||
              catalogQueue.find((v) => v.entityId === entityId)
            ) {
              return
            }

            const {
              resources: {
                catalogMetadataV2: { catalog },
              },
            } = JSON.parse(res.text) as PlayerChromeResources

            catalogQueue.enqueue({ entityId, catalog })
          }
        }
      } catch {}
    })
  },
})
