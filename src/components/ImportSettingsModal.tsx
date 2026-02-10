import type { ModalProps } from '@/components/Modal'

import { useRef, useState } from 'react'
import { Button, Textarea } from '@heroui/react'
import {
  ChevronRightIcon,
  ClipboardPasteIcon,
  DownloadIcon,
  FileInputIcon,
} from 'lucide-react'

import { validateJsonString } from '@/utils/validateJsonString'
import { settings } from '@/utils/settings/extension'

import { Modal } from './Modal'
import { Tooltip } from './Tooltip'

export interface ImportSettingsModalProps
  extends Omit<ModalProps, 'children'> {}

export function ImportSettingsModal(props: ImportSettingsModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [text, setText] = useState('')

  const validated = !!text && validateJsonString(text, { object: true })

  function reset() {
    setText('')
  }

  async function onPaste() {
    const text = await navigator.clipboard.readText()

    setText(text)
  }

  async function onChange({ target }: React.ChangeEvent<HTMLInputElement>) {
    const file = target.files?.[0] ?? null
    const text = (await file?.text()) ?? ''

    setText(text)
  }

  async function onImport() {
    await settings.import(text)
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
          onPress={() => inputRef.current?.click()}
        >
          選択
        </Button>
      }
    >
      <input
        type="file"
        accept="application/json"
        hidden
        onChange={onChange}
        ref={inputRef}
      />

      <div className="size-full bg-content1 p-2">
        <Textarea
          classNames={{
            base: 'size-full',
            label: 'hidden',
            inputWrapper: [
              'h-full! w-full! overflow-hidden p-0',
              'border-1 border-divider shadow-none',
            ],
            input: ['size-full px-3 py-2', 'font-mono text-tiny'],
          }}
          disableAutosize
          label="入力"
          labelPlacement="outside"
          value={text}
          onValueChange={setText}
        />
      </div>
    </Modal>
  )
}
