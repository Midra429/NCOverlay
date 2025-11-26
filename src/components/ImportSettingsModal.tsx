import type { ModalProps } from '@/components/Modal'

import { useState } from 'react'
import { Button, Textarea } from '@heroui/react'
import {
  DownloadIcon,
  ChevronRightIcon,
  ClipboardPasteIcon,
  FileInputIcon,
} from 'lucide-react'

import { validateJsonString } from '@/utils/validateJsonString'
import { settings } from '@/utils/settings/extension'

import { Modal } from './Modal'
import { Tooltip } from './Tooltip'

export interface ImportSettingsModalProps
  extends Omit<ModalProps, 'children'> {}

export function ImportSettingsModal(props: ImportSettingsModalProps) {
  const [value, setValue] = useState('')

  const validated = validateJsonString(value, { object: true })

  function reset() {
    setValue('')
  }

  async function onPaste() {
    navigator.clipboard.readText().then(setValue)
  }

  function onSelectFile() {
    const input = document.createElement('input')

    input.type = 'file'
    input.accept = 'application/json'

    input.onchange = () => {
      input.files?.[0].text().then(setValue)
    }

    input.click()
  }

  async function onImport() {
    await settings.import(value)
  }

  function onClose() {
    reset()
    props.onClose?.()
  }

  return (
    <Modal
      {...props}
      okText="インポート"
      okIcon={<DownloadIcon className="size-4" />}
      onOk={onImport}
      isOkDisabled={!validated}
      onClose={onClose}
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
