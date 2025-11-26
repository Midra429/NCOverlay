import { useDisclosure } from '@heroui/react'
import { DownloadIcon, UploadIcon } from 'lucide-react'

import { webext } from '@/utils/webext'

import { ItemButton } from '@/components/ItemButton'
import { ImportSettingsModal } from '@/components/ImportSettingsModal'
import { ExportSettingsModal } from '@/components/ExportSettingsModal'

import { openPopupWindow } from '@/entrypoints/popup-windows/open'

const popupWindowOptions = {
  width: 370,
  height: 470,
}

function ImportSettings() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const onPress = webext.isFirefox
    ? () => openPopupWindow('import-settings', popupWindowOptions)
    : onOpen

  return (
    <>
      <ItemButton
        title="設定をインポート"
        button={{
          variant: 'flat',
          startContent: <DownloadIcon />,
          text: 'インポート',
          onPress,
        }}
      />

      {!webext.isFirefox && (
        <ImportSettingsModal isOpen={isOpen} onOpenChange={onOpenChange} />
      )}
    </>
  )
}

function ExportSettings() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const onPress = webext.isFirefox
    ? () => openPopupWindow('export-settings', popupWindowOptions)
    : onOpen

  return (
    <>
      <ItemButton
        title="設定をエクスポート"
        button={{
          variant: 'flat',
          startContent: <UploadIcon />,
          text: 'エクスポート',
          onPress,
        }}
      />

      {!webext.isFirefox && (
        <ExportSettingsModal isOpen={isOpen} onOpenChange={onOpenChange} />
      )}
    </>
  )
}

export function ImportExport() {
  return (
    <div className="flex flex-col gap-2 py-2">
      <ImportSettings />

      <ExportSettings />
    </div>
  )
}
