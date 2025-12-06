import { Layout } from '@/components/Layout'
import { PositionControl } from '@/components/PositionControl'

import { CommentList } from './CommentList'

function App() {
  return (
    <Layout className="h-screen w-screen overflow-hidden">
      <div className="flex size-full flex-col bg-content1 text-small">
        <CommentList />

        <div className="ml-auto max-w-[450px]">
          <PositionControl />
        </div>
      </div>
    </Layout>
  )
}

export default App
