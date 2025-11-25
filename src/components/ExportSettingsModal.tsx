import type { ModalProps } from '@/components/Modal'

import { useEffect } from 'react'
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

export interface ExportSettingsModalProps extends Omit<ModalProps, 'children'> {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
}

export function ExportSettingsModal({
  value,
  setValue,
  ...props
}: ExportSettingsModalProps) {
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

    const filename = `${name}_settings_${version}.json`

    await webext.downloads.download({
      url,
      filename,
      saveAs: true,
    })

    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    settings.export().then((values) => {
      setValue(JSON.stringify(values, null, 2))
    })
  }, [])

  return (
    <Modal
      {...props}
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
  )
}
