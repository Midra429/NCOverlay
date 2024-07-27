import { memo } from 'react'
import { Tabs, Tab } from '@nextui-org/react'
import { LayoutGridIcon, SettingsIcon } from 'lucide-react'

import { QuickPanel } from '@/components/quickpanel'

import { Settings } from './Settings'

const tabItems: {
  key: string
  title: string
  icon: React.FC<React.ComponentProps<'svg'>>
  children: React.ReactNode
}[] = [
  {
    key: 'quickpanel',
    title: 'クイックパネル',
    icon: LayoutGridIcon,
    children: <QuickPanel />,
  },
  {
    key: 'settings',
    title: '設定',
    icon: SettingsIcon,
    children: <Settings />,
  },
]

/**
 * メイン
 */
export const MainPane: React.FC<{
  quickpanel?: boolean
}> = memo(({ quickpanel }) => {
  return (
    <div className="flex h-full w-full flex-col">
      {quickpanel ? (
        <Tabs
          classNames={{
            base: 'border-b-1 border-foreground-200 p-2',
            tabList: 'border-1 border-foreground-100 bg-content1 shadow-small',
            panel: 'h-full overflow-hidden p-0',
          }}
          fullWidth
          radius="full"
          color="primary"
          destroyInactiveTabPanel={false}
          items={tabItems}
        >
          {({ key, title, icon: Icon, children }) => (
            <Tab
              key={key}
              title={
                <div className="flex flex-row items-center gap-x-1">
                  <Icon className="size-4" />
                  <span>{title}</span>
                </div>
              }
            >
              <div className="h-full overflow-y-auto p-2">{children}</div>
            </Tab>
          )}
        </Tabs>
      ) : (
        <div className="h-full overflow-y-auto p-2">
          <Settings />
        </div>
      )}
    </div>
  )
})
