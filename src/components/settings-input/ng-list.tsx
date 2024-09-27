import type {
  NgSettingsContent,
  SettingsKey,
  StorageItems,
} from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState, useCallback } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
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

import { ItemButton } from '@/components/item-button'

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
        'text-tiny font-bold',
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

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    setTmpValue(isOpen ? value : [])
  }, [isOpen])

  return (
    <>
      <div className="py-2">
        <ItemButton
          key={props.settingsKey}
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
        classNames={{
          wrapper: 'justify-end',
          base: 'max-w-[370px]',
          header: 'border-b-1 border-divider p-2 text-medium',
          body: 'p-0',
          footer: 'border-t-1 border-divider p-2',
        }}
        size="full"
        hideCloseButton
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => {
            const onPressAdd = useCallback(() => {
              setTmpValue((val) => [...val, { content: '' }])
            }, [])

            const onPressSave = useCallback(() => {
              setValue(filterNgSettingsContents(tmpValue))

              onClose()
            }, [tmpValue])

            return (
              <>
                <ModalHeader className="flex flex-row items-center gap-0.5">
                  <span>NG設定</span>
                  <ChevronRightIcon className="size-5 opacity-50" />
                  <span>{props.label}</span>
                </ModalHeader>

                <ModalBody className="max-h-full gap-0 overflow-auto">
                  <Header />

                  <div className="flex flex-col">
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
                </ModalBody>

                <ModalFooter className="justify-between">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<PlusIcon className="size-4" />}
                    onPress={onPressAdd}
                  >
                    追加
                  </Button>

                  <div className="flex flex-row gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="default"
                      onPress={onClose}
                    >
                      キャンセル
                    </Button>

                    <Button
                      size="sm"
                      color="primary"
                      startContent={<SaveIcon className="size-4" />}
                      onPress={onPressSave}
                    >
                      保存
                    </Button>
                  </div>
                </ModalFooter>
              </>
            )
          }}
        </ModalContent>
      </Modal>
    </>
  )
}
