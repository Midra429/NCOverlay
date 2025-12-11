import { useEffect, useState } from 'react'
import { Switch } from '@heroui/react'

import { useSettings } from '@/hooks/useSettings'
import { useStorage } from '@/hooks/useStorage'

import { PanelItem } from '@/components/PanelItem'

/**
 * 表示 / 非表示
 */
export function ShowHideToggle() {
  const [show, setShow] = useState(true)

  const [tmpOpacity, setTmpOpacity] = useStorage('tmp:comment:opacity')
  const [opacity, setOpacity] = useSettings('settings:comment:opacity')

  useEffect(() => {
    setShow(!!opacity)
  }, [opacity])

  return (
    <PanelItem>
      <Switch
        classNames={{
          base: [
            'flex flex-row-reverse justify-between gap-2',
            'w-full max-w-full p-2.5',
            'overflow-hidden',
          ],
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
