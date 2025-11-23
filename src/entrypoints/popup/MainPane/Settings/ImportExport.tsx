import { useEffect, useState } from 'react'
import { Button, Textarea, useDisclosure, addToast } from '@heroui/react'
import {
  DownloadIcon,
  UploadIcon,
  ChevronRightIcon,
  ClipboardPasteIcon,
  ClipboardCopyIcon,
  FileInputIcon,
  FileOutputIcon,
} from 'lucide-react'

import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'

import { ItemButton } from '@/components/ItemButton'
import { Modal } from '@/components/Modal'
import { Tooltip } from '@/components/Tooltip'

import { name } from '@@/package.json'
import { openPopupWindow } from '@/entrypoints/popup-windows/open'

function validateJson(value: string): boolean {
  try {
    return !Array.isArray(JSON.parse(value))
  } catch {
    return false
  }
}

function ImportSettings() {
  const [value, setValue] = useState('')

  const { isOpen, onOpen, onOpenChange } = useDisclosure({
    onChange: () => setValue(''),
  })

  const validated = validateJson(value)

  const onPress = webext.isFirefox
    ? () => {
        openPopupWindow('import-settings', {
          width: 370,
          height: 470,
        })
      }
    : onOpen

  async function onPaste() {
    navigator.clipboard.readText().then(setValue)
  }

  function onSelectFile() {
    const input = document.createElement('input')

    input.type = 'file'
    input.accept = 'application/json'

    input.onchange = () => {
      const file = input.files?.item(0)

      if (file) {
        const fileReader = new FileReader()

        fileReader.onload = () => {
          setValue(fileReader.result?.toString() ?? '')
        }

        fileReader.readAsText(file)
      }
    }

    input.click()
  }

  async function onImport() {
    await settings.import(value)
  }

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
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          okText="インポート"
          okIcon={<DownloadIcon className="size-4" />}
          onOk={onImport}
          isOkDisabled={!validated}
          header={
            <div className="flex flex-row items-center gap-0.5">
              <span>ストレージ</span>
              <ChevronRightIcon className="size-5 opacity-50" />
              <span>設定をインポート</span>
            </div>
          }
          headerEndContent={
            <Tooltip content="貼り付け" placement="left">
              <Button size="sm" variant="flat" isIconOnly onPress={onPaste}>
                <ClipboardPasteIcon className="size-4" />
              </Button>
            </Tooltip>
          }
          footerStartContent={
            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={<FileInputIcon className="size-4" />}
              onPress={onSelectFile}
            >
              選択
            </Button>
          }
        >
          <div className="size-full bg-content1 p-2">
            <Textarea
              classNames={{
                base: 'size-full',
                label: 'hidden',
                inputWrapper: [
                  'h-full! w-full!',
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
      )}
    </>
  )
}

function ExportSettings() {
  const [value, setValue] = useState('')

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const onPress = webext.isFirefox
    ? () => {
        openPopupWindow('export-settings', {
          width: 370,
          height: 470,
        })
      }
    : onOpen

  async function onCopy() {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        addToast({
          color: 'success',
          title: '設定をコピーしました',
        })
      })
      .catch(() => {
        addToast({
          color: 'danger',
          title: '設定のコピーに失敗しました',
        })
      })
  }

  async function onSaveFile() {
    const url = URL.createObjectURL(
      new Blob([value], {
        type: 'application/json',
      })
    )

    const { version } = webext.runtime.getManifest()

    const filename = `${name}_settings_${version}.json`

    await webext.downloads.download({
      url,
      filename,
      saveAs: true,
    })

    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (isOpen) {
      settings.export().then((values) => {
        setValue(JSON.stringify(values, null, 2))
      })
    }

    return () => setValue('')
  }, [isOpen])

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
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          okText="保存"
          okIcon={<FileOutputIcon className="size-4" />}
          onOk={onSaveFile}
          header={
            <div className="flex flex-row items-center gap-0.5">
              <span>ストレージ</span>
              <ChevronRightIcon className="size-5 opacity-50" />
              <span>設定をエクスポート</span>
            </div>
          }
          headerEndContent={
            <Tooltip content="コピー" placement="left">
              <Button size="sm" variant="flat" isIconOnly onPress={onCopy}>
                <ClipboardCopyIcon className="size-4" />
              </Button>
            </Tooltip>
          }
        >
          <div className="size-full bg-content1 p-2">
            <Textarea
              classNames={{
                base: 'size-full',
                label: 'hidden',
                inputWrapper: [
                  'h-full! w-full!',
                  'border-1 border-divider shadow-none',
                ],
                input: 'size-full font-mono text-tiny',
              }}
              disableAutosize
              isReadOnly
              label="出力"
              labelPlacement="outside"
              value={value}
            />
          </div>
        </Modal>
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
