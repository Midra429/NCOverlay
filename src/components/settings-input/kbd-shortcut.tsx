import type { KbdKey } from '@nextui-org/react'
import type { Runtime } from 'wxt/browser'
import type { SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useCallback, useEffect, useState } from 'react'
import { ScrollShadow, Button, Kbd, cn } from '@nextui-org/react'
import { PencilIcon, CheckIcon, PlusIcon } from 'lucide-react'
import { useRecordHotkeys } from 'react-hotkeys-hook'

import { webext } from '@/utils/webext'
import { useSettings } from '@/hooks/useSettings'

import { ItemLabel } from '@/components/label'
import { Tooltip } from '@/components/tooltip'

const NEXTUI_KBD_KEYS: Partial<
  Record<'common' | Runtime.PlatformOs, string[]>
> = {
  common: [
    'shift',
    'enter',
    // 'delete',
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
  ] satisfies KbdKey[],
  win: [] satisfies KbdKey[],
  mac: ['command', 'ctrl', 'option'] satisfies KbdKey[],
}

const OS_KEYS: Partial<
  Record<'common' | Runtime.PlatformOs, Record<string, string>>
> = {
  common: {
    backquote: '`',
    backslash: '\\',
    bracketleft: '[',
    bracketright: ']',
    comma: ',',
    equal: '=',
    intlbackslash: '\\',
    intlro: 'ろ',
    intlyen: '¥',
    minus: '-',
    period: '.',
    quote: "'",
    semicolon: ';',
    slash: '/',

    convert: '変換',
    nonconvert: '無変換',

    delete: '⌦',
    backspace: '⌫',
  },
  win: {
    meta: 'win',
  },
  mac: {
    lang1: 'かな',
    lang2: '英数',

    meta: 'command',
    alt: 'option',
  },
}

const isNextUiKbdKey = (
  key: string,
  os?: Runtime.PlatformOs
): key is KbdKey => {
  return !!(
    NEXTUI_KBD_KEYS['common']?.includes(key) ||
    (os && NEXTUI_KBD_KEYS[os]?.includes(key))
  )
}

const KeyboardKey: React.FC<{ kbdKey: string; os?: Runtime.PlatformOs }> = ({
  kbdKey,
  os,
}) => {
  if (!kbdKey) return

  const key =
    OS_KEYS['common']?.[kbdKey] || (os && OS_KEYS[os]?.[kbdKey]) || kbdKey

  return isNextUiKbdKey(key, os) ? (
    <Kbd className="shrink-0" keys={key} />
  ) : (
    <Kbd className="shrink-0">{key[0].toUpperCase() + key.slice(1)}</Kbd>
  )
}

export type Key = Extract<SettingsKey, `settings:kbd:${string}`>

export type Props<K extends Key = Key> = SettingsInputBaseProps<
  K,
  'kbd-shortcut'
> & {}

export const Input: React.FC<Omit<Props, 'type'>> = (props) => {
  const [os, setOs] = useState<Runtime.PlatformOs>()
  const [value, setValue] = useSettings(props.settingsKey)
  const [keys, { start, stop, isRecording }] = useRecordHotkeys()

  const onClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    isRecording
      ? () => {
          stop()
          setValue([...keys].join('+'))
        }
      : (evt) => {
          start()
          setValue('')
          evt.currentTarget.blur()
        },
    [isRecording, keys]
  )

  useEffect(() => {
    webext.runtime.getPlatformInfo().then((v) => setOs(v.os))
  }, [])

  return (
    <div className="flex flex-col justify-between gap-1.5 py-2.5">
      <ItemLabel title={props.label} description={props.description} />

      <div className="flex flex-row items-center gap-2">
        <ScrollShadow
          className={cn(
            'flex flex-row items-center gap-1',
            'h-10 w-full p-1.5',
            'rounded-medium',
            'border-1 border-foreground-200',
            isRecording && 'border-primary bg-primary/15'
          )}
          orientation="horizontal"
          hideScrollBar
        >
          {(isRecording ? [...keys] : value.split('+')).map((key, idx) => (
            <div key={key} className="flex flex-row items-center gap-1">
              {idx !== 0 && <PlusIcon className="size-3.5 shrink-0" />}
              <KeyboardKey kbdKey={key} os={os} />
            </div>
          ))}
        </ScrollShadow>

        <Tooltip content={isRecording ? '保存' : '編集'}>
          <Button
            className="shrink-0"
            size="sm"
            radius="full"
            variant="light"
            isIconOnly
            startContent={
              isRecording ? (
                <CheckIcon className="size-4" />
              ) : (
                <PencilIcon className="size-4" />
              )
            }
            onClick={onClick}
          />
        </Tooltip>
      </div>
    </div>
  )
}
