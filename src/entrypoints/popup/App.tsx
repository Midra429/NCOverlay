import { ncoState } from '@/hooks/useNco'

import { Layout } from '@/components/Layout'

import { MainPane } from './MainPane'
import { SidePane } from './SidePane'

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
            <SidePane />
          </div>
        )}

        <div
          style={{
            width: 370,
            height,
          }}
        >
          <MainPane quickpanel={isActive} />
        </div>
      </div>
    </Layout>
  )
}

export default App
