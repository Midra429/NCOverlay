import type { SettingsKey } from '@/types/storage'

import { Divider } from '@heroui/react'

import { SETTINGS_INIT_DATA } from '@/constants/settings/init-data'

import { PanelItem } from '@/components/PanelItem'
import { SettingsInput } from '@/components/SettingsInput'

import { CaptureButton } from './CaptureButton'
import { ReloadButton } from './ReloadButton'
import { ReportButton } from './ReportButton'
import { ShowHideToggle } from './ShowHideToggle'
import { SidePanelButton } from './SidePanelButton'

const SETTINGS_INIT_ITEMS = Object.fromEntries(
  SETTINGS_INIT_DATA.flatMap(({ items }) => {
    return items.map((item) => [item.settingsKey, item])
  })
)

const QUICKPANEL_ITEM_KEYS: SettingsKey[] = [
  'settings:comment:opacity',
  'settings:comment:scale',
  'settings:comment:amount',
  'settings:autoSearch:targets',
]

/**
 * クイックパネル
 */
export function QuickPanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-row border-foreground-200 border-b-1 bg-content1">
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
          const item = { ...SETTINGS_INIT_ITEMS[key] }
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
}
