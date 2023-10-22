import { NCOverlay } from '@/content_script/NCOverlay'
import { loadComments } from '@/content_script/utils/loadComments'
import { DmmTvApi } from '@/content_script/api/dmmTv'

export default async () => {
  console.log('[NCOverlay] VOD: DMM TV')

  let nco: NCOverlay | null = null

  const getInfo = async () => {
    const url = new URL(location.href)
    const seasonId = url.searchParams.get('season')
    const contentId = url.searchParams.get('content')

    const dataVideo =
      seasonId &&
      contentId &&
      (await DmmTvApi.video({
        seasonId: seasonId,
        contentId: contentId,
      }))

    console.log('[NCOverlay] DmmTvApi.video', dataVideo)

    if (dataVideo) {
      // 15: アニメ, 17: 特撮
      const isAnime = dataVideo.categories.some(
        (v) => v.id === '15' || v.id === '17'
      )

      if (isAnime) {
        return {
          // 呪術廻戦
          workTitle: dataVideo.titleName,
          // 呪術廻戦 懐玉・玉折／渋谷事変（第2期）
          title: dataVideo.seasonName,
          // 第25話
          episodeNo: dataVideo.episode?.episodeNumberName ?? '',
          // 懐玉
          episodeText: dataVideo.episode?.episodeTitle ?? '',
          // 1435
          duration: dataVideo.episode?.playInfo.duration,
        }
      }
    }

    return null
  }

  const modify = (video: HTMLVideoElement) => {
    console.log('[NCOverlay] modify()')

    nco = new NCOverlay(video)

    nco.onLoadedmetadata = async function () {
      this.init()

      const info = await getInfo()

      console.log('[NCOverlay] info', info)

      if (info) {
        let title = info.title
        if (info.episodeNo) {
          title += ` ${info.episodeNo}`
        }
        if (info.episodeText) {
          title += ` ${info.episodeText}`
        }

        console.log('[NCOverlay] title', title)

        await loadComments(this, {
          title: title,
          duration: info.duration ?? this.video.duration ?? 0,
          workTitle: info.workTitle,
          subTitle: info.episodeText,
        })
      }
    }

    video.insertAdjacentElement('afterend', nco.canvas)
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
      if (location.pathname.startsWith('/vod/playback/')) {
        const video = document.querySelector<HTMLVideoElement>(
          '#vodWrapper > div > video'
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
