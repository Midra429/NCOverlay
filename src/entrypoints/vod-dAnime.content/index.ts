import type { Chapter } from '@midra/nco-utils/types/api/danime/part'
import type { VodKey } from '@/types/constants'
import type { VideoChapter } from '@/utils/api/jikkyo/findChapters'

import { defineContentScript } from '#imports'
import { parse } from '@midra/nco-utils/parse'

import { MATCHES } from '@/constants/matches'
import { clone } from '@/utils/clone'
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

      const partChapters = clone(partData.chapters)
      const chapters: VideoChapter[] = []

      // アバンの手前の部分(多分あらすじ)をアバンに統合する
      if (
        partChapters[0]?.type === 'none' &&
        partChapters[1]?.type === 'avant'
      ) {
        partChapters[1].start = partChapters[0].start
        partChapters.shift()
      }

      const opEdChapters: Chapter[] = []

      for (const chapter of partChapters) {
        let type: VideoChapter['type'] | undefined

        switch (chapter.type) {
          case 'avant':
            type = 'avant'
            break

          case 'mainStory':
            type = 'main'
            break

          case 'cPart':
            type = 'cPart'
            break

          case 'none':
            if (!chapter.showInterface) break

            const chapterDuration = chapter.end - chapter.start

            if (chapterDuration <= 60000) {
              type = 'other'
            } else if (chapterDuration <= 100000) {
              opEdChapters.push(chapter)
            } else {
              if (!chapters.length) {
                type = 'avant_op'
              } else {
                opEdChapters.push(chapter)
              }
            }

            break
        }

        if (!type) continue

        chapters.push({
          type,
          startMs: chapter.start,
          endMs: chapter.end,
          duration: chapter.end - chapter.start,
        })
      }

      switch (opEdChapters.length) {
        case 2:
          const [opChapter, edChapter] = opEdChapters

          chapters.push({
            type: 'op',
            startMs: opChapter.start,
            endMs: opChapter.end,
            duration: opChapter.end - opChapter.start,
          })
          chapters.push({
            type: 'ed',
            startMs: edChapter.start,
            endMs: edChapter.end,
            duration: edChapter.end - edChapter.start,
          })

          break

        case 1:
          const [opEdChapter] = opEdChapters

          const hasOp = !!chapters.find((v) => v.type === 'avant_op')

          chapters.push({
            type: hasOp ? 'ed' : 'op-ed',
            startMs: opEdChapter.start,
            endMs: opEdChapter.end,
            duration: opEdChapter.end - opEdChapter.start,
          })

          break
      }

      chapters.sort((a, b) => a.startMs - b.startMs)

      logger.log('workTitle', workTitle)
      logger.log('episodeTitle', episodeTitle)
      logger.log('duration', duration)
      logger.log('chapters', chapters)

      return workTitle
        ? {
            input: `${workTitle} ${episodeTitle}`,
            duration,
            chapters,
          }
        : null
    },
    appendCanvas: (video, canvas) => {
      video.insertAdjacentElement('afterend', canvas)
    },
  })

  patcher.setVideo(video)
}
