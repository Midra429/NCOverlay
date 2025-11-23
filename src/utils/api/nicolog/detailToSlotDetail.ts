import type { GetDataFormatted } from '@midra/nco-utils/types/api/nicolog/get'
import type { StateSlotDetailFile } from '@/ncoverlay/state'

export function detailToSlotDetail(
  data: GetDataFormatted,
  detail?: Partial<StateSlotDetailFile>
): StateSlotDetailFile {
  return {
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
    ...detail,
  }
}
