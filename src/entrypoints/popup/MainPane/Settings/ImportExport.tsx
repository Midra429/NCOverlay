import { useEffect, useState } from 'react'
import { Button, Textarea, useDisclosure } from '@heroui/react'
import {
  DownloadIcon,
  UploadIcon,
  ChevronRightIcon,
  ClipboardPasteIcon,
  ClipboardCopyIcon,
  FileInputIcon,
  FileOutputIcon,
} from 'lucide-react'

import { settings } from '@/utils/settings/extension'
import { webext } from '@/utils/webext'

import { ItemButton } from '@/components/ItemButton'
import { Modal } from '@/components/Modal'
import { Tooltip } from '@/components/Tooltip'

import { name } from '@@/package.json'

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
    onChange() {
      setValue('')
    },
  })

  const validated = validateJson(value)

  async function onPaste() {
    setValue(await navigator.clipboard.readText())
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
          onPress: onOpen,
        }}
      />

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
                'border-divider border-1 shadow-none',
              ],
              input: 'text-tiny size-full font-mono',
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

function ExportSettings() {
  const [value, setValue] = useState('')

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  async function onCopy() {
    await navigator.clipboard.writeText(value)
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
          onPress: onOpen,
        }}
      />

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
                'border-divider border-1 shadow-none',
              ],
              input: 'text-tiny size-full font-mono',
            }}
            disableAutosize
            isReadOnly
            label="出力"
            labelPlacement="outside"
            value={value}
          />
        </div>
      </Modal>
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
