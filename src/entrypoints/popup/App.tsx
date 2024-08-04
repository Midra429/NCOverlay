import { ncoState } from '@/hooks/useNcoState'

import { Layout } from '@/components/layout'

import { MainPane } from './MainPane'
import { SidePane } from './SidePane'

const App: React.FC = () => {
  const isActive = !!ncoState

  return (
    <Layout className="flex h-fit w-fit flex-row overflow-hidden">
      {isActive && (
        <div
          className="border-r-1 border-foreground-200"
          style={{
            width: 450,
            height: 520,
          }}
        >
          <SidePane />
        </div>
      )}

      <div
        style={{
          width: 350,
          height: isActive ? 520 : 460,
        }}
      >
        <MainPane quickpanel={isActive} />
      </div>
    </Layout>
  )
}

export default App
