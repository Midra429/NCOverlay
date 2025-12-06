import type { KbdKey } from '@heroui/react'
import type { SettingsKey } from '@/types/storage'
import type { Browser } from '@/utils/webext'
import type { SettingsInputBaseProps } from '.'

import { Fragment, useEffect, useState } from 'react'
import { Button, Kbd, ScrollShadow, cn } from '@heroui/react'
import { CheckIcon, PencilIcon, PlusIcon } from 'lucide-react'
import { useRecordHotkeys } from 'react-hotkeys-hook'

import { webext } from '@/utils/webext'
import { useSettings } from '@/hooks/useSettings'

import { ItemLabel } from '@/components/ItemLabel'
import { Tooltip } from '@/components/Tooltip'

const HEROUI_KBD_KEYS: Partial<
  Record<'common' | Browser.runtime.PlatformInfo['os'], string[]>
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
  Record<'common' | Browser.runtime.PlatformInfo['os'], Record<string, string>>
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

function isHeroUiKbdKey(
  key: string,
  os?: Browser.runtime.PlatformInfo['os']
): key is KbdKey {
  return !!(
    HEROUI_KBD_KEYS['common']?.includes(key) ||
    (os && HEROUI_KBD_KEYS[os]?.includes(key))
  )
}

interface KeyboardKeyProps {
  kbdKey: string
  os?: Browser.runtime.PlatformInfo['os']
}

function KeyboardKey({ kbdKey, os }: KeyboardKeyProps) {
  if (!kbdKey) return

  const key =
    OS_KEYS['common']?.[kbdKey] || (os && OS_KEYS[os]?.[kbdKey]) || kbdKey

  const isKey = isHeroUiKbdKey(key, os)

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

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'kbd-shortcut'> {}

export function Input(props: Props) {
  const [os, setOs] = useState<Browser.runtime.PlatformInfo['os']>()
  const [value, setValue] = useSettings(props.settingsKey)
  const [keys, { start, stop, isRecording }] = useRecordHotkeys()

  function onClick(evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (isRecording) {
      stop()
      setValue([...keys].join('+'))
    } else {
      start()
      setValue('')
      evt.currentTarget.blur()
    }
  }

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
            'data-[recording=true]:bg-primary/15 dark:data-[recording=true]:bg-primary/20',
            'overflow-x-hidden',
            'transition-colors duration-150!'
          )}
          data-recording={isRecording}
        >
          <ScrollShadow
            className="size-full"
            orientation="horizontal"
            hideScrollBar
          >
            <div
              className={cn(
                'flex flex-row items-center gap-0.5',
                'h-full w-max px-0.5'
              )}
            >
              {isRecording || value ? (
                (isRecording ? [...keys] : value.split('+'))
                  .filter(Boolean)
                  .map((key, idx) => (
                    <Fragment key={idx}>
                      {idx !== 0 && <PlusIcon className="size-3 shrink-0" />}
                      <KeyboardKey kbdKey={key} os={os} />
                    </Fragment>
                  ))
              ) : (
                <span className="select-none pl-1 text-foreground-500 text-small">
                  未設定
                </span>
              )}
            </div>
          </ScrollShadow>
        </div>

        <Tooltip content={isRecording ? '完了' : '編集'}>
          <Button
            className="shrink-0"
            size="sm"
            variant="light"
            radius="full"
            isIconOnly
            // @ts-ignore
            onClick={onClick}
          >
            {isRecording ? (
              <CheckIcon className="size-4" />
            ) : (
              <PencilIcon className="size-4" />
            )}
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
