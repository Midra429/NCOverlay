import type { KbdKey } from '@nextui-org/react'
import type { SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { Button, Kbd, cn } from '@nextui-org/react'
import { CheckIcon, PenIcon } from 'lucide-react'
import { useRecordHotkeys } from 'react-hotkeys-hook'

import { webext } from '@/utils/webext'
import { useSettings } from '@/hooks/useSettings'

const NEXTUI_KBD_KEYS = [
  'command',
  'shift',
  'ctrl',
  'option',
  'enter',
  'delete',
  'escape',
  'tab',
  'capslock',
  'up',
  'right',
  'down',
  'left',
  'pageup',
  'pagedown',
  'home',
  'end',
  'help',
  'space',
]

const OS_KEYS: Record<string, Record<string, string>> = {
  win: {
    meta: 'Win',
  },
  mac: {
    meta: 'command',
    alt: 'option',
  },
}

const convertKbdKey = (key: string, os?: string) => {
  if (NEXTUI_KBD_KEYS.includes(key)) {
    return key
  }

  return (os && OS_KEYS[os]?.[key]) || key
}

export type Key = Extract<SettingsKey, `settings:kbd:${string}`>

export type Props<K extends Key = Key> = SettingsInputBaseProps<
  K,
  'kbd-shortcut'
> & {}

export const Input: React.FC<Omit<Props, 'type'>> = (props) => {
  const [os, setOs] = useState<string>()
  const { value, setValue } = useSettings(props.settingsKey)
  const [keys, { start, stop, isRecording }] = useRecordHotkeys()

  useEffect(() => {
    webext.runtime.getPlatformInfo().then((v) => setOs(v.os))
  }, [])

  return (
    <div className="flex flex-col justify-between gap-1.5 py-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-small text-foreground">{props.label}</span>
        {props.description && (
          <span className="line-clamp-2 text-tiny text-foreground-400">
            {props.description}
          </span>
        )}
      </div>

      <div className="flex flex-row items-center gap-1">
        <div
          className={cn(
            'flex h-10 w-full flex-row gap-1.5 p-1.5',
            'rounded-medium border-1 border-foreground-200',
            isRecording && 'border-primary bg-primary/15'
          )}
        >
          {(isRecording ? [...keys] : value.split('+')).map((val) => {
            if (!val) return

            const key = convertKbdKey(val, os)

            if (NEXTUI_KBD_KEYS.includes(key)) {
              return <Kbd key={key} keys={key as KbdKey} />
            } else {
              return (
                <Kbd
                  key={key}
                  classNames={{
                    base: 'text-tiny',
                  }}
                >
                  {key[0].toUpperCase() + key.slice(1)}
                </Kbd>
              )
            }
          })}
        </div>

        {isRecording ? (
          <Button
            size="sm"
            radius="full"
            variant="light"
            isIconOnly
            onClick={() => {
              stop()
              setValue([...keys].join('+'))
            }}
          >
            <CheckIcon className="size-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            radius="full"
            variant="light"
            isIconOnly
            onClick={(evt) => {
              start()
              setValue('')

              evt.currentTarget.blur()
            }}
          >
            <PenIcon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
