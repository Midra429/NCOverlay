import type * as Watch from '@midra/nco-utils/types/api/niconico/watch'
import type { DeepPartial } from 'utility-types'
import type { StateSlotDetailDefault } from '@/ncoverlay/state'

import { TAG_SZBH_REGEXP } from '@midra/nco-utils/api/constants'
import { DANIME_CHANNEL_ID } from '@midra/nco-utils/search/constants'

import { deepmerge } from '@/utils/deepmerge'

export function watchDataToSlotDetail(
  data: Watch.Data,
  detail?: DeepPartial<StateSlotDetailDefault>
): StateSlotDetailDefault {
  const tags = data.tags.map((v) => v.name)

  const isDAnime = data.channel?.id === `ch${DANIME_CHANNEL_ID}`
  const isOfficialAnime = data.channel?.isOfficialAnime
  const isSzbh = !data.channel && TAG_SZBH_REGEXP.test(tags.join(' '))

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
