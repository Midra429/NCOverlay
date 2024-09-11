import { useEffect, useState } from 'react'
import { Divider } from '@nextui-org/react'

import { webext } from '@/utils/webext'
import { filesize } from '@/utils/filesize'
import { storage } from '@/utils/storage/extension'
import { settings } from '@/utils/settings/extension'

export const StorageSizes: React.FC = () => {
  const [storageBytes, setStorageBytes] = useState<number>(0)
  const [settingsBytes, setSettingsBytes] = useState<number>(0)

  useEffect(() => {
    const updateStorageSizes = () => {
      storage.getBytesInUse().then(setStorageBytes)
      settings.getBytesInUse().then(setSettingsBytes)
    }

    updateStorageSizes()

    webext.storage.local.onChanged.addListener(updateStorageSizes)

    return () => {
      webext.storage.local.onChanged.removeListener(updateStorageSizes)
    }
  }, [])

  return (
    <div className="flex flex-row items-center justify-evenly py-1.5">
      <span className="text-tiny">全体: {filesize(storageBytes)}</span>

      <Divider className="h-4" orientation="vertical" />

      <span className="text-tiny">設定: {filesize(settingsBytes)}</span>

      <Divider className="h-4" orientation="vertical" />

      <span className="text-tiny">
        その他: {filesize(storageBytes - settingsBytes)}
      </span>
    </div>
  )
}
