import type {
  JikkyoDtvChannelId,
  JikkyoBsCsChannelId,
  JikkyoChannelId,
} from '@midra/nco-utils/types/api/constants'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import {
  Button,
  Tabs,
  Tab,
  CheckboxGroup,
  Checkbox,
  useDisclosure,
} from '@heroui/react'
import {
  PencilIcon,
  ChevronRightIcon,
  RotateCcwIcon,
  SaveIcon,
} from 'lucide-react'
import { JIKKYO_CHANNELS } from '@midra/nco-utils/api/constants'

import { JIKKYO_CHANNEL_GROUPS } from '@/constants/channels'

import { useSettings } from '@/hooks/useSettings'

import { ItemButton } from '@/components/ItemButton'
import { Modal } from '@/components/Modal'
import { Tooltip } from '@/components/Tooltip'

export type Key = 'settings:comment:jikkyoChannelIds'

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'ch-selector'> {
  options: {
    label: string
    value: JikkyoChannelId
  }[]
}

interface ChSelectorProps {
  type: keyof typeof JIKKYO_CHANNEL_GROUPS
  chIds: JikkyoDtvChannelId[] | JikkyoBsCsChannelId[]
  setChIds:
    | ((ids: JikkyoDtvChannelId[]) => void)
    | ((ids: JikkyoBsCsChannelId[]) => void)
}

function ChSelector({ type, chIds, setChIds }: ChSelectorProps) {
  const CHANNEL = JIKKYO_CHANNEL_GROUPS[type]

  return (
    <CheckboxGroup
      classNames={{
        label: 'hidden text-foreground text-small',
        wrapper: 'gap-1.5 p-1.5',
      }}
      size="sm"
      orientation="horizontal"
      label={CHANNEL.TITLE}
      value={chIds}
      onChange={setChIds as any}
    >
      {CHANNEL.IDS.map((id) => (
        <Checkbox
          key={id}
          classNames={{
            base: [
              'w-[calc(50%-0.375rem/2)] max-w-none',
              'm-0 px-1.5 py-1',
              'bg-default-100 hover:bg-default-200',
              'data-[selected=true]:bg-primary/15 dark:data-[selected=true]:bg-primary/20',
              'rounded-medium',
              'border-1 border-divider hover:border-default-400',
              'data-[selected=true]:border-primary',
              'transition-colors motion-reduce:transition-none',
              'cursor-pointer',
            ],
            wrapper: [
              'rounded-full',
              'before:rounded-full before:border-1 before:bg-default-50!',
              'after:rounded-full',
            ],
            label: 'flex w-full flex-col',
          }}
          value={id}
        >
          <span className="text-foreground-500 text-tiny dark:text-foreground-600">
            {id}
          </span>

          <span className="line-clamp-1 text-small">{JIKKYO_CHANNELS[id]}</span>
        </Checkbox>
      ))}
    </CheckboxGroup>
  )
}

export function Input(props: Props) {
  const [value, setValue] = useSettings(props.settingsKey)

  const [dtvChIds, setDtvChIds] = useState<JikkyoDtvChannelId[]>([])
  const [stvChIds, setStvChIds] = useState<JikkyoBsCsChannelId[]>([])

  function onReset() {
    setDtvChIds(JIKKYO_CHANNEL_GROUPS.DTV.IDS)
    setStvChIds(JIKKYO_CHANNEL_GROUPS.STV.IDS)
  }

  function onSave() {
    setValue([...dtvChIds, ...stvChIds])
  }

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    if (isOpen) {
      const dtvIds = value.filter((id) => {
        return JIKKYO_CHANNEL_GROUPS.DTV.IDS.includes(id as JikkyoDtvChannelId)
      })
      const stvIds = value.filter((id) => {
        return JIKKYO_CHANNEL_GROUPS.STV.IDS.includes(id as JikkyoBsCsChannelId)
      })

      setDtvChIds(dtvIds as JikkyoDtvChannelId[])
      setStvChIds(stvIds as JikkyoBsCsChannelId[])
    } else {
      setDtvChIds([])
      setStvChIds([])
    }
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
            <span>自動検索</span>
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
        <Tabs
          classNames={{
            base: 'border-foreground-200 border-b-1 bg-content1',
            tabList: 'p-0',
            tab: 'h-10 p-0',
            panel: 'overflow-y-auto overflow-x-hidden bg-content1 p-0',
          }}
          variant="underlined"
          color="primary"
          fullWidth
          destroyInactiveTabPanel={false}
        >
          <Tab key="DTV" title="地デジ">
            <ChSelector type="DTV" chIds={dtvChIds} setChIds={setDtvChIds} />
          </Tab>

          <Tab key="STV" title="BS / CS">
            <ChSelector type="STV" chIds={stvChIds} setChIds={setStvChIds} />
          </Tab>
        </Tabs>
      </Modal>
    </>
  )
}
