import { useEffect, useState } from 'react'
import { Switch, cn } from '@nextui-org/react'

import { useStorage } from '@/hooks/useStorage'
import { useSettings } from '@/hooks/useSettings'

import { PanelItem } from '@/components/panel-item'

/**
 * 表示 / 非表示
 */
export const ShowHideToggle: React.FC = () => {
  const [show, setShow] = useState(true)
  const { value: tmpOpacity, setValue: setTmpOpacity } = useStorage(
    'tmp:comment:opacity'
  )
  const { value: opacity, setValue: setOpacity } = useSettings(
    'settings:comment:opacity'
  )

  useEffect(() => {
    setShow(!!opacity)
  }, [opacity])

  return (
    <PanelItem>
      <Switch
        classNames={{
          base: cn(
            'flex flex-row-reverse justify-between gap-2',
            'w-full max-w-full p-2.5',
            'overflow-hidden'
          ),
          wrapper: 'm-0',
        }}
        size="sm"
        isSelected={show}
        onValueChange={(isSelected) => {
          setShow(isSelected)

          if (isSelected) {
            setOpacity(tmpOpacity || 100)
          } else {
            setTmpOpacity(opacity)
            setOpacity(0)
          }
        }}
      >
        <span>表示 / 非表示</span>
      </Switch>
    </PanelItem>
  )
}
