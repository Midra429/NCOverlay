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
  return `${syobocalJikkyoChIdMap.get(scChId)}:${starttime}-${endtime}`
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
  const starttimeMs = convertProgramTime(program.StTime)
  const endtimeMs = convertProgramTime(program.EdTime)

  const starttime = Math.floor(starttimeMs / 1000)
  const endtime = Math.floor(endtimeMs / 1000)

  return getSlotId(program.ChID, starttime, endtime)
}

export function programToSlotDetail(
  title: string,
  program: SyoboCalProgram | SyoboCalProgramDb,
  detail?: DeepPartial<StateSlotDetailJikkyo>
): StateSlotDetailJikkyo {
  const starttimeMs = convertProgramTime(program.StTime)
  const endtimeMs = convertProgramTime(program.EdTime)

  const starttime = Math.floor(starttimeMs / 1000)
  const endtime = Math.floor(endtimeMs / 1000)

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
        duration: endtime - starttime,
        date: [starttimeMs, endtimeMs],
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
