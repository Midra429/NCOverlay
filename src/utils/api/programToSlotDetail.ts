import type { SyoboCalProgram } from '@midra/nco-api/types/syobocal/json'
import type { SyoboCalProgramDb } from '@midra/nco-api/types/syobocal/db'
import type { StateSlotDetailJikkyo } from '@/ncoverlay/state'

import { syobocalToJikkyoChId } from '@midra/nco-api/utils/syobocalToJikkyoChId'

const isInteger = (str: string) => /^\d+$/.test(str)

export const programToSlotDetail = (
  title: string,
  program: SyoboCalProgram | SyoboCalProgramDb
): StateSlotDetailJikkyo => {
  let starttime: number
  let endtime: number

  if (isInteger(program.StTime) && isInteger(program.EdTime)) {
    starttime = parseInt(program.StTime) * 1000
    endtime = parseInt(program.EdTime) * 1000
  } else {
    starttime = new Date(program.StTime).getTime()
    endtime = new Date(program.EdTime).getTime()
  }

  const id = `${syobocalToJikkyoChId(program.ChID)}:${starttime / 1000}-${endtime / 1000}`

  return {
    type: 'jikkyo',
    id,
    status: 'pending',
    info: {
      id: program.TID,
      title,
      duration: (endtime - starttime) / 1000,
      date: [starttime, endtime],
      count: {
        comment: 0,
      },
    },
  }
}
