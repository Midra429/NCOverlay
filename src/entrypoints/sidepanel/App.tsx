import { Layout } from '@/components/Layout'

import { CommentList } from './CommentList'
import { Footer } from './Footer'
import { Header } from './Header'

function App() {
  return (
    <Layout className="h-screen w-screen overflow-hidden">
      <div className="flex size-full flex-col bg-content1 text-small">
        <Header />

        <CommentList />

        <Footer />
      </div>
    </Layout>
  )
}

export default App
