import { NICONICO_COLOR_COMMANDS, COLOR_CODE } from '@/constants'

import { settings } from '@/utils/settings/extension'

export type NgSettingsContent = {
  content: string
  isRegExp?: boolean
}

export type NgSettings = {
  words: NgSettingsContent[]
  commands: NgSettingsContent[]
  ids: NgSettingsContent[]
}

export const getNgSettings = async (): Promise<NgSettings> => {
  const values = await settings.get(
    'settings:ng:largeComments',
    'settings:ng:fixedComments',
    'settings:ng:coloredComments',
    'settings:ng:words',
    'settings:ng:commands',
    'settings:ng:ids'
  )

  const ngWords = new Set(values['settings:ng:words'])
  const ngCommands = new Set(values['settings:ng:commands'])
  const ngIds = new Set(values['settings:ng:ids'])

  if (values['settings:ng:largeComments']) {
    ngCommands.add({ content: 'big' })
  }

  if (values['settings:ng:fixedComments']) {
    ngCommands.add({ content: 'ue' })
    ngCommands.add({ content: 'shita' })
  }

  if (values['settings:ng:coloredComments']) {
    Object.keys(NICONICO_COLOR_COMMANDS).forEach((content) => {
      ngCommands.add({ content })
    })

    ngCommands.add({
      content: COLOR_CODE,
      isRegExp: true,
    })
  }

  return {
    words: [...ngWords],
    commands: [...ngCommands],
    ids: [...ngIds],
  }
}
