import type { SearchData } from '@midra/nco-api/types/niconico/search'
import type { StateSlotDetailDefault } from '@/ncoverlay/state'

import { DANIME_CHANNEL_ID } from '@midra/nco-api/constants'

export const searchDataToSlotDetail = (
  data: SearchData<
    | 'contentId'
    | 'title'
    | 'userId'
    | 'channelId'
    | 'viewCounter'
    | 'lengthSeconds'
    | 'thumbnailUrl'
    | 'startTime'
    | 'commentCounter'
    | 'categoryTags'
    | 'tags'
  >,
  detail?: Partial<StateSlotDetailDefault>
): StateSlotDetailDefault => {
  const isDAnime = data.channelId === DANIME_CHANNEL_ID
  const isOfficialAnime = !!(
    data.channelId &&
    data.categoryTags &&
    /(^|\s)アニメ(\s|$)/.test(data.categoryTags)
  )
  const isSzbh = !!(
    data.userId &&
    data.tags &&
    /(^|\s)(コメント専用動画|SZBH方式)(\s|$)/i.test(data.tags)
  )

  return {
    type:
      (isDAnime && 'danime') ||
      (isOfficialAnime && 'official') ||
      (isSzbh && 'szbh') ||
      'normal',
    id: data.contentId,
    status: 'pending',
    info: {
      id: data.contentId,
      title: data.title,
      duration: data.lengthSeconds,
      date: new Date(data.startTime).getTime(),
      tags: data.tags?.split(' ') ?? [],
      count: {
        view: data.viewCounter,
        comment: data.commentCounter,
      },
      thumbnail: data.thumbnailUrl,
    },
    ...detail,
  }
}
