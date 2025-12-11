import { ncoState } from '@/hooks/useNco'

import { Layout } from '@/components/Layout'
import { PositionControl } from '@/components/PositionControl'

import { Comments } from './Comments'
import { Header } from './Header'
import { MainTabs } from './MainTabs'
import { Settings } from './MainTabs/Settings'

function App() {
  const isActive = !!ncoState
  const height = isActive ? 507 : 458

  return (
    <Layout className="overflow-hidden">
      <div className="flex size-fit flex-row">
        {isActive && (
          <div
            className="border-foreground-200 border-r-1"
            style={{
              width: 430,
              height,
            }}
          >
            <div className="flex h-full flex-col">
              <Header />

              <Comments />

              <PositionControl
                className="border-foreground-200 border-t-1"
                compact
              />
            </div>
          </div>
        )}

        <div
          className="flex size-full flex-col"
          style={{
            width: 370,
            height,
          }}
        >
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
