import { useEffect, useState } from 'react'
import { Tabs, Tab } from '@heroui/react'
import { SearchIcon, LayoutGridIcon, SettingsIcon } from 'lucide-react'

import { Search } from './Search'
import { QuickPanel } from './QuickPanel'
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

export type MainPaneProps = {
  quickpanel?: boolean
}

/**
 * メイン
 */
export function MainPane({ quickpanel }: MainPaneProps) {
  const [selectedKey, setSelectedKey] = useState('quickpanel')
  const [disableAnimation, setDisableAnimation] = useState(true)

  useEffect(() => {
    if (!quickpanel) return

    const timeoutId = setTimeout(() => {
      setDisableAnimation(false)
    }, 50)

    return () => clearInterval(timeoutId)
  }, [quickpanel])

  return (
    <div className="flex size-full flex-col">
      {quickpanel ? (
        <Tabs
          classNames={{
            base: 'border-foreground-200 bg-content1 border-b-1 p-2',
            tabList: 'bg-content1 p-0',
            cursor: 'rounded-full',
            panel: 'h-full overflow-hidden p-0',
          }}
          color="primary"
          radius="none"
          fullWidth
          destroyInactiveTabPanel={false}
          disableAnimation={disableAnimation}
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
      ) : (
        <div className="h-full overflow-y-auto">
          <Settings />
        </div>
      )}
    </div>
  )
}
