import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import { episode as extractEpisode } from '@midra/nco-parser/extract/lib/episode'
import { ncoApi } from '@midra/nco-api'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { injectScript } from '@/utils/dom/injectScript'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'dAnime'

export default defineContentScript({
  matches: ['https://animestore.docomo.ne.jp/animestore/*'],
  runAt: 'document_end',
  main: () => void main(),
})

const main = async () => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  injectScript('/content-scripts/plugin-dAnime.js')

  const video = document.body.querySelector<HTMLVideoElement>('video#video')

  if (!video) return

  const patcher = new NCOPatcher({
    getInfo: async () => {
      const partId = new URL(location.href).searchParams.get('partId')
      const partData = partId ? await ncoApi.danime.part(partId) : null

      Logger.log('danime.part', partData)

      if (!partData) {
        return null
      }

      let title = partData.title

      if (partData.partDispNumber === '本編') {
        title = partData.workTitle
      } else if (
        /最終(?:回|話)/.test(partData.partDispNumber) &&
        partData.prevTitle
      ) {
        const [episode] = extractEpisode(partData.prevTitle)

        if (episode) {
          title = [
            partData.workTitle,
            `${episode.number + 1}話`,
            partData.partTitle,
          ]
            .flatMap((v) => v || [])
            .join(' ')
            .trim()
        }
      }

      const duration = partData.partMeasureSecond

      Logger.log('title', title)
      Logger.log('duration', duration)

      return { title, duration }
    },
    appendCanvas: (video, canvas) => {
      video.insertAdjacentElement('afterend', canvas)
    },
  })

  patcher.setVideo(video)
}
