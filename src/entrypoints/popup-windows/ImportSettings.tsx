import { ImportSettingsModal } from '@/components/ImportSettingsModal'

export function ImportSettings() {
  return (
    <ImportSettingsModal
      fullWidth
      disableAnimation
      defaultOpen
      cancelText="閉じる"
      onClose={() => window.close()}
    />
  )
}
