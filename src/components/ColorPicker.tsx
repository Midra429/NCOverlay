import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Divider,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from '@heroui/react'
import { RotateCcwIcon } from 'lucide-react'
import { colord } from 'colord'

import { NICONICO_COLORS } from '@/constants'

export const COLOR_PICKER_PRESETS = [
  ...new Set(['#FFFFFF', ...Object.values(NICONICO_COLORS)]),
]

const TRANSPARENT_BACKGROUND_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMiAyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBIMVYxSDBWMFoiIGZpbGw9IiNFMUUxRTEiLz48cGF0aCBkPSJNMSAxSDJWMkgxVjFaIiBmaWxsPSIjRTFFMUUxIi8+PC9zdmc+'

export interface ColorPickerProps {
  hex?: string | null
  defaultHex: string
  onChange: (hex: string) => void
  presets?: string[]
  alpha?: boolean
  isDisabled?: boolean
}

function ColorPickerPopover(props: ColorPickerProps) {
  const width = 200
  const height = 150

  const svAreaRef = useRef<HTMLDivElement>(null)
  const hueAreaRef = useRef<HTMLDivElement>(null)
  const alphaAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(0)
  const [value, setValue] = useState(100)
  const [alpha, setAlpha] = useState(1)

  const [readableColor, setReadableColor] = useState('rgb(0, 0, 0)')
  const [rgb, setRgb] = useState('rgb(255, 255, 255)')

  const [text, setText] = useState('')

  function onTextChange(val: string) {
    const text = val.startsWith('#') ? val.slice(1) : val

    setText(text.toUpperCase())

    const color = colord(`#${text}`)

    if (color.isValid()) {
      const hsv = color.toHsv()

      setHue(hsv.h)
      setSaturation(hsv.s)
      setValue(hsv.v)
      setAlpha(props.alpha ? hsv.a : 1)
    }
  }

  useEffect(() => {
    const hsv = colord(props.hex ?? props.defaultHex).toHsv()

    setHue(hsv.h)
    setSaturation(hsv.s)
    setValue(hsv.v)
    setAlpha(props.alpha ? hsv.a : 1)

    let isSV = false
    let isHue = false
    let isAlpha = false

    function onMouseDown(evt: MouseEvent) {
      if (evt.button !== 0) return

      isSV = evt.target === svAreaRef.current
      isHue = evt.target === hueAreaRef.current
      isAlpha = evt.target === alphaAreaRef.current

      onMouseMove(evt)
    }

    function onMouseMove(evt: MouseEvent) {
      if (evt.button !== 0) return

      if (isSV) {
        const rect = svAreaRef.current!.getBoundingClientRect()

        let saturation = ((evt.clientX - rect.left) / rect.width) * 100
        let value = ((rect.bottom - evt.clientY) / rect.height) * 100

        if (saturation < 0) {
          saturation = 0
        } else if (100 < saturation) {
          saturation = 100
        }

        if (value < 0) {
          value = 0
        } else if (100 < value) {
          value = 100
        }

        setSaturation(saturation)
        setValue(value)
      } else if (isHue) {
        const rect = hueAreaRef.current!.getBoundingClientRect()

        let hue = 360 * ((evt.clientX - rect.left) / rect.width)

        if (hue < 0) {
          hue = 0
        } else if (360 < hue) {
          hue = 360
        }

        setHue(hue)
      } else if (isAlpha) {
        const rect = alphaAreaRef.current!.getBoundingClientRect()

        let alpha = (evt.clientX - rect.left) / rect.width

        if (alpha < 0) {
          alpha = 0
        } else if (1 < alpha) {
          alpha = 1
        }

        setAlpha(alpha)
      }
    }

    function onMouseUp(evt: MouseEvent) {
      if (evt.button !== 0) return

      isSV = false
      isHue = false
      isAlpha = false
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  useEffect(() => {
    const color = colord({
      h: hue,
      s: saturation,
      v: value,
      a: alpha,
    })

    if (color.isLight()) {
      setReadableColor('rgb(0, 0, 0)')
    } else {
      setReadableColor('rgb(255, 255, 255)')
    }

    setRgb(color.alpha(1).toRgbString())

    const hex = color.toHex().toUpperCase()

    if (document.activeElement !== inputRef.current) {
      setText(hex.slice(1))
    }

    props.onChange(hex)
  }, [hue, saturation, value, alpha])

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex select-none flex-col gap-1">
        {/* Saturation, Value */}
        <div
          className={cn(
            'relative',
            'border-1 border-divider',
            'rounded-md',
            'overflow-hidden'
          )}
          style={{ width, height }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `hsl(${hue} 100% 50%)`,
            }}
          />
          <div
            className={cn('absolute inset-0', 'bg-linear-to-r from-white')}
          />
          <div
            className={cn('absolute inset-0', 'bg-linear-to-t from-black')}
          />

          <div
            className="absolute"
            style={{
              left: `${saturation}%`,
              bottom: `${value}%`,
            }}
          >
            <div
              className={cn(
                'size-2.75',
                '-translate-x-1/2 translate-y-1/2',
                'border-1',
                'rounded-full',
                'shadow-[0_0_2px_rgb(0,0,0,0.5)]'
              )}
              style={{
                borderColor: readableColor,
              }}
            />
          </div>

          <div className="absolute inset-0" ref={svAreaRef} />
        </div>

        {/* Hue */}
        <div
          className={cn(
            'relative',
            'border-1 border-divider',
            'rounded-md',
            'overflow-hidden'
          )}
          style={{ width, height: 15 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right,
                rgb(255, 0, 0),
                rgb(255, 255, 0),
                rgb(0, 255, 0),
                rgb(0, 255, 255),
                rgb(0, 0, 255),
                rgb(255, 0, 255),
                rgb(255, 0, 0)
              )`,
            }}
          />

          <div
            className="absolute top-px"
            style={{
              left: `${(hue / 360) * 100}%`,
            }}
          >
            <div
              className={cn(
                'size-2.75',
                '-translate-x-1/2',
                'bg-white',
                'rounded-full',
                'shadow-[0_0_2px_rgb(0,0,0,0.75)]'
              )}
            />
          </div>

          <div className="absolute inset-0" ref={hueAreaRef} />
        </div>

        {/* Alpha */}
        {props.alpha && (
          <div
            className={cn(
              'relative',
              'border-1 border-divider',
              'rounded-md',
              'overflow-hidden'
            )}
            style={{ width, height: 15 }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('${TRANSPARENT_BACKGROUND_IMAGE}')`,
                backgroundSize: 'auto 100%',
                backgroundColor: 'rgb(255, 255, 255)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, transparent, ${rgb})`,
              }}
            />

            <div
              className="absolute top-px"
              style={{
                left: `${alpha * 100}%`,
              }}
            >
              <div
                className={cn(
                  'size-2.75',
                  '-translate-x-1/2',
                  'bg-white',
                  'rounded-full',
                  'shadow-[0_0_2px_rgb(0,0,0,0.75)]'
                )}
              />
            </div>

            <div className="absolute inset-0" ref={alphaAreaRef} />
          </div>
        )}
      </div>

      {props.presets?.length && (
        <>
          <Divider />

          <div className="flex flex-row flex-wrap gap-1" style={{ width }}>
            {props.presets.map((preset, idx) => (
              <div
                key={idx}
                className={cn(
                  'aspect-square',
                  'border-1 border-divider',
                  'rounded-sm',
                  'cursor-pointer'
                )}
                style={{
                  width: (width - 4 * 9) / 10,
                  backgroundColor: preset,
                }}
                title={preset}
                onClick={() => onTextChange(preset)}
              />
            ))}
          </div>
        </>
      )}

      <Divider />

      <div className="flex w-full flex-row gap-1" style={{ width }}>
        <Input
          classNames={{
            label: 'ps-0 pe-1.5',
            mainWrapper: 'w-full',
            inputWrapper: [
              'h-6 min-h-6',
              'px-1.5',
              'border-1 border-divider',
              'rounded-md',
              'shadow-none',
              'text-small',
            ],
            input: 'ps-1! text-small',
          }}
          size="sm"
          label="HEX"
          labelPlacement="outside-left"
          placeholder="FFFFFF"
          startContent="#"
          value={text}
          onValueChange={onTextChange}
          ref={inputRef}
        />

        <Button
          className="size-6! min-w-6 rounded-md"
          size="sm"
          variant="light"
          isIconOnly
          onPress={() => onTextChange(props.defaultHex)}
        >
          <RotateCcwIcon className="size-3.5 text-foreground-700" />
        </Button>
      </div>
    </div>
  )
}

export function ColorPicker(props: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover
      classNames={{
        backdrop: 'bg-transparent',
        trigger: 'scale-100! opacity-100!',
        content: 'border-1 border-foreground-100 p-0',
      }}
      radius="sm"
      placement="left"
      backdrop="opaque"
      isTriggerDisabled={props.isDisabled}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger>
        <div
          className={cn(
            'relative h-8 w-20',
            'border-1 border-foreground-200 hover:border-default-400',
            'rounded-small',
            'overflow-hidden',
            'transition-[border-color] duration-150!',
            'cursor-pointer'
          )}
        >
          {props.alpha && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('${TRANSPARENT_BACKGROUND_IMAGE}')`,
                backgroundSize: 'auto 50%',
                backgroundColor: 'rgb(255, 255, 255)',
              }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: props.hex ?? props.defaultHex,
            }}
            title={props.hex ?? props.defaultHex}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent>
        <ColorPickerPopover {...props} />
      </PopoverContent>
    </Popover>
  )
}
