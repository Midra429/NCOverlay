import type { SyoboCalChannelId } from '@midra/nco-utils/types/api/constants'
import type { SyoboCalProgramDb } from '@midra/nco-utils/types/api/syobocal/db'
import type { SyoboCalProgram } from '@midra/nco-utils/types/api/syobocal/json'
import type { DeepPartial } from 'utility-types'
import type { StateSlotDetailJikkyo } from '@/ncoverlay/state'

import { syobocalJikkyoChIdMap } from '@midra/nco-utils/api/constants'

import { deepmerge } from '@/utils/deepmerge'

const INT_REGEXP = /^\d+$/

function isInteger(str: string) {
  return INT_REGEXP.test(str)
}

function getSlotId(
  scChId: SyoboCalChannelId,
  starttime: number,
  endtime: number
) {
  return `${syobocalJikkyoChIdMap.get(scChId)}:${starttime / 1000}-${endtime / 1000}`
}

export function convertProgramTime(time: string): number {
  if (isInteger(time)) {
    return parseInt(time) * 1000
  } else {
    return new Date(time).getTime()
  }
}

export function getSlotIdFromProgram(
  program: SyoboCalProgram | SyoboCalProgramDb
): string {
  return getSlotId(
    program.ChID,
    convertProgramTime(program.StTime),
    convertProgramTime(program.EdTime)
  )
}

export function programToSlotDetail(
  title: string,
  program: SyoboCalProgram | SyoboCalProgramDb,
  detail?: DeepPartial<StateSlotDetailJikkyo>
): StateSlotDetailJikkyo {
  const starttime = convertProgramTime(program.StTime)
  const endtime = convertProgramTime(program.EdTime)

  const id = getSlotId(program.ChID, starttime, endtime)

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

  return deepmerge<StateSlotDetailJikkyo, any>(
    {
      type: 'jikkyo',
      id,
      status: 'pending',
      info: {
        id: `${program.TID}/time?Filter=${program.ChID}#${program.PID}`,
        source: 'syobocal',
        title: [...flags, title].join(' ').trim(),
        duration: (endtime - starttime) / 1000,
        date: [starttime, endtime],
        count: {
          comment: 0,
        },
      },
      markers: [],
      chapters: [],
    },
    detail
  )
}
