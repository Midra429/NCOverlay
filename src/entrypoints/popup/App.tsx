import { ncoState } from '@/hooks/useNcoState'

import { Layout } from '@/components/layout'

import { MainPane } from './MainPane'
import { SidePane } from './SidePane'

const App: React.FC = () => {
  const isActive = !!ncoState
  // const isActive = true

  return (
    <Layout
      className="flex flex-row overflow-hidden"
      style={{
        width: 'fit-content',
        height: 'fit-content',
        maxWidth: 800,
        maxHeight: 600,
      }}
    >
      {isActive && (
        <div
          className="border-r-1 border-foreground-200"
          style={{
            width: 450,
            height: 500,
          }}
        >
          <SidePane />
        </div>
      )}

      <div
        style={{
          width: 350,
          height: isActive ? 500 : 450,
        }}
      >
        <MainPane quickpanel={isActive} />
      </div>
    </Layout>
  )
}

export default App
