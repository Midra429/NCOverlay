import { ncoState } from '@/hooks/useNco'

import { Layout } from '@/components/layout'

import { MainPane } from './MainPane'
import { SidePane } from './SidePane'

const App: React.FC = () => {
  const isActive = !!ncoState
  const height = isActive ? 517 : 458

  return (
    <Layout className="overflow-hidden border-1 border-divider">
      <div className="m-[-1px] flex size-fit flex-row">
        {isActive && (
          <div
            className="border-r-1 border-foreground-200"
            style={{
              width: 440,
              height,
            }}
          >
            <SidePane />
          </div>
        )}

        <div
          style={{
            width: 350,
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
