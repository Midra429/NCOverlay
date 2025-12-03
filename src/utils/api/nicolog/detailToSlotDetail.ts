import type { DeepPartial } from 'utility-types'
import type { GetDataFormatted } from '@midra/nco-utils/types/api/nicolog/get'
import type { StateSlotDetailNicolog } from '@/ncoverlay/state'

import { deepmerge } from '@/utils/deepmerge'

export function detailToSlotDetail(
  data: GetDataFormatted,
  detail?: DeepPartial<StateSlotDetailNicolog>
): StateSlotDetailNicolog {
  return deepmerge<StateSlotDetailNicolog, any>(
    {
      type: 'nicolog',
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
