import type { SettingsKey } from '@/types/storage'

import { memo } from 'react'

import { SETTINGS_INIT_ITEMS } from '@/constants'

import { SettingsInput } from '@/components/settings-input'
import { PanelItem } from '@/components/panel-item'

import { ShowHideToggle } from './presets/showhide-toggle'
import { PositionControl } from './presets/position-control'
import { CaptureButton } from './presets/capture-button'
import { SidePanelButton } from './presets/sidepanel-button'

type PanelPresetComponentKey = keyof typeof PANEL_PRESET_CONPONENTS

type PanelItemKey = PanelPresetComponentKey | SettingsKey

const PANEL_PRESET_CONPONENTS = {
  'panel:ShowHideToggle': ShowHideToggle,
  'panel:PositionControl': PositionControl,
}

/**
 * @todo そのうち編集可にする
 */
const quickpanelItemKeys: PanelItemKey[] = [
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

          element = (
            <PanelItem key={key} className="px-2.5 py-0.5">
              <Input {...(item as any)} />
            </PanelItem>
          )
        } else if (key in PANEL_PRESET_CONPONENTS) {
          const Component =
            PANEL_PRESET_CONPONENTS[key as PanelPresetComponentKey]

          element = <Component key={key} />
        }

        return element
      })}

      <div className="flex flex-row gap-2">
        <CaptureButton />
        <SidePanelButton />
      </div>
    </div>
  )
})
