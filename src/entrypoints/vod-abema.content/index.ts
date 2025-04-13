import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'
import { normalizeAll } from '@midra/nco-parser/normalize'

import { MATCHES } from '@/constants/matches'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { ncoApiProxy } from '@/proxy/nco-api/extension'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'abema'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

const main = async () => {
  if (!(await checkVodEnable(vod))) return

  logger.log(`vod-${vod}.js`)

  const getProgramId = async () => {
    let programId: string | undefined

    const { pathname } = location

    if (/^\/video\/episode\/.+$/.test(pathname)) {
      programId = pathname.split('/').at(-1)
    } else if (/^\/channels\/[^\/]+\/slots\/.+$/.test(pathname)) {
      const id = pathname.split('/').at(-1)
      const token = localStorage.getItem('abm_token')

      if (id && token) {
        const slot = await ncoApiProxy.abema.v1.media.slots(id, token)

        logger.log('abema.v1.media.slots:', slot)

        programId = slot?.displayProgramId
      }
    }

    return programId ?? null
  }

  const patcher = new NCOPatcher({
    vod,
    getInfo: async () => {
      const programId = await getProgramId()
      const token = localStorage.getItem('abm_token')

      if (!programId || !token) {
        return null
      }

      const program = await ncoApiProxy.abema.v1.video.programs(
        programId,
        token
      )

      logger.log('abema.v1.video.programs:', program)

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

      let episodeTitle: string | undefined

      if (workTitle !== program.episode.title) {
        episodeTitle = program.episode.title.replace(
          /^最終(?:回|話)(?=\s)/,
          `第${program.episode.number}話`
        )
      }

      const duration = program.info.duration

      logger.log('workTitle:', workTitle)
      logger.log('episodeTitle:', episodeTitle)
      logger.log('duration:', duration)

      return workTitle ? { workTitle, episodeTitle, duration } : null
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
      const { pathname } = location

      if (
        /^\/video\/episode\/.+$/.test(pathname) ||
        /^\/channels\/[^\/]+\/slots\/.+$/.test(pathname)
      ) {
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
