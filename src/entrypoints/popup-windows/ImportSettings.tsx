import { useState } from 'react'

import { ImportSettingsModal } from '@/components/ImportSettingsModal'

export function ImportSettings() {
  const [value, setValue] = useState('')

  return (
    <ImportSettingsModal
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
