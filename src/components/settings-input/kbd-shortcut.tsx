import type { KbdKey } from '@nextui-org/react'
import type { Runtime } from 'wxt/browser'
import type { SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState, useCallback } from 'react'
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

  const isKey = isNextUiKbdKey(key, os)

  return (
    <Kbd
      className={cn(
        'justify-center',
        'min-w-8 shrink-0 px-2 py-0.5',
        'bg-content1 text-content1-foreground/80',
        'border-1 border-content1-foreground/25',
        'shadow-none'
      )}
      keys={isKey ? key : undefined}
    >
      {!isKey && key[0].toUpperCase() + key.slice(1)}
    </Kbd>
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
    <div className="flex flex-col justify-between gap-2 py-2">
      <ItemLabel title={props.label} description={props.description} />

      <div className="flex flex-row items-center gap-1">
        <div
          className={cn(
            'h-8 w-full',
            'rounded-small',
            'border-1 border-divider',
            'data-[recording=true]:border-primary',
            'bg-default-100',
            'overflow-x-hidden',
            'transition-colors !duration-150'
          )}
          data-recording={isRecording}
        >
          <ScrollShadow
            className={cn(
              'flex flex-row items-center gap-0.5',
              'size-full px-0.5'
            )}
            orientation="horizontal"
            hideScrollBar
          >
            {!isRecording && !value && (
              <span className="select-none pl-1.5 text-small text-foreground-500">
                未設定
              </span>
            )}

            {(isRecording ? [...keys] : value.split('+'))
              .filter(Boolean)
              .map((key, idx) => (
                <div key={key} className="flex flex-row items-center gap-0.5">
                  {idx !== 0 && <PlusIcon className="size-3 shrink-0" />}
                  <KeyboardKey kbdKey={key} os={os} />
                </div>
              ))}
          </ScrollShadow>
        </div>

        <Tooltip content={isRecording ? '完了' : '編集'}>
          <Button
            className="shrink-0"
            size="sm"
            variant="light"
            radius="full"
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
