import type { VodKey } from '@/types/constants'
import type {
  GetPlaylistUrl,
  MoviePartsPositionList,
} from '@/types/vod/unext/getPlaylistUrl'
// import type { GetTitle, WebfrontTitleStage } from '@/types/vod/unext/getTitle'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { convertURL } from '@/utils/convertURL'
import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/page/checkVodEnable'
import { onPageMessage } from '@/messaging/page'

const vod: VodKey = 'unext'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_start',
  world: 'MAIN',
  main: () => void main(),
})

export interface UnextPlaybackInfo {
  // titleStage: WebfrontTitleStage
  positionList: MoviePartsPositionList[]
}

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('page', vod)

  // let titleStage: WebfrontTitleStage | null = null
  let positionList: MoviePartsPositionList[] | null = null

  onPageMessage('page:unext:getPlaybackInfo', async () => {
    if (!positionList) {
      return null
    }

    return { positionList }
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

        switch (operationName) {
          case 'cosmo_getTitle': {
            // titleStage = null
            positionList = null

            // response = await promise

            // const json: GetTitle = await response.clone().json()
            // const {
            //   data: { webfront_title_stage },
            // } = json

            // titleStage = webfront_title_stage

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

            positionList = moviePartsPositionList

            break
          }
        }
      } catch {}

      return response ?? promise
    },
  })
}
