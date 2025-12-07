import { useState } from 'react'
import { Button, cn } from '@heroui/react'
import { Settings2Icon, SquareArrowOutUpRight, XIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { sendUtilsMessage } from '@/utils/extension/messaging'

import { Options } from './Options'

export function Header() {
  const [isOptionOpen, setIsOptionOpen] = useState(false)

  function openPopupWindow() {
    sendUtilsMessage('openPopupWindow', {
      type: 'sidePanel',
      createData: {
        width: 360,
        height: 720,
      },
    })

    webext.sidePanel.close()
  }

  return (
    <div className="w-full border-foreground-200 border-b-1 bg-content1">
      <div
        className={cn(
          'flex flex-row items-center justify-between',
          'p-2',
          'font-semibold text-medium'
        )}
      >
        <div className="flex flex-row items-center">
          <span>コメントリスト</span>
        </div>

        <div className="flex shrink-0 flex-row gap-1">
          {!webext.isPopupWindow && (
            <Button
              className="shrink-0 p-0"
              size="sm"
              variant="light"
              isIconOnly
              disableRipple
              startContent={<SquareArrowOutUpRight className="size-4" />}
              onPress={openPopupWindow}
            />
          )}

          <Button
            className="shrink-0 p-0"
            size="sm"
            variant="light"
            isIconOnly
            disableRipple
            startContent={
              isOptionOpen ? (
                <XIcon className="size-4" />
              ) : (
                <Settings2Icon className="size-4" />
              )
            }
            onPress={() => setIsOptionOpen((v) => !v)}
          />
        </div>
      </div>

      <Options isOpen={isOptionOpen} />
    </div>
  )
}
