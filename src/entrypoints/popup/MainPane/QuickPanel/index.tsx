import type { SettingsInitItem } from '@/types/constants'
import type { SettingsKey } from '@/types/storage'

import { memo } from 'react'
import { Divider } from '@nextui-org/react'

import { SETTINGS_INIT_DATA } from '@/constants/settings/init-data'

import { SettingsInput } from '@/components/SettingsInput'
import { PanelItem } from '@/components/PanelItem'

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
  'settings:comment:amount',
  'settings:comment:autoLoads',
]

/**
 * クイックパネル
 */
export const QuickPanel: React.FC = memo(() => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-row border-b-1 border-foreground-200 bg-content1">
        <ReloadButton />

        <Divider orientation="vertical" />

        <CaptureButton />

        <Divider orientation="vertical" />

        <ReportButton />

        <Divider orientation="vertical" />

        <SidePanelButton />
      </div>

      <div className="flex h-full flex-col gap-2 overflow-y-auto p-2">
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
    </div>
  )
})
