import type { DeepPartial } from 'utility-types'
import type { GetDataFormatted } from '@midra/nco-utils/types/api/nicolog/get'
import type { StateSlotDetailFile } from '@/ncoverlay/state'

import { deepmerge } from '@/utils/deepmerge'

export function detailToSlotDetail(
  data: GetDataFormatted,
  detail?: DeepPartial<StateSlotDetailFile>
): StateSlotDetailFile {
  return deepmerge<StateSlotDetailFile, any>(
    {
      type: 'file',
      id: data.id,
      status: 'pending',
      info: {
        id: data.id,
        source: 'nicolog',
        title: data.name,
        duration: null,
        date: data.created,
        count: {
          comment: 0,
        },
      },
    },
    detail
  )
}
