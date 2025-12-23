import type { SettingItems, SettingsKey } from '@/types/storage'

import { settings } from '@/utils/settings/extension'

import * as Checkbox from './Checkbox'
import * as Checkcard from './Checkcard'
import * as ChSelector from './ChSelector'
import * as CommentCustomizer from './CommentCustomizer'
import * as KbdShortcut from './KbdShortcut'
import * as NgList from './NgList'
import * as Range from './Range'
import * as Select from './Select'
import * as Text from './Text'
import * as Toggle from './Toggle'

export interface SettingsInputBaseProps<
  K extends SettingsKey,
  T extends SettingsInputType,
> {
  settingsKey: K
  inputType: T
  label: string
  description?: string
  disable?: SettingsConditional
}

export type SettingsKeyValue = {
  [K in SettingsKey]: {
    key: K
    value: SettingItems[K]
  }
}[SettingsKey]

export interface SettingsConditional {
  operator?: 'and' | 'or'
  when: SettingsKeyValue[]
}

export type SettingsInputType = keyof typeof SettingsInput

export type SettingsInputProps<K extends SettingsKey> =
  | (K extends Select.Key ? Select.Props<K> : never)
  | (K extends Toggle.Key ? Toggle.Props<K> : never)
  | (K extends Text.Key ? Text.Props<K> : never)
  | (K extends Range.Key ? Range.Props<K> : never)
  | (K extends Checkbox.Key ? Checkbox.Props<K> : never)
  | (K extends Checkcard.Key ? Checkcard.Props<K> : never)
  | (K extends KbdShortcut.Key ? KbdShortcut.Props<K> : never)
  | (K extends NgList.Key ? NgList.Props<K> : never)
  | (K extends ChSelector.Key ? ChSelector.Props<K> : never)
  | (K extends CommentCustomizer.Key ? CommentCustomizer.Props<K> : never)

export function initConditional(
  disable: SettingsConditional | undefined,
  setIsDisabled: React.Dispatch<React.SetStateAction<boolean>>
): (() => void) | undefined {
  if (!disable) return

  const { operator, when } = disable

  const conditionMap = new Map<SettingsKey, boolean>(
    when.map((v) => [v.key, false])
  )

  const removeListenerCallbacks = when.map(({ key, value }) => {
    return settings.watch(key, (val) => {
      conditionMap.set(key, val === value)

      if (operator === 'and') {
        setIsDisabled(conditionMap.values().every((v) => v))
      } else {
        setIsDisabled(conditionMap.values().some((v) => v))
      }
    })
  })

  return () => {
    while (removeListenerCallbacks.length) {
      removeListenerCallbacks.pop()?.()
    }
  }
}

export const SettingsInput = {
  select: Select.Input,
  toggle: Toggle.Input,
  text: Text.Input,
  range: Range.Input,
  checkbox: Checkbox.Input,
  checkcard: Checkcard.Input,
  'kbd-shortcut': KbdShortcut.Input,
  'ng-list': NgList.Input,
  'ch-selector': ChSelector.Input,
  'comment-customizer': CommentCustomizer.Input,
}
