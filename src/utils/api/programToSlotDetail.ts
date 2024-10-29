import type { SyoboCalProgram } from '@midra/nco-api/types/syobocal/json'
import type { SyoboCalProgramDb } from '@midra/nco-api/types/syobocal/db'
import type { StateSlotDetailJikkyo } from '@/ncoverlay/state'

import { syobocalToJikkyoChId } from '@midra/nco-api/utils/syobocalToJikkyoChId'

const isInteger = (str: string) => /^\d+$/.test(str)

export const programToSlotDetail = (
  title: string,
  program: SyoboCalProgram | SyoboCalProgramDb,
  detail?: Partial<StateSlotDetailJikkyo>
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

  const flags: string[] = []

  if ('Flag' in program) {
    let flag = Number(program.Flag)

    if (8 <= flag) {
      flag -= 8
      flags.push('🈞')
    }
    if (4 <= flag) {
      flag -= 4
      flags.push('🈡')
    }
    if (2 <= flag) {
      flag -= 2
      flags.push('🈟')
    }
  }

  return {
    type: 'jikkyo',
    id,
    status: 'pending',
    info: {
      id: program.TID,
      source: 'syobocal',
      title: [...flags, title].join(' ').trim(),
      duration: (endtime - starttime) / 1000,
      date: [starttime, endtime],
      count: {
        comment: 0,
      },
    },
    ...detail,
  }
}
