import type { SettingsExportItems } from '@/types/storage'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Textarea, useDisclosure } from '@nextui-org/react'
import {
  DownloadIcon,
  UploadIcon,
  ChevronRightIcon,
  ClipboardCopyIcon,
} from 'lucide-react'

import { settings } from '@/utils/settings/extension'

import { ItemButton } from '@/components/ItemButton'
import { Modal } from '@/components/Modal'

const ImportSettings: React.FC = () => {
  const [value, setValue] = useState('')

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const isValidated = useMemo(() => {
    try {
      return !Array.isArray(JSON.parse(value))
    } catch {
      return false
    }
  }, [value])

  const onImport = useCallback(async () => {
    await settings.import(value)
  }, [value])

  useEffect(() => {
    return () => setValue('')
  }, [isOpen])

  return (
    <>
      <ItemButton
        title="設定をインポート"
        button={{
          variant: 'flat',
          color: 'default',
          startContent: <DownloadIcon />,
          text: 'インポート',
          onPress: onOpen,
        }}
      />

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        okText="インポート"
        okIcon={<DownloadIcon className="size-4" />}
        onOk={onImport}
        isOkDisabled={!isValidated}
        header={
          <div className="flex flex-row items-center gap-0.5">
            <span>ストレージ</span>
            <ChevronRightIcon className="size-5 opacity-50" />
            <span>設定をインポート</span>
          </div>
        }
      >
        <div className="size-full bg-content1 p-2">
          <Textarea
            classNames={{
              base: 'size-full',
              label: 'hidden',
              inputWrapper: [
                '!h-full !w-full',
                'border-1 border-divider shadow-none',
              ],
              input: 'size-full font-mono text-tiny',
            }}
            disableAutosize
            label="入力"
            labelPlacement="outside"
            value={value}
            onValueChange={setValue}
          />
        </div>
      </Modal>
    </>
  )
}

const ExportSettings: React.FC = () => {
  const [values, setValues] = useState<SettingsExportItems | null>(null)

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(JSON.stringify(values))
  }, [values])

  useEffect(() => {
    if (isOpen) {
      settings.export().then(setValues)
    }

    return () => setValues(null)
  }, [isOpen])

  return (
    <>
      <ItemButton
        title="設定をエクスポート"
        button={{
          variant: 'flat',
          color: 'default',
          startContent: <UploadIcon />,
          text: 'エクスポート',
          onPress: onOpen,
        }}
      />

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        okText="コピー"
        okIcon={<ClipboardCopyIcon className="size-4" />}
        onOk={onCopy}
        header={
          <div className="flex flex-row items-center gap-0.5">
            <span>ストレージ</span>
            <ChevronRightIcon className="size-5 opacity-50" />
            <span>設定をエクスポート</span>
          </div>
        }
      >
        <div className="size-full bg-content1 p-2">
          <Textarea
            classNames={{
              base: 'size-full',
              label: 'hidden',
              inputWrapper: [
                '!h-full !w-full',
                'border-1 border-divider shadow-none',
              ],
              input: 'size-full font-mono text-tiny',
            }}
            disableAutosize
            isReadOnly
            label="出力"
            labelPlacement="outside"
            value={JSON.stringify(values, null, 2)}
          />
        </div>
      </Modal>
    </>
  )
}

export const ImportExport: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 py-2">
      <ImportSettings />

      <ExportSettings />
    </div>
  )
}
