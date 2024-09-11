import type { SettingsInitItem } from '@/types/constants'
import type { SettingsKey } from '@/types/storage'

import { memo } from 'react'
import { Divider } from '@nextui-org/react'

import { SETTINGS_INIT_DATA } from '@/constants/settings/init-data'

import { SettingsInput } from '@/components/settings-input'
import { PanelItem } from '@/components/panel-item'

import { ShowHideToggle } from './ShowHideToggle'
import { ReloadButton } from './ReloadButton'
import { SidePanelButton } from './SidePanelButton'
import { CaptureButton } from './CaptureButton'
import { ReportButton } from './ReportButton'

const SETTINGS_INIT_ITEMS = Object.fromEntries(
  SETTINGS_INIT_DATA.flatMap(({ items }) => {
    return items.map((item) => [item.settingsKey, item])
  })
) as {
  [key in SettingsKey]: SettingsInitItem
}

const QUICKPANEL_ITEM_KEYS: SettingsKey[] = [
  'settings:comment:opacity',
  'settings:comment:scale',
  'settings:comment:autoLoads',
]

/**
 * クイックパネル
 */
export const QuickPanel: React.FC = memo(() => {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-2">
        <ShowHideToggle />

        {QUICKPANEL_ITEM_KEYS.map((key) => {
          const item = { ...SETTINGS_INIT_ITEMS[key as SettingsKey] }
          const Input = SettingsInput[item.inputType]

          delete item.description

          return (
            <PanelItem key={key} className="px-2.5 py-0.5">
              <Input {...(item as any)} />
            </PanelItem>
          )
        })}
      </div>

      <div className="flex flex-col gap-2">
        <Divider />

        <div className="flex flex-row gap-2">
          <ReloadButton />
          <CaptureButton />
          <ReportButton />
          <SidePanelButton />
        </div>
      </div>
    </div>
  )
})
