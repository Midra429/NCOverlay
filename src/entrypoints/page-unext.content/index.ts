import type { VodKey } from '@/types/constants'
import type {
  GetPlaylistUrl,
  MoviePartsPositionList,
} from '@/types/vod/unext/getPlaylistUrl'
import type {
  EpisodeElement,
  GetTitle,
  WebfrontTitleStage,
} from '@/types/vod/unext/getTitle'

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

const TITLE_EP_ID_REGEXP = /\/play\/(?<titleId>[^\/]+)\/(?<episodeId>[^\/]+)/

export interface UnextPlaybackInfo {
  titleStage: WebfrontTitleStage
  titleEpisodes: EpisodeElement[]
  positionList: MoviePartsPositionList[]
}

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('page', vod)

  const titleStageQueue = new LRUQueue<WebfrontTitleStage>(25)
  const titleEpisodesQueue = new LRUQueue<EpisodeElement[]>(25)
  const positionListQueue = new LRUQueue<MoviePartsPositionList[]>(25)

  onPageMessage('page:unext:getPlaybackInfo', async () => {
    const groups = location.pathname.match(TITLE_EP_ID_REGEXP)?.groups
    const { titleId, episodeId } = groups ?? {}

    if (!titleId || !episodeId) {
      return null
    }

    const titleEpId = `${titleId}/${episodeId}`

    const titleStage = titleStageQueue.get(titleEpId)
    const titleEpisodes = titleEpisodesQueue.get(titleId)
    const positionList = positionListQueue.get(episodeId)

    if (!titleStage || !titleEpisodes || !positionList) {
      return null
    }

    return { titleStage, titleEpisodes, positionList }
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
              data: {
                webfront_title_stage,
                webfront_title_titleEpisodes: { episodes },
              },
            } = json

            const titleId = webfront_title_stage.id
            const episodeId = webfront_title_stage.episode.id
            const titleEpId = `${titleId}/${episodeId}`

            if (!titleStageQueue.hit(titleEpId)) {
              titleStageQueue.add(titleEpId, webfront_title_stage)
            }

            if (!titleEpisodesQueue.hit(titleId)) {
              titleEpisodesQueue.add(titleId, episodes)
            }

            break
          }

          case 'cosmo_getPlaylistUrl': {
            response = await promise

            const json: GetPlaylistUrl = await response.clone().json()
            const {
              data: {
                webfront_playlistUrl: {
                  urlInfo: [{ moviePartsPositionList }],
                },
              },
            } = json

            const episodeId = variables.code as string

            if (!positionListQueue.hit(episodeId)) {
              positionListQueue.add(episodeId, moviePartsPositionList)
            }

            break
          }
        }
      } catch {}

      return response ?? promise
    },
  })
}
