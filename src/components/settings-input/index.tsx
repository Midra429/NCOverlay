import type { SettingsKey } from '@/types/storage'

import * as Segmented from './segmented'
import * as Select from './select'
import * as Toggle from './toggle'
import * as Text from './text'
import * as Range from './range'
import * as Checkbox from './checkbox'
import * as Checkcard from './checkcard'

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
  segmented: Segmented.Props
  select: Select.Props
  toggle: Toggle.Props
  text: Text.Props
  range: Range.Props
  checkbox: Checkbox.Props
  checkcard: Checkcard.Props
}

export const SettingsInput = {
  segmented: Segmented.Input,
  select: Select.Input,
  toggle: Toggle.Input,
  text: Text.Input,
  range: Range.Input,
  checkbox: Checkbox.Input,
  checkcard: Checkcard.Input,
}
