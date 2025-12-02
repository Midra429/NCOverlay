import type { SettingsKey } from '@/types/storage'

import * as Select from './Select'
import * as Toggle from './Toggle'
import * as Text from './Text'
import * as Range from './Range'
import * as Checkbox from './Checkbox'
import * as Checkcard from './Checkcard'
import * as KbdShortcut from './KbdShortcut'
import * as NgList from './NgList'
import * as ChSelector from './ChSelector'

export interface SettingsInputBaseProps<
  K extends SettingsKey,
  T extends SettingsInputType,
> {
  settingsKey: K
  inputType: T
  label: string
  description?: string
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
}
