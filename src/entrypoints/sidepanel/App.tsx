import { useNcoStateReady } from '@/hooks/useNcoState'

import { Layout } from '@/components/layout'

import { CommentList } from './CommentList'

const App: React.FC = () => {
  const ready = useNcoStateReady()

  return (
    <Layout className="h-screen w-screen overflow-hidden">
      {ready && (
        <div className="h-full w-full overflow-auto text-small">
          <CommentList />
        </div>
      )}
    </Layout>
  )
}

export default App
