import { cn } from '@nextui-org/react'

import { useNcoStateReady } from '@/hooks/useNco'

import { Layout } from '@/components/layout'
import { PositionControl } from '@/components/quickpanel/presets/position-control'

import { CommentList } from './CommentList'

const App: React.FC = () => {
  const ready = useNcoStateReady()

  return (
    <Layout className="h-screen w-screen overflow-hidden">
      {ready && (
        <div
          className={cn('flex flex-col', 'size-full text-small', 'bg-content1')}
        >
          <CommentList />

          <div className="ml-auto max-w-[450px]">
            <PositionControl />
          </div>
        </div>
      )}
    </Layout>
  )
}

export default App
