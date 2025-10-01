import type { VideoData } from '@midra/nco-utils/types/api/niconico/video'
import type { StateSlotDetailDefault } from '@/ncoverlay/state'

import { DANIME_CHANNEL_ID } from '@midra/nco-utils/search/constants'

export function videoDataToSlotDetail(
  data: VideoData,
  detail?: Partial<StateSlotDetailDefault>
): StateSlotDetailDefault {
  const tags = data.tag.items.map((v) => v.name)

  const isDAnime = data.channel?.id === `ch${DANIME_CHANNEL_ID}`
  const isOfficialAnime = !!data.channel?.isOfficialAnime
  const isSzbh = !!(
    data.owner &&
    /(^|\s)(コメント専用動画|SZBH方式)(\s|$)/i.test(tags.join(' '))
  )

  return {
    type:
      (isDAnime && 'danime') ||
      (isOfficialAnime && 'official') ||
      (isSzbh && 'szbh') ||
      'normal',
    id: data.video.id,
    status: 'pending',
    info: {
      id: data.video.id,
      title: data.video.title,
      duration: data.video.duration,
      date: new Date(data.video.registeredAt).getTime(),
      tags,
      count: {
        view: data.video.count.view,
        comment: data.video.count.comment,
      },
      thumbnail:
        data.video.thumbnail.largeUrl ||
        data.video.thumbnail.middleUrl ||
        data.video.thumbnail.url,
    },
    ...detail,
  }
}
