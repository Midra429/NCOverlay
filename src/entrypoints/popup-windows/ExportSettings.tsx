import { useState } from 'react'

import { ExportSettingsModal } from '@/components/ExportSettingsModal'

export function ExportSettings() {
  const [value, setValue] = useState('')

  return (
    <ExportSettingsModal
      fullWidth
      disableAnimation
      cancelText="閉じる"
      isOpen
      onOpenChange={(isOpen) => !isOpen && window.close()}
      value={value}
      setValue={setValue}
    />
  )
}
