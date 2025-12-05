import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'
import { parse } from '@midra/nco-utils/parse'

import { MATCHES } from '@/constants/matches'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const EP_TITLE_LAST_REGEXP = /最終(?:回|話)/

const vod: VodKey = 'dAnime'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('vod', vod)

  const video = document.body.querySelector<HTMLVideoElement>('video#video')

  if (!video) return

  const patcher = new NCOPatcher(vod, {
    getInfo: async () => {
      const partId = new URL(location.href).searchParams.get('partId')
      const partData = partId ? await ncoApiProxy.danime.part(partId) : null

      logger.log('danime.part', partData)

      if (!partData) {
        return null
      }

      let workTitle = partData.workTitle
      let episodeText = partData.partDispNumber

      if (partData.partDispNumber === '本編') {
        episodeText = ''
      } else if (
        EP_TITLE_LAST_REGEXP.test(partData.partDispNumber) &&
        partData.prevTitle
      ) {
        const parsed = parse(partData.prevTitle)

        if (parsed.isSingleEpisode && parsed.episode) {
          episodeText = `${parsed.episode.number + 1}話`
        }
      }

      const episodeTitle = [episodeText, partData.partTitle]
        .filter(Boolean)
        .join(' ')
        .trim()

      const duration = partData.partMeasureSecond

      logger.log('workTitle', workTitle)
      logger.log('episodeTitle', episodeTitle)
      logger.log('duration', duration)

      return workTitle
        ? {
            input: `${workTitle} ${episodeTitle}`,
            duration,
          }
        : null
    },
    appendCanvas: (video, canvas) => {
      video.insertAdjacentElement('afterend', canvas)
    },
  })

  patcher.setVideo(video)
}
