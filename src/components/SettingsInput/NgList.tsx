import type {
  NgSettingsContent,
  SettingsKey,
  StorageItems,
} from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import {
  Button,
  Switch,
  Input as HeroUIInput,
  useDisclosure,
  cn,
} from '@heroui/react'
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
  [P in SettingsNgKey]: StorageItems[P] extends unknown[] ? P : never
}[SettingsNgKey]

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'ng-list'> {}

function validateRegExp(pattern: string) {
  try {
    new RegExp(pattern)
  } catch {
    return false
  }

  return true
}

function filterNgSettingsContents(contents: (NgSettingsContent | null)[]) {
  return contents.filter((val) => {
    const content = val?.content.trim()

    if (content) {
      return val?.isRegExp ? validateRegExp(content) : true
    }

    return false
  }) as NgSettingsContent[]
}

interface CellProps
  extends React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> {}

function HeaderCell({ className, ...props }: CellProps) {
  return (
    <div
      {...props}
      className={cn(
        'flex items-center justify-center',
        'shrink-0 py-1.5',
        'bg-content2 text-content2-foreground',
        'border-divider border-b-1',
        'font-semibold text-tiny',
        'not-first:border-l-1',
        className
      )}
    />
  )
}

function ItemCell({ className, ...props }: CellProps) {
  return (
    <div
      {...props}
      className={cn(
        'flex',
        'shrink-0 p-1.5',
        'border-divider border-b-1',
        'text-small',
        'not-first:border-l-1',
        className
      )}
    />
  )
}

function Header() {
  return (
    <div className="sticky top-0 z-20 flex flex-row">
      <HeaderCell className="w-[calc(100%-7rem)]">テキスト</HeaderCell>

      <HeaderCell className="w-16">正規表現</HeaderCell>

      <HeaderCell className="w-12">削除</HeaderCell>
    </div>
  )
}

interface ItemProps {
  init: NgSettingsContent
  onValueChange: (value: NgSettingsContent | null) => void
}

function Item({ init, onValueChange }: ItemProps) {
  const [content, setContent] = useState<string>(init.content)
  const [isRegExp, setIsRegExp] = useState<boolean>(init.isRegExp ?? false)
  const [isRegExpValidated, setIsRegExpValidated] = useState<boolean>(true)

  useEffect(() => {
    setIsRegExpValidated(!isRegExp || !content || validateRegExp(content))

    onValueChange({
      content,
      isRegExp: isRegExp || undefined,
    })
  }, [content, isRegExp])

  return (
    <div className="flex w-full flex-row">
      <ItemCell className="w-[calc(100%-7rem)] p-0">
        <HeroUIInput
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
        className={cn('flex items-center justify-center', 'w-16 p-0 py-1')}
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
        className={cn('flex items-center justify-center', 'w-12 p-0 py-1')}
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

export function Input(props: Props) {
  const [value, setValue] = useSettings(props.settingsKey)

  const [tmpValue, setTmpValue] = useState<(NgSettingsContent | null)[]>([])

  function onAdd() {
    setTmpValue((val) => [...val, { content: '' }])
  }

  function onSave() {
    setValue(filterNgSettingsContents(tmpValue))
  }

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
