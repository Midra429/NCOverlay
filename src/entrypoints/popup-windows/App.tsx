import type { ModalProps } from '@/components/Modal'
import type { OpenAction } from './open'

import { Layout } from '@/components/Layout'
import { ImportSettingsModal } from '@/components/ImportSettingsModal'
import { ExportSettingsModal } from '@/components/ExportSettingsModal'
import { SelectCommentFileModal } from '@/components/SelectCommentFileModal'

const action = new URL(location.href).searchParams.get('action') as OpenAction

const Modal: (props: Omit<ModalProps, 'children'>) => React.ReactNode = {
  'import-settings': ImportSettingsModal,
  'export-settings': ExportSettingsModal,
  'select-comment-file': SelectCommentFileModal,
}[action]

function App() {
  return (
    <Layout className="size-full overflow-hidden">
      <Modal
        fullWidth
        disableAnimation
        defaultOpen
        cancelText="閉じる"
        onClose={() => window.close()}
      />
    </Layout>
  )
}

export default App
