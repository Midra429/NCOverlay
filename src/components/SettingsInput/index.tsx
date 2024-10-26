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
  T extends keyof SettingsInputProps,
> = {
  settingsKey: K
  inputType: T
  label: string
  description?: string
}

export type SettingsInputProps = {
  'segmented': Segmented.Props
  'select': Select.Props
  'toggle': Toggle.Props
  'text': Text.Props
  'range': Range.Props
  'checkbox': Checkbox.Props
  'checkcard': Checkcard.Props
  'kbd-shortcut': KbdShortcut.Props
  'ng-list': NgList.Props
  'ch-selector': ChSelector.Props
}

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
