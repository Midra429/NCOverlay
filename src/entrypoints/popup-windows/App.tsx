import type { OpenAction } from './open'

import { Layout } from '@/components/Layout'

import { ImportSettings } from './ImportSettings'
import { ExportSettings } from './ExportSettings'
import { SelectCommentFiles } from './SelectCommentFiles'

const action = new URL(location.href).searchParams.get('action') as OpenAction

const content =
  (action === 'import-settings' && <ImportSettings />) ||
  (action === 'export-settings' && <ExportSettings />) ||
  (action === 'select-comment-files' && <SelectCommentFiles />)

function App() {
  return <Layout className="size-full overflow-hidden">{content}</Layout>
}

export default App
