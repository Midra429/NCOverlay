import type { NgSettingsContent } from '@/types/storage'

import { COLOR_CODE, NICONICO_COLORS } from '@/constants'
import { settings } from '@/utils/settings/extension'

export interface NgSettingsFormatted {
  words: (string | RegExp)[]
  commands: (string | RegExp)[]
  ids: (string | RegExp)[]
}

export function formatNgSettingsContent({
  content,
  isRegExp,
}: NgSettingsContent): string | RegExp | undefined {
  if (isRegExp) {
    try {
      return new RegExp(content, 'u')
    } catch {}
  } else {
    return content
  }
}

export async function getNgSettings(): Promise<NgSettingsFormatted> {
  const [largeComments, fixedComments, coloredComments, words, commands, ids] =
    await settings.get(
      'settings:ng:largeComments',
      'settings:ng:fixedComments',
      'settings:ng:coloredComments',
      'settings:ng:words',
      'settings:ng:commands',
      'settings:ng:ids'
    )

  const ngWords = new Set(words)
  const ngCommands = new Set(commands)
  const ngIds = new Set(ids)

  if (largeComments) {
    ngCommands.add({ content: 'big' })
  }

  if (fixedComments) {
    ngCommands.add({ content: 'ue' })
    ngCommands.add({ content: 'shita' })
  }

  if (coloredComments) {
    for (const content in NICONICO_COLORS) {
      ngCommands.add({ content })
    }

    ngCommands.add({
      content: COLOR_CODE,
      isRegExp: true,
    })
  }

  return {
    words: [...ngWords.values()]
      .map(formatNgSettingsContent)
      .filter((v) => v != null),
    commands: [...ngCommands.values()]
      .map(formatNgSettingsContent)
      .filter((v) => v != null),
    ids: [...ngIds.values()]
      .map(formatNgSettingsContent)
      .filter((v) => v != null),
  }
}
