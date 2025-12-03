import type { DeepPartial } from 'utility-types'
import type { VideoData } from '@midra/nco-utils/types/api/niconico/video'
import type { StateSlotDetailDefault } from '@/ncoverlay/state'

import { DANIME_CHANNEL_ID } from '@midra/nco-utils/search/constants'

import { deepmerge } from '@/utils/deepmerge'

const SZBH_TAG_REGEXP = /(^|\s)(コメント専用動画|SZBH方式)(\s|$)/i

export function videoDataToSlotDetail(
  data: VideoData,
  detail?: DeepPartial<StateSlotDetailDefault>
): StateSlotDetailDefault {
  const tags = data.tag.items.map((v) => v.name)

  const isDAnime = data.channel?.id === `ch${DANIME_CHANNEL_ID}`
  const isOfficialAnime = !!data.channel?.isOfficialAnime
  const isSzbh = !!(data.owner && SZBH_TAG_REGEXP.test(tags.join(' ')))

  return deepmerge<StateSlotDetailDefault, any>(
    {
      type:
        (isDAnime && 'danime') ||
        (isOfficialAnime && 'official') ||
        (isSzbh && 'szbh') ||
        'normal',
      id: data.video.id,
      status: 'pending',
      info: {
        id: data.video.id,
        source: 'niconico',
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
    },
    detail
  )
}
