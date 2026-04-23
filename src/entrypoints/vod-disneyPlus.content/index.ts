import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import { sleep } from '@/utils/sleep'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'disneyPlus'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

// "S1：第1話「サブタイトル」"
const SUBTITLE_REGEXP =
  /^S(?<season>\d+)：第(?<episode>\d+)話「(?<subtitle>.+)」$/
const EP_REGEXP = /^第\d+話$/

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('vod', vod)

  let progressBarThumbElem: Element | null | undefined = null

  const patcher = new NCOPatcher(
    vod,
    {
      getInfo: async () => {
        await sleep(2000)

        const titleBugRoot =
          document.body.querySelector('title-bug')?.shadowRoot
        const progressBarRoot =
          document.body.querySelector('progress-bar')?.shadowRoot

        const titleElem = titleBugRoot?.querySelector('.title-field')
        const subtitleElem = titleBugRoot?.querySelector('.subtitle-field')

        progressBarThumbElem = progressBarRoot?.querySelector(
          '.progress-bar__thumb'
        )

        // タイトル
        const titleText = titleElem?.textContent.trim()
        // S1：第1話「サブタイトル」
        const subtitleText = subtitleElem?.textContent.trim()
        // 長さ
        const durationText = progressBarThumbElem?.getAttribute('aria-valuemax')

        logger.log('titleText', titleText)
        logger.log('subtitleText', subtitleText)
        logger.log('durationText', durationText)

        if (!titleText || !subtitleText || !durationText) {
          return null
        }

        const {
          season,
          episode,
          subtitle,
        }: {
          season?: string
          episode?: string
          subtitle?: string
        } = subtitleText.match(SUBTITLE_REGEXP)?.groups ?? {}

        const seasonNum = season ? Number(season) : -1
        const episodeNum = episode ? Number(episode) : -1

        const seasonText = 2 <= seasonNum ? `第${seasonNum}期` : null
        const workTitle =
          [titleText, seasonText].filter(Boolean).join(' ').trim() || null

        const episodeText = 0 <= episodeNum ? `第${episodeNum}話` : null
        const episodeTitle =
          [!EP_REGEXP.test(subtitle) && episodeText, subtitle]
            .filter(Boolean)
            .join(' ')
            .trim() || null

        const duration = Number(durationText)

        logger.log('workTitle', workTitle)
        logger.log('episodeTitle', episodeTitle)
        logger.log('duration', duration)

        return workTitle
          ? {
              input: `${workTitle} ${episodeTitle ?? ''}`,
              duration,
            }
          : null
      },
      appendCanvas: (video, canvas) => {
        video.insertAdjacentElement('afterend', canvas)
      },
    },
    {
      getCurrentTime: () => {
        const currentTimeText =
          progressBarThumbElem?.getAttribute('aria-valuenow')

        return currentTimeText ? Number(currentTimeText) : 0
      },
    }
  )

  const obs_config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  }
  const obs = new MutationObserver(() => {
    obs.disconnect()

    if (patcher.nco) {
      if (!patcher.nco.renderer.video.checkVisibility()) {
        patcher.dispose()

        progressBarThumbElem = null
      }
    } else {
      if (location.pathname.startsWith('/ja-jp/play/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          '.media-element-container > video[src]'
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
