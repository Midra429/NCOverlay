import type { Browser } from '@/utils/webext'

import { useEffect, useState } from 'react'
import { useDisclosure } from '@heroui/react'
import { DownloadIcon, UploadIcon } from 'lucide-react'

import { openPopout, shouldOpenPopout } from '@/entrypoints/popout/open'

import { ExportSettingsModal } from '@/components/ExportSettingsModal'
import { ImportSettingsModal } from '@/components/ImportSettingsModal'
import { ItemButton } from '@/components/ItemButton'

const createData: Browser.OpenPopoutCreateData = {
  width: 400,
  height: 500,
}

function ImportSettings() {
  const [isOpenPopout, setIsOpenPopout] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    shouldOpenPopout().then(setIsOpenPopout)
  }, [])

  const onPress = isOpenPopout
    ? () => openPopout('import-settings', createData)
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

      {!isOpenPopout && (
        <ImportSettingsModal isOpen={isOpen} onOpenChange={onOpenChange} />
      )}
    </>
  )
}

function ExportSettings() {
  const [isOpenPopout, setIsOpenPopout] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    shouldOpenPopout().then(setIsOpenPopout)
  }, [])

  const onPress = isOpenPopout
    ? () => openPopout('export-settings', createData)
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

      {!isOpenPopout && (
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
