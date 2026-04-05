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
import { Queue } from '@/utils/queue'
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

export interface PlaybackUrlsQueueItem {
  titleId: string
  playbackUrls: PlaybackUrls
}

export interface CatalogQueueItem {
  entityId: string
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

function main() {
  let currentMpdId: string | null = null

  const playbackUrlsQueue = new Queue<PlaybackUrlsQueueItem>(25)
  const catalogQueue = new Queue<CatalogQueueItem>(25)

  onMessageInPage('getCurrentData', () => {
    if (!currentMpdId) {
      return null
    }

    const playbackUrlsQueueItem = playbackUrlsQueue.find(({ playbackUrls }) => {
      return playbackUrls.intraTitlePlaylist.some(({ urls }) => {
        return urls?.some(({ url }) => {
          const matched = url.match(MPD_URL_REGEXP)

          return matched?.[1] === currentMpdId
        })
      })
    })

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
            currentMpdId = matched[1]
          }
        }
        // GetVodPlaybackResources
        else if (isGetVodPlaybackResources(this)) {
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
          } = JSON.parse(this.responseText) as GetVodPlaybackResources

          playbackUrlsQueue.enqueue({ titleId, playbackUrls })
        }
        // playerChromeResources
        else if (isPlayerChromeResources(this)) {
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
            } = JSON.parse(this.responseText) as PlayerChromeResources

            catalogQueue.enqueue({ entityId, catalog })
          }
        }
      } catch {}

      return $onload?.apply(this, [evt])
    }

    return $send.apply(this, [body])
  }
}
