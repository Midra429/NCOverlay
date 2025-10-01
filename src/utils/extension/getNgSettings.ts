import type { NgSettingsContent } from '@/types/storage'

import { NICONICO_COLOR_COMMANDS, COLOR_CODE } from '@/constants'

import { settings } from '@/utils/settings/extension'

export type NgSettingsConverted = {
  words: (string | RegExp)[]
  commands: (string | RegExp)[]
  ids: (string | RegExp)[]
}

export function convertNgSettingsContent({
  content,
  isRegExp,
}: NgSettingsContent): string | RegExp | undefined {
  if (isRegExp) {
    try {
      return new RegExp(content)
    } catch {}
  } else {
    return content
  }
}

export async function getNgSettings(): Promise<NgSettingsConverted> {
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
    words: [...ngWords]
      .map(convertNgSettingsContent)
      .filter((v) => typeof v !== 'undefined'),
    commands: [...ngCommands]
      .map(convertNgSettingsContent)
      .filter((v) => typeof v !== 'undefined'),
    ids: [...ngIds]
      .map(convertNgSettingsContent)
      .filter((v) => typeof v !== 'undefined'),
  }
}
