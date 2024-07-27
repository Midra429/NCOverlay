import { cn } from '@nextui-org/react'

import { useNcoStateReady } from '@/hooks/useNcoState'

import { Layout } from '@/components/layout'
import { PositionControl } from '@/components/quickpanel/presets/position-control'

import { CommentList } from './CommentList'

const App: React.FC = () => {
  const ready = useNcoStateReady()

  return (
    <Layout className="h-screen w-screen overflow-hidden">
      {ready && (
        <div
          className={cn(
            'flex flex-col',
            'h-full w-full text-small',
            'bg-content1',
            '[&>*]:rounded-none [&>*]:border-none'
          )}
        >
          <CommentList />

          <PositionControl />
        </div>
      )}
    </Layout>
  )
}

export default App
