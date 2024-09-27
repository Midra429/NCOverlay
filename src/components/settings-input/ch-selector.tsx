import type {
  JikkyoDtvChannelId,
  JikkyoBsCsChannelId,
  JikkyoChannelId,
} from '@midra/nco-api/types/constants'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState, useCallback } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
  CheckboxGroup,
  Checkbox,
  useDisclosure,
  cn,
} from '@nextui-org/react'
import {
  PencilIcon,
  ChevronRightIcon,
  RotateCcwIcon,
  SaveIcon,
} from 'lucide-react'
import {
  JIKKYO_CHANNELS,
  JIKKYO_CHANNELS_DTV,
  JIKKYO_CHANNELS_BS_CS,
} from '@midra/nco-api/constants'

import { useSettings } from '@/hooks/useSettings'

import { ItemButton } from '@/components/item-button'

const CH_GROUPS = {
  dtv: {
    title: '地デジ',
    ids: Object.keys(JIKKYO_CHANNELS_DTV) as JikkyoDtvChannelId[],
  },
  bs_cs: {
    title: 'BS / CS',
    ids: Object.keys(JIKKYO_CHANNELS_BS_CS) as JikkyoBsCsChannelId[],
  },
}

export type Key = 'settings:comment:jikkyoChannelIds'

export type Props<K extends Key = Key> = SettingsInputBaseProps<
  K,
  'ch-selector'
> & {
  options: {
    label: string
    value: JikkyoChannelId
  }[]
}

type ChSelectorProps = {
  type: keyof typeof CH_GROUPS
  chIds: JikkyoDtvChannelId[] | JikkyoBsCsChannelId[]
  setChIds:
    | ((ids: JikkyoDtvChannelId[]) => void)
    | ((ids: JikkyoBsCsChannelId[]) => void)
}

const ChSelector: React.FC<ChSelectorProps> = ({ type, chIds, setChIds }) => {
  const channel = CH_GROUPS[type]

  return (
    <CheckboxGroup
      classNames={{
        label: 'hidden text-small text-foreground',
        wrapper: 'gap-1.5 p-1.5',
      }}
      size="sm"
      orientation="horizontal"
      label={channel.title}
      value={chIds}
      onChange={setChIds as any}
    >
      {channel.ids.map((id, idx) => (
        <Checkbox
          key={idx}
          classNames={{
            base: cn(
              'w-[calc(50%-0.375rem/2)] max-w-none',
              'm-0 px-1.5 py-1',
              'bg-default-100 hover:bg-default-200',
              'data-[selected=true]:bg-primary/15 dark:data-[selected=true]:bg-primary/20',
              'rounded-medium',
              'border-1 border-divider hover:border-default-400',
              'data-[selected=true]:border-primary',
              'transition-colors motion-reduce:transition-none',
              'cursor-pointer'
            ),
            wrapper: cn(
              'rounded-full',
              'before:rounded-full before:border-1 before:!bg-default-50',
              'after:rounded-full'
            ),
            label: 'flex w-full flex-col',
          }}
          value={id}
        >
          <span className="text-tiny text-foreground-500 dark:text-foreground-600">
            {id}
          </span>

          <span className="line-clamp-1 text-small">{JIKKYO_CHANNELS[id]}</span>
        </Checkbox>
      ))}
    </CheckboxGroup>
  )
}

export const Input: React.FC<Omit<Props, 'type'>> = (props) => {
  const [value, setValue] = useSettings(props.settingsKey)

  const [dtvChIds, setDtvChIds] = useState<JikkyoDtvChannelId[]>([])
  const [bsCsChIds, setBsCsChIds] = useState<JikkyoBsCsChannelId[]>([])

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    if (isOpen) {
      const dtvIds = value.filter((id) => id in JIKKYO_CHANNELS_DTV)
      const bsCsIds = value.filter((id) => id in JIKKYO_CHANNELS_BS_CS)

      setDtvChIds(dtvIds as JikkyoDtvChannelId[])
      setBsCsChIds(bsCsIds as JikkyoBsCsChannelId[])
    } else {
      setDtvChIds([])
      setBsCsChIds([])
    }
  }, [isOpen])

  return (
    <>
      <div className="py-2">
        <ItemButton
          key={props.settingsKey}
          title={props.label}
          description={props.description}
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
            const onPressReset = useCallback(() => {
              setDtvChIds(
                Object.keys(JIKKYO_CHANNELS_DTV) as JikkyoDtvChannelId[]
              )
              setBsCsChIds(
                Object.keys(JIKKYO_CHANNELS_BS_CS) as JikkyoBsCsChannelId[]
              )
            }, [])

            const onPressSave = useCallback(() => {
              setValue([...dtvChIds, ...bsCsChIds])

              onClose()
            }, [dtvChIds, bsCsChIds])

            return (
              <>
                <ModalHeader className="flex flex-row items-center gap-0.5">
                  <span>コメント</span>
                  <ChevronRightIcon className="size-5 opacity-50" />
                  <span>{props.label}</span>
                </ModalHeader>

                <ModalBody className="max-h-full gap-0 overflow-auto">
                  <Tabs
                    classNames={{
                      base: 'border-b-1 border-foreground-200',
                      tabList: 'p-0',
                      tab: 'h-10 p-0',
                      panel: 'h-full overflow-auto p-0',
                    }}
                    variant="underlined"
                    color="primary"
                    fullWidth
                    destroyInactiveTabPanel={false}
                  >
                    <Tab key="dtv" title="地デジ">
                      <ChSelector
                        type="dtv"
                        chIds={dtvChIds}
                        setChIds={setDtvChIds}
                      />
                    </Tab>

                    <Tab key="bs_cs" title="BS / CS">
                      <ChSelector
                        type="bs_cs"
                        chIds={bsCsChIds}
                        setChIds={setBsCsChIds}
                      />
                    </Tab>
                  </Tabs>
                </ModalBody>

                <ModalFooter className="justify-between">
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<RotateCcwIcon className="size-4" />}
                    onPress={onPressReset}
                  >
                    リセット
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
