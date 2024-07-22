import type { SettingsKey } from '@/types/storage'

import { memo } from 'react'

import { SETTINGS_INIT_ITEMS } from '@/constants'

import { SettingsInput } from '@/components/settings-input'
import { PanelItem } from '@/components/panel-item'

import { ShowHideToggle } from './presets/ShowHideToggle'
import { PositionControl } from './presets/PositionControl'
import { CaptureButton } from './presets/CaptureButton'

type PanelPresetComponentKey = keyof typeof PANEL_PRESET_CONPONENTS

const PANEL_PRESET_CONPONENTS = {
  'panel:ShowHideToggle': ShowHideToggle,
  'panel:PositionControl': PositionControl,
}

/**
 * @todo そのうち編集可にする
 */
const quickpanelItemKeys: (PanelPresetComponentKey | SettingsKey)[] = [
  'panel:ShowHideToggle',
  'settings:comment:opacity',
  'settings:comment:scale',
  'panel:PositionControl',
]

/**
 * クイックパネル
 */
export const QuickPanel: React.FC = memo(() => {
  return (
    <div className="flex flex-col gap-2">
      {quickpanelItemKeys.map((key) => {
        let element: React.ReactElement | undefined

        if (key in SETTINGS_INIT_ITEMS) {
          const item = { ...SETTINGS_INIT_ITEMS[key as SettingsKey] }
          const Input = SettingsInput[item.inputType]

          delete item.description

          element = <Input {...(item as any)} />
        } else if (key in PANEL_PRESET_CONPONENTS) {
          const Component =
            PANEL_PRESET_CONPONENTS[key as PanelPresetComponentKey]

          element = <Component />
        }

        return (
          element && (
            <PanelItem key={key} className="px-2.5 py-0.5">
              {element}
            </PanelItem>
          )
        )
      })}

      <CaptureButton />
    </div>
  )
})
