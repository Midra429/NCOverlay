import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import { normalizeAll } from '@midra/nco-parser/normalize'
import * as abemaApi from '@midra/nco-api/abema'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'abema'

export default defineContentScript({
  matches: ['https://abema.tv/*'],
  runAt: 'document_end',
  main: () => void main(),
})

const main = async () => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    vod,
    getInfo: async () => {
      const id = location.pathname.split('/').at(-1)
      const token = localStorage.getItem('abm_token')

      if (!id || !token) {
        return null
      }

      const program = await abemaApi.program(id, token)

      Logger.log('abema.program', program)

      if (program?.genre.id !== 'animation') {
        return null
      }

      const seriesTitle = program.series.title

      let workTitle = seriesTitle

      if (program.season && 1 < program.season.sequence) {
        const normalizedSeasonName = normalizeAll(program.season.name)
        const normalizedSeriesTitle = normalizeAll(seriesTitle)

        if (normalizedSeasonName.includes(normalizedSeriesTitle)) {
          workTitle = program.season.name
        } else {
          workTitle = `${seriesTitle} ${program.season.name}`
        }
      }

      let episodeTitle = ''

      if (workTitle !== program.episode.title) {
        episodeTitle = program.episode.title
      }

      const rawText = `${workTitle} ${episodeTitle}`.trim()
      const duration = program.info.duration

      Logger.log('rawText', rawText)
      Logger.log('duration', duration)

      return { rawText, duration }
    },
    appendCanvas: (video, canvas) => {
      video
        .closest<HTMLElement>('.com-vod-VODScreen__player')
        ?.appendChild(canvas)
    },
  })

  const obs_config: MutationObserverInit = {
    childList: true,
    subtree: true,
  }
  const obs = new MutationObserver(() => {
    obs.disconnect()

    if (patcher.nco && !document.body.contains(patcher.nco.renderer.video)) {
      patcher.dispose()
    } else if (!patcher.nco) {
      if (location.pathname.startsWith('/video/episode/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          '.com-a-Video__video > video[preload][src]'
        )

        if (video) {
          patcher.setVideo(video)
        }
      }
    }

    obs.observe(document.body, obs_config)
  })

  obs.observe(document.body, obs_config)
}
