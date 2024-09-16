import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import { episode as extractEpisode } from '@midra/nco-parser/extract/lib/episode'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { injectScript } from '@/utils/dom/injectScript'
import { ncoApiProxy } from '@/proxy/nco-api'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'dAnime'

export default defineContentScript({
  matches: ['*://animestore.docomo.ne.jp/animestore/*'],
  runAt: 'document_end',
  main: () => void main(),
})

const main = async () => {
  if (!(await checkVodEnable(vod))) return

  logger.log(`vod-${vod}.js`)

  injectScript('/content-scripts/plugin-dAnime.js')

  const video = document.body.querySelector<HTMLVideoElement>('video#video')

  if (!video) return

  const patcher = new NCOPatcher({
    vod,
    getInfo: async () => {
      const partId = new URL(location.href).searchParams.get('partId')
      const partData = partId ? await ncoApiProxy.danime.part(partId) : null

      logger.log('danime.part:', partData)

      if (!partData) {
        return null
      }

      let workTitle = partData.workTitle
      let episodeText = partData.partDispNumber

      if (partData.partDispNumber === '本編') {
        episodeText = ''
      } else if (
        /最終(?:回|話)/.test(partData.partDispNumber) &&
        partData.prevTitle
      ) {
        const [episode] = extractEpisode(partData.prevTitle)

        if (episode) {
          episodeText = `${episode.number + 1}話`
        }
      }

      const episodeTitle =
        [episodeText, partData.partTitle].filter(Boolean).join(' ').trim() ||
        null

      const duration = partData.partMeasureSecond

      logger.log('workTitle:', workTitle)
      logger.log('episodeTitle:', episodeTitle)
      logger.log('duration:', duration)

      return workTitle ? { workTitle, episodeTitle, duration } : null
    },
    appendCanvas: (video, canvas) => {
      video.insertAdjacentElement('afterend', canvas)
    },
  })

  patcher.setVideo(video)
}
