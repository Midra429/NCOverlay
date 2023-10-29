import { NCOverlay } from '@/content_script/NCOverlay'
import { loadComments } from '@/content_script/utils/loadComments'
import { AbemaApi } from '@/content_script/api/abema'

export default async () => {
  let nco: NCOverlay | null = null

  const getInfo = async () => {
    const id = location.pathname.split('/').at(-1)

    const program = id && (await AbemaApi.program(id))

    console.log('[NCOverlay] AbemaApi.program', program)

    if (program) {
      const isAnime = program.genre.id === 'animation'

      if (isAnime) {
        const workTitle = program.series.title

        let title = workTitle

        if (1 < program.season.sequence) {
          if (program.season.name.indexOf(workTitle) !== -1) {
            title = program.season.name
          } else {
            title = `${workTitle} ${program.season.name}`
          }
        }

        let episode: string = ''
        if (title !== program.episode.title) {
          episode = program.episode.title
        }

        return {
          // 呪術廻戦 第2期 懐玉・玉折
          title: title,
          // 第25話 懐玉
          episode: episode,
          // 1435
          duration: program.info.duration,
        }
      }
    }

    return null
  }

  const modify = (video: HTMLVideoElement) => {
    console.log('[NCOverlay] modify()')

    const player = video.closest<HTMLElement>('.com-vod-VODScreen__player')

    if (player) {
      nco = new NCOverlay(video)

      nco.onLoadedmetadata = async function () {
        this.init()

        const info = await getInfo()

        console.log('[NCOverlay] info', info)

        if (info) {
          let title = info.title
          if (info.episode) {
            title += ` ${info.episode}`
          }

          console.log('[NCOverlay] title', title)

          await loadComments(this, {
            title: title,
            duration: info.duration ?? 0,
          })
        }
      }

      player.appendChild(nco.canvas)
    }
  }

  const obs_config: MutationObserverInit = {
    childList: true,
    subtree: true,
  }
  const obs = new MutationObserver(() => {
    obs.disconnect()

    if (nco && !document.contains(nco.video)) {
      nco.dispose()
      nco = null
    } else if (!nco) {
      if (location.pathname.startsWith('/video/episode/')) {
        const video = document.querySelector<HTMLVideoElement>(
          '.com-a-Video__video > video[preload="metadata"]'
        )

        if (video) {
          modify(video)
        }
      }
    }

    obs.observe(document, obs_config)
  })

  obs.observe(document, obs_config)
}
