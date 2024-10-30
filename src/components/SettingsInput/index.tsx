import type { SettingsKey } from '@/types/storage'

import * as Segmented from './Segmented'
import * as Select from './Select'
import * as Toggle from './Toggle'
import * as Text from './Text'
import * as Range from './Range'
import * as Checkbox from './Checkbox'
import * as Checkcard from './Checkcard'
import * as KbdShortcut from './KbdShortcut'
import * as NgList from './NgList'
import * as ChSelector from './ChSelector'

export type SettingsInputBaseProps<
  K extends SettingsKey,
  T extends SettingsInputType,
  P extends any = {},
> = {
  settingsKey: K
  inputType: T
  label: string
  description?: string
} & P

export type SettingsInputType = keyof typeof SettingsInput

export type SettingsInputProps<Key extends SettingsKey> =
  | (Key extends Segmented.Key ? Segmented.Props<Key> : never)
  | (Key extends Select.Key ? Select.Props<Key> : never)
  | (Key extends Toggle.Key ? Toggle.Props<Key> : never)
  | (Key extends Text.Key ? Text.Props<Key> : never)
  | (Key extends Range.Key ? Range.Props<Key> : never)
  | (Key extends Checkbox.Key ? Checkbox.Props<Key> : never)
  | (Key extends Checkcard.Key ? Checkcard.Props<Key> : never)
  | (Key extends KbdShortcut.Key ? KbdShortcut.Props<Key> : never)
  | (Key extends NgList.Key ? NgList.Props<Key> : never)
  | (Key extends ChSelector.Key ? ChSelector.Props<Key> : never)

export const SettingsInput = {
  'segmented': Segmented.Input,
  'select': Select.Input,
  'toggle': Toggle.Input,
  'text': Text.Input,
  'range': Range.Input,
  'checkbox': Checkbox.Input,
  'checkcard': Checkcard.Input,
  'kbd-shortcut': KbdShortcut.Input,
  'ng-list': NgList.Input,
  'ch-selector': ChSelector.Input,
}
