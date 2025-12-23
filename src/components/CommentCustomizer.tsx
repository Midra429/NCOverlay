import { useEffect, useState } from 'react'
import { Slider } from '@heroui/react'

import { COLOR_PICKER_PRESETS, ColorPicker } from '@/components/ColorPicker'
import { ItemLabel } from '@/components/ItemLabel'

export interface CommentCustomizerProps {
  color: string | undefined
  opacity: number | undefined
  onColorChange: (color: string) => void
  onOpacityChange: (opacity: number) => void
}

export function CommentCustomizer({
  color,
  opacity,
  onColorChange,
  onOpacityChange,
}: CommentCustomizerProps) {
  const [tmpOpacity, setTmpOpacity] = useState<number | number[]>(100)

  useEffect(() => {
    setTmpOpacity(opacity ?? 100)
  }, [opacity])

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-row items-center justify-between">
        <ItemLabel title="色" />

        <ColorPicker
          hex={color}
          defaultHex="#FFFFFF"
          presets={COLOR_PICKER_PRESETS}
          onChange={onColorChange}
        />
      </div>

      <div className="flex flex-row items-center justify-between">
        <Slider
          classNames={{
            base: 'overflow-hidden py-2',
          }}
          size="md"
          label="不透明度"
          minValue={0}
          maxValue={100}
          step={5}
          value={tmpOpacity}
          getValue={(val) => `${val}%`}
          onChange={setTmpOpacity}
          onChangeEnd={(val) => {
            onOpacityChange(Array.isArray(val) ? val[0] : val)
          }}
        />
      </div>
    </div>
  )
}
