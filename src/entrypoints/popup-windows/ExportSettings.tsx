import { ExportSettingsModal } from '@/components/ExportSettingsModal'

export function ExportSettings() {
  return (
    <ExportSettingsModal
      fullWidth
      disableAnimation
      defaultOpen
      cancelText="閉じる"
      onClose={() => window.close()}
    />
  )
}
