import type { ModalProps } from '@/components/Modal'

import { useState } from 'react'
import { Button, Textarea, addToast } from '@heroui/react'
import {
  ChevronRightIcon,
  ClipboardCopyIcon,
  FileOutputIcon,
} from 'lucide-react'

import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'

import { Modal } from './Modal'
import { Tooltip } from './Tooltip'

import { name } from '@@/package.json'

const { version } = webext.runtime.getManifest()

export interface ExportSettingsModalProps
  extends Omit<ModalProps, 'children'> {}

export function ExportSettingsModal(props: ExportSettingsModalProps) {
  const [text, setText] = useState('')

  function reset() {
    setText('')
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text)

      addToast({
        color: 'success',
        title: '設定をコピーしました',
      })
    } catch {
      addToast({
        color: 'danger',
        title: '設定のコピーに失敗しました',
      })
    }
  }

  async function onSaveFile() {
    const url = URL.createObjectURL(
      new Blob([text], {
        type: 'application/json',
      })
    )

    const filename = `${name}_settings_${version}.json`

    await webext.downloads.download({
      url,
      filename,
      saveAs: true,
    })

    URL.revokeObjectURL(url)
  }

  async function onOpen() {
    const values = await settings.export()

    setText(JSON.stringify(values, null, 2))
  }

  function onClose() {
    reset()
    props.onClose?.()
  }

  return (
    <Modal
      {...props}
      okText="保存"
      okIcon={<FileOutputIcon className="size-4" />}
      onOk={onSaveFile}
      onOpen={onOpen}
      onClose={onClose}
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
              'h-full! w-full! overflow-hidden p-0',
              'border-1 border-divider shadow-none',
            ],
            input: ['size-full px-3 py-2', 'font-mono text-tiny'],
          }}
          disableAutosize
          isReadOnly
          label="出力"
          labelPlacement="outside"
          value={text}
        />
      </div>
    </Modal>
  )
}
