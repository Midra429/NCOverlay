import { cn } from '@nextui-org/react'

import { ncoState } from '@/hooks/useNco'

import { Layout } from '@/components/layout'

import { MainPane } from './MainPane'
import { SidePane } from './SidePane'

const App: React.FC = () => {
  const isActive = !!ncoState

  return (
    <Layout
      className={cn(
        'flex h-fit w-fit flex-row',
        'border-1 border-foreground-200',
        'overflow-hidden'
      )}
    >
      {isActive && (
        <div
          className="border-r-1 border-foreground-200"
          style={{
            width: 440,
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
