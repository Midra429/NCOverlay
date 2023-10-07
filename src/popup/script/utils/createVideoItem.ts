import type { VideoData } from '@/types/niconico/video'
import { DANIME_CHANNEL_ID } from '@/constants'
import { formatDuration } from '@/utils/formatDuration'
import { formatDate } from '@/utils/formatDate'

export const createVideoItem = (data: VideoData) => {
  const template = document
    .querySelector<HTMLTemplateElement>('#TemplateItemVideo')!
    .content.firstElementChild?.cloneNode(true) as HTMLElement

  // サムネイル
  const videoThumbnail =
    template.querySelector<HTMLElement>('.video-thumbnail')!
  videoThumbnail.style.backgroundImage = `url(${data.video.thumbnail.url})`

  if (data.channel?.id === `ch${DANIME_CHANNEL_ID}`) {
    videoThumbnail.classList.add('video-thumbnail-danime')
  }

  // 動画の長さ
  const videoDuration = template.querySelector<HTMLElement>('.video-duration')!
  videoDuration.textContent = formatDuration(data.video.duration)

  // タイトル
  const videoTitle = template.querySelector<HTMLAnchorElement>('.video-title')!
  videoTitle.href = `https://www.nicovideo.jp/watch/${data.video.id}`
  videoTitle.title = videoTitle.textContent = data.video.title

  // 投稿日時
  const videoInfoDate = template.querySelector<HTMLElement>('.video-info-date')!
  videoInfoDate.textContent = formatDate(data.video.registeredAt)

  // 再生数
  const videoInfoView = template.querySelector<HTMLElement>('.video-info-view')!
  videoInfoView.textContent = data.video.count.view.toLocaleString()

  // コメント数
  const videoInfoComments = template.querySelector<HTMLElement>(
    '.video-info-comments'
  )!
  videoInfoComments.textContent = data.video.count.comment.toLocaleString()

  return template
}
