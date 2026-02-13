import { ncoState } from '@/hooks/useNco'

import { Layout } from '@/components/Layout'
import { PositionControl } from '@/components/PositionControl'

import { Comments } from './Comments'
import { Header } from './Header'
import { MainTabs } from './MainTabs'
import { Settings } from './MainTabs/Settings'

function App() {
  const isActive = !!ncoState

  return (
    <Layout className="overflow-visible">
      <div
        className="flex w-fit flex-row *:h-full"
        style={{
          height: isActive ? 585 : 508,
        }}
      >
        {isActive && (
          <div className="flex w-107 flex-col border-foreground-200 border-r-1">
            <Header />

            <Comments />

            <PositionControl
              className="border-foreground-200 border-t-1"
              compact
            />
          </div>
        )}

        <div className="flex w-93 flex-col">
          {isActive ? (
            <MainTabs />
          ) : (
            <div className="h-full overflow-y-auto">
              <Settings />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default App
