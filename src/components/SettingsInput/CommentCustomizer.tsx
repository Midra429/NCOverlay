import type { CommentCustomize } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { Button, Divider, useDisclosure } from '@heroui/react'
import {
  ChevronRightIcon,
  PencilIcon,
  RotateCcwIcon,
  SaveIcon,
} from 'lucide-react'

import {
  COMMENT_CUSTOMIZE_TARGET_KEYS,
  SOURCE_NAMES,
} from '@/constants/settings'
import { useSettings } from '@/hooks/useSettings'

import { CommentCustomizer } from '@/components/CommentCustomizer'
import { ItemButton } from '@/components/ItemButton'
import { Modal } from '@/components/Modal'
import { PanelItem } from '@/components/PanelItem'
import { Tooltip } from '@/components/Tooltip'

import { initConditional } from '.'

export type Key = 'settings:comment:customize'

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'comment-customizer'> {}

export function Input(props: Omit<Props, 'inputType'>) {
  const [value, setValue] = useSettings(props.settingsKey)
  const [isDisabled, setIsDisabled] = useState(false)
  const [tmpValue, setTmpValue] = useState<CommentCustomize>({})

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  function onReset() {
    setTmpValue({})
  }

  function onSave() {
    setValue(tmpValue)
  }

  useEffect(() => initConditional(props.disable, setIsDisabled), [])

  useEffect(() => {
    setTmpValue(isOpen ? value : {})
  }, [isOpen, value])

  return (
    <>
      <div className="py-2">
        <ItemButton
          title={props.label}
          description={props.description}
          button={{
            variant: 'flat',
            startContent: <PencilIcon />,
            text: '編集',
            onPress: onOpen,
          }}
          isDisabled={isDisabled}
        />
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        okText="保存"
        okIcon={<SaveIcon className="size-4" />}
        onOk={onSave}
        header={
          <div className="flex flex-row items-center gap-0.5">
            <span>コメント</span>
            <ChevronRightIcon className="size-5 opacity-50" />
            <span>{props.label}</span>
          </div>
        }
        headerEndContent={
          <Tooltip content="リセット" placement="left">
            <Button
              size="sm"
              variant="flat"
              color="danger"
              isIconOnly
              onPress={onReset}
            >
              <RotateCcwIcon className="size-4" />
            </Button>
          </Tooltip>
        }
      >
        <div className="flex flex-col gap-2 p-2">
          {COMMENT_CUSTOMIZE_TARGET_KEYS.map((key) => (
            <PanelItem key={key} className="flex flex-col gap-2 p-2">
              <h2 className="font-bold text-small">{SOURCE_NAMES[key]}</h2>

              <Divider orientation="horizontal" />

              <CommentCustomizer
                color={tmpValue[key]?.color}
                opacity={tmpValue[key]?.opacity}
                onColorChange={(color) => {
                  setTmpValue((val) => ({
                    ...val,
                    [key]: { ...val[key], color },
                  }))
                }}
                onOpacityChange={(opacity) => {
                  setTmpValue((val) => ({
                    ...val,
                    [key]: { ...val[key], opacity },
                  }))
                }}
              />
            </PanelItem>
          ))}
        </div>
      </Modal>
    </>
  )
}
