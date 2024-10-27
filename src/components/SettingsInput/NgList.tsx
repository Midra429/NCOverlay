import type {
  NgSettingsContent,
  SettingsKey,
  StorageItems,
} from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState, useCallback } from 'react'
import {
  Button,
  Switch,
  Input as NextUIInput,
  useDisclosure,
  cn,
} from '@nextui-org/react'
import {
  PencilIcon,
  ChevronRightIcon,
  PlusIcon,
  XIcon,
  SaveIcon,
} from 'lucide-react'

import { useSettings } from '@/hooks/useSettings'

import { ItemButton } from '@/components/ItemButton'
import { Modal } from '@/components/Modal'
import { Tooltip } from '@/components/Tooltip'

type SettingsNgKey = Extract<SettingsKey, `settings:ng:${string}`>

export type Key = {
  [key in SettingsNgKey]: StorageItems[key] extends unknown[] ? key : never
}[SettingsNgKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<
  K,
  'ng-list'
> & {}

const validateRegExp = (pattern: string) => {
  try {
    new RegExp(pattern)
  } catch {
    return false
  }

  return true
}

const filterNgSettingsContents = (contents: (NgSettingsContent | null)[]) => {
  return contents.filter((val) => {
    if (!val) return false

    const content = val.content.trim()

    if (!content) return false

    if (val.isRegExp) {
      return validateRegExp(val.content)
    }

    return true
  }) as NgSettingsContent[]
}

const HeaderCell: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
> = ({ className, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        'flex items-center justify-center',
        'shrink-0 py-1.5',
        'bg-content2 text-content2-foreground',
        'border-b-1 border-divider',
        'text-tiny font-semibold',
        '[&:not(:first-child)]:border-l-1',
        className
      )}
    />
  )
}

const ItemCell: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
> = ({ className, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        'flex',
        'shrink-0 p-1.5',
        'border-b-1 border-divider',
        'text-small',
        '[&:not(:first-child)]:border-l-1',
        className
      )}
    />
  )
}

const Header: React.FC = () => {
  return (
    <div className="sticky top-0 z-20 flex flex-row">
      <HeaderCell className="w-[calc(100%-7rem)]">テキスト</HeaderCell>

      <HeaderCell className="w-[4rem]">正規表現</HeaderCell>

      <HeaderCell className="w-[3rem]">削除</HeaderCell>
    </div>
  )
}

const Item: React.FC<{
  init: NgSettingsContent
  onValueChange: (value: NgSettingsContent | null) => void
}> = ({ init, onValueChange }) => {
  const [content, setContent] = useState<string>(init.content)
  const [isRegExp, setIsRegExp] = useState<boolean>(init.isRegExp ?? false)
  const [isRegExpValidated, setIsRegExpValidated] = useState<boolean>(true)

  useEffect(() => {
    setIsRegExpValidated(!isRegExp || !content || validateRegExp(content))

    onValueChange({ content, isRegExp })
  }, [content, isRegExp])

  return (
    <div className="flex w-full flex-row">
      <ItemCell className="w-[calc(100%-7rem)] p-0">
        <NextUIInput
          classNames={{
            inputWrapper: [
              'h-full shadow-none',
              isRegExpValidated && 'bg-transparent',
            ],
          }}
          size="sm"
          radius="none"
          color={isRegExpValidated ? 'default' : 'danger'}
          placeholder={isRegExp ? '^(w|ｗ){3,}$' : 'ｗｗｗ'}
          value={content}
          onValueChange={setContent}
        />
      </ItemCell>

      <ItemCell
        className={cn('flex items-center justify-center', 'w-[4rem] p-0 py-1')}
      >
        <Switch
          classNames={{
            wrapper: 'm-0',
          }}
          size="sm"
          isSelected={isRegExp}
          onValueChange={setIsRegExp}
        />
      </ItemCell>

      <ItemCell
        className={cn('flex items-center justify-center', 'w-[3rem] p-0 py-1')}
      >
        <Button
          className="text-foreground"
          size="sm"
          variant="light"
          radius="full"
          isIconOnly
          onPress={() => onValueChange(null)}
        >
          <XIcon className="size-4" />
        </Button>
      </ItemCell>
    </div>
  )
}

export const Input: React.FC<Omit<Props, 'type'>> = (props) => {
  const [value, setValue] = useSettings(props.settingsKey)

  const [tmpValue, setTmpValue] = useState<(NgSettingsContent | null)[]>([])

  const onAdd = useCallback(() => {
    setTmpValue((val) => [...val, { content: '' }])
  }, [])

  const onSave = useCallback(() => {
    setValue(filterNgSettingsContents(tmpValue))
  }, [tmpValue])

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    setTmpValue(isOpen ? value : [])
  }, [isOpen])

  return (
    <>
      <div className="py-2">
        <ItemButton
          title={props.label}
          description={`${value.length}件`}
          button={{
            variant: 'flat',
            color: 'default',
            startContent: <PencilIcon />,
            text: '編集',
            onPress: onOpen,
          }}
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
            <span>NG設定</span>
            <ChevronRightIcon className="size-5 opacity-50" />
            <span>{props.label}</span>
          </div>
        }
        headerEndContent={
          <Tooltip content="追加" placement="left">
            <Button
              size="sm"
              variant="flat"
              color="primary"
              isIconOnly
              onPress={onAdd}
            >
              <PlusIcon className="size-4" />
            </Button>
          </Tooltip>
        }
      >
        <Header />

        <div className="flex flex-col bg-content1">
          {tmpValue.map((val, idx, ary) => {
            if (!val) return

            return (
              <Item
                key={idx}
                init={val}
                onValueChange={(val) => {
                  const tmpAry = [...ary]

                  tmpAry[idx] = val

                  setTmpValue(tmpAry)
                }}
              />
            )
          })}
        </div>
      </Modal>
    </>
  )
}
