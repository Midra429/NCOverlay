import type { VodKey } from '@/types/constants'
import type {
  EpisodeHistory,
  GetLibraryTop,
} from '@/types/vod/unext/getLibraryTop'
import type {
  GetPlaylistUrl,
  WebfrontPlaylistUrl,
} from '@/types/vod/unext/getPlaylistUrl'
import type { GetPostPlay, NextEpisode } from '@/types/vod/unext/getPostPlay'
import type { GetTitle, WebfrontTitleStage } from '@/types/vod/unext/getTitle'
import type {
  Episode,
  GetVideoTitleEpisodes,
} from '@/types/vod/unext/getVideoTitleEpisodes'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { convertURL } from '@/utils/convertURL'
import { logger } from '@/utils/logger'
import { LRUQueue } from '@/utils/queue'
import { checkVodEnable } from '@/utils/extension/page/checkVodEnable'
import { onPageMessage } from '@/messaging/page'

const vod: VodKey = 'unext'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_start',
  world: 'MAIN',
  main: () => void main(),
})

const TITLE_EP_CODE_REGEXP =
  /\/play\/(?<titleCode>[^\/]+)\/(?<episodeCode>[^\/]+)/

export interface UnextPlaybackInfo {
  titleStage: WebfrontTitleStage
  playlistUrl: WebfrontPlaylistUrl
  nextEpisode?: NextEpisode
  episode?: Episode | EpisodeHistory
}

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('page', vod)

  const titleStageQueue = new LRUQueue<WebfrontTitleStage>(25)
  const playlistUrlQueue = new LRUQueue<WebfrontPlaylistUrl>(25)
  const nextEpisodeQueue = new LRUQueue<NextEpisode>(25)
  const episodeQueue = new LRUQueue<Episode | EpisodeHistory>(25)

  onPageMessage('page:unext:getPlaybackInfo', async () => {
    const groups = location.pathname.match(TITLE_EP_CODE_REGEXP)?.groups
    const { titleCode, episodeCode } = groups ?? {}

    if (!titleCode || !episodeCode) {
      return null
    }

    const titleEpId = `${titleCode}/${episodeCode}`

    const titleStage = titleStageQueue.get(titleEpId)
    const playlistUrl = playlistUrlQueue.get(episodeCode)
    const nextEpisode = nextEpisodeQueue.get(episodeCode)
    const episode = episodeQueue.get(episodeCode)

    if (!titleStage || !playlistUrl) {
      return null
    }

    return { titleStage, playlistUrl, nextEpisode, episode }
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

        const { hostname, searchParams } = convertURL(input)

        if (hostname !== 'cc.unext.jp') {
          throw new Error()
        }

        const operationName = searchParams.get('operationName')
        const variables = JSON.parse(searchParams.get('variables') ?? '{}')

        switch (operationName) {
          case 'cosmo_getTitle': {
            response = await promise

            const json: GetTitle = await response.clone().json()
            const {
              data: { webfront_title_stage },
            } = json

            const titleCode = webfront_title_stage.id
            const episodeCode = webfront_title_stage.episode.id
            const titleEpCode = `${titleCode}/${episodeCode}`

            if (!titleStageQueue.hit(titleEpCode)) {
              titleStageQueue.add(titleEpCode, webfront_title_stage)
            }

            break
          }

          case 'cosmo_getPlaylistUrl': {
            response = await promise

            const json: GetPlaylistUrl = await response.clone().json()
            const {
              data: { webfront_playlistUrl },
            } = json

            const episodeCode = variables.code as string

            if (!playlistUrlQueue.hit(episodeCode)) {
              playlistUrlQueue.add(episodeCode, webfront_playlistUrl)
            }

            break
          }

          case 'cosmo_getPostPlay': {
            response = await promise

            const json: GetPostPlay = await response.clone().json()
            const {
              data: {
                webfront_postPlay: { nextEpisode },
              },
            } = json

            if (!nextEpisode) break

            const episodeCode = variables.code as string

            if (!nextEpisodeQueue.hit(episodeCode)) {
              nextEpisodeQueue.add(episodeCode, nextEpisode)
            }

            break
          }

          // 作品ページ
          case 'cosmo_getVideoTitleEpisodes': {
            response = await promise

            const json: GetVideoTitleEpisodes = await response.clone().json()
            const {
              data: {
                webfront_title_titleEpisodes: { episodes },
              },
            } = json

            for (const episode of episodes) {
              if (!episodeQueue.hit(episode.id)) {
                episodeQueue.add(episode.id, episode)
              }
            }

            break
          }

          // ライブラリ
          case 'cosmo_getLibraryTop': {
            response = await promise

            const json: GetLibraryTop = await response.clone().json()
            const {
              data: { episodeHistory },
            } = json

            for (const history of episodeHistory) {
              if (!episodeQueue.hit(history.id)) {
                episodeQueue.add(history.id, history)
              }
            }

            break
          }
        }
      } catch {}

      return response ?? promise
    },
  })
}
