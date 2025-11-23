import { useState } from 'react'
import { Button, Textarea } from '@heroui/react'
import {
  DownloadIcon,
  ChevronRightIcon,
  ClipboardPasteIcon,
  FileInputIcon,
} from 'lucide-react'

import { settings } from '@/utils/settings/extension'

import { Modal } from '@/components/Modal'
import { Tooltip } from '@/components/Tooltip'

function validateJson(value: string): boolean {
  try {
    return !Array.isArray(JSON.parse(value))
  } catch {
    return false
  }
}

export function ImportSettings() {
  const [value, setValue] = useState('')

  const validated = validateJson(value)

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
    <Modal
      fullWidth
      disableAnimation
      isOpen
      onOpenChange={(isOpen) => !isOpen && window.close()}
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
  )
}
