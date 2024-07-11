import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import { ncoApi } from '@midra/nco-api'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

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
      const program = id ? await ncoApi.abema.program(id) : null

      Logger.log('abema.program', program)

      if (program?.genre.id !== 'animation') {
        return null
      }

      const seriesTitle = program.series.title

      let workTitle = seriesTitle

      if (program.season && 1 < program.season.sequence) {
        if (program.season.name.includes(seriesTitle)) {
          workTitle = program.season.name
        } else {
          workTitle = `${seriesTitle} ${program.season.name}`
        }
      }

      let episode = ''

      if (workTitle !== program.episode.title) {
        episode = program.episode.title
      }

      const title = `${workTitle} ${episode}`.trim()
      const duration = program.info.duration

      Logger.log('title', title)
      Logger.log('duration', duration)

      return { title, duration }
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
          '.com-a-Video__video > video[preload="metadata"][src]'
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
