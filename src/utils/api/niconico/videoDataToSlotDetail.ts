import type { WatchV4Data } from '@midra/nco-utils/types/api/niconico/video'
import type { DeepPartial } from 'utility-types'
import type { StateSlotDetailDefault } from '@/ncoverlay/state'

import { TAG_SZBH_REGEXP } from '@midra/nco-utils/api/constants'
import { DANIME_CHANNEL_ID } from '@midra/nco-utils/search/constants'

import { deepmerge } from '@/utils/deepmerge'

export function videoDataToSlotDetail(
  data: WatchV4Data,
  detail?: DeepPartial<StateSlotDetailDefault>
): StateSlotDetailDefault {
  const tags = data.tags.items.map((v) => v.name)

  const isDAnime = data.metadata.jsonLd.owner.id === `ch${DANIME_CHANNEL_ID}`
  const isOfficialAnime =
    data.video.isChannelVideo &&
    (data.genre.key === 'anime' || data.genre.label === 'アニメ')
  const isSzbh =
    !data.video.isChannelVideo && TAG_SZBH_REGEXP.test(tags.join(' '))

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
          data.video.thumbnail.large ||
          data.video.thumbnail.middle ||
          data.video.thumbnail.normal,
      },
    },
    detail
  )
}
