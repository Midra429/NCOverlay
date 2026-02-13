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

const QUICKPANEL_ITEM_KEYS: SettingsKey[] = [
  'settings:comment:opacity',
  'settings:comment:scale',
  'settings:comment:speed',
  'settings:comment:amount',
  'settings:autoSearch:targets',
]

const SETTINGS_INIT_ITEMS = SETTINGS_INIT_DATA.flatMap((v) => v.items)

const QUICKPANEL_ITEMS = QUICKPANEL_ITEM_KEYS.map((key) => {
  return SETTINGS_INIT_ITEMS.find((v) => v.settingsKey === key)
}).filter((v) => v != null)

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

        {QUICKPANEL_ITEMS.map((item) => {
          const Input = SettingsInput[item.inputType]

          return (
            <PanelItem key={item.settingsKey} className="px-2.5 py-0.5">
              <Input {...(item as any)} description={undefined} />
            </PanelItem>
          )
        })}
      </div>
    </div>
  )
}
