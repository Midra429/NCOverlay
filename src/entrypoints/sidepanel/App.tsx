import { cn } from '@heroui/react'

import { useNcoStateReady } from '@/hooks/useNco'

import { Layout } from '@/components/Layout'
import { PositionControl } from '@/components/PositionControl'

import { CommentList } from './CommentList'

const App: React.FC = () => {
  const ready = useNcoStateReady()

  return (
    <Layout className="h-screen w-screen overflow-hidden">
      {ready && (
        <div
          className={cn('flex flex-col', 'text-small size-full', 'bg-content1')}
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
