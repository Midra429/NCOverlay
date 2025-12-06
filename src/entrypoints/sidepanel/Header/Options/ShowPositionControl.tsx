import { Switch } from '@heroui/react'

import { useSettings } from '@/hooks/useSettings'

import { ItemLabel } from '@/components/ItemLabel'

export function ShowPositionControl() {
  const [value, setValue] = useSettings(
    'settings:commentList:showPositionControl'
  )

  return (
    <Switch
      classNames={{
        base: [
          'flex flex-row-reverse justify-between gap-2',
          'w-full max-w-full py-2',
          'overflow-hidden',
        ],
        wrapper: 'm-0',
        label: 'm-0',
      }}
      size="sm"
      isSelected={value}
      onValueChange={setValue}
    >
      <ItemLabel title="オフセット調節を表示" />
    </Switch>
  )
}
