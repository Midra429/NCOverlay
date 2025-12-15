import { useState } from 'react'
import { Tab, Tabs } from '@heroui/react'
import { LayoutGridIcon, SearchIcon, SettingsIcon } from 'lucide-react'

import { QuickPanel } from './QuickPanel'
import { Search } from './Search'
import { Settings } from './Settings'

const tabItems: {
  key: string
  Icon: (props: React.ComponentProps<'svg'>) => React.ReactNode
  title: string
  children: React.ReactNode
}[] = [
  {
    key: 'search',
    title: '検索',
    Icon: SearchIcon,
    children: <Search />,
  },
  {
    key: 'quickpanel',
    title: 'クイックパネル',
    Icon: LayoutGridIcon,
    children: <QuickPanel />,
  },
  {
    key: 'settings',
    title: '設定',
    Icon: SettingsIcon,
    children: <Settings />,
  },
]

/**
 * メイン
 */
export function MainTabs() {
  const [selectedKey, setSelectedKey] = useState('quickpanel')

  return (
    <Tabs
      classNames={{
        base: 'border-foreground-200 border-b-1 bg-content1 p-2',
        tabList: 'bg-content1 p-0',
        cursor: 'rounded-full',
        panel: 'h-full overflow-hidden p-0',
      }}
      color="primary"
      radius="none"
      fullWidth
      destroyInactiveTabPanel={false}
      selectedKey={selectedKey}
      onSelectionChange={(key) => setSelectedKey(key as string)}
      items={tabItems}
    >
      {({ key, title, Icon, children }) => (
        <Tab
          key={key}
          title={
            <div className="flex flex-row items-center gap-1">
              <Icon className="size-4" />
              <span>{title}</span>
            </div>
          }
        >
          <div className="h-full overflow-y-auto">{children}</div>
        </Tab>
      )}
    </Tabs>
  )
}
