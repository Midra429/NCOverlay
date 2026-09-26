import type {
  PartData,
  PartResponse,
} from '@midra/nco-utils/types/api/danime/part'
import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { convertURL } from '@/utils/convertURL'
import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/page/checkVodEnable'
import { onPageMessage } from '@/messaging/page'

const vod: VodKey = 'dAnime'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_start',
  world: 'MAIN',
  main: () => void main(),
})

export interface DAnimePlaybackInfo {
  id: string
  data: PartData
}

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('page', vod)

  let playbackInfo: DAnimePlaybackInfo | null = null

  onPageMessage('page:dAnime:getPlaybackInfo', () => playbackInfo)

  // XMLHttpRequest
  const $send = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.send = function (body) {
    const $onload = this.onload

    this.onload = function (evt) {
      try {
        if (this.status !== 200) {
          throw new Error()
        }

        const { pathname, searchParams } = convertURL(this.responseURL)

        if (pathname === '/animestore/rest/WS010105') {
          const id = searchParams.get('partId')

          if (id) {
            const json: PartResponse = JSON.parse(this.responseText)
            const { data } = json

            playbackInfo = { id, data }
          }
        }
      } catch {}

      return $onload?.apply(this, [evt])
    }

    return $send.apply(this, [body])
  }
}
