import type { NgSetting } from '@/utils/extension/applyNgSetting'

import { NICONICO_COLOR_COMMANDS, REGEXP_COLOR_CODE } from '@/constants'

import { settings } from '@/utils/settings/extension'

export const getNgSetting = async (): Promise<NgSetting> => {
  const values = await settings.get(
    'settings:ng:largeComments',
    'settings:ng:fixedComments',
    'settings:ng:coloredComments',
    'settings:ng:word',
    'settings:ng:command',
    'settings:ng:id'
  )

  const ngSetting: NgSetting = {
    word: [],
    command: [],
    id: [],
  }

  ngSetting.word.push(...values['settings:ng:word'])
  ngSetting.command.push(...values['settings:ng:command'])
  ngSetting.id.push(...values['settings:ng:id'])

  if (values['settings:ng:largeComments']) {
    ngSetting.command.push('big')
  }

  if (values['settings:ng:fixedComments']) {
    ngSetting.command.push('ue', 'shita')
  }

  if (values['settings:ng:coloredComments']) {
    ngSetting.command.push(
      ...Object.keys(NICONICO_COLOR_COMMANDS),
      REGEXP_COLOR_CODE
    )
  }

  return {
    word: [...new Set(ngSetting.word)],
    command: [...new Set(ngSetting.command)],
    id: [...new Set(ngSetting.id)],
  }
}
