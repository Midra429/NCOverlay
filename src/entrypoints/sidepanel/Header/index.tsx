import { useState } from 'react'
import { Button, cn } from '@heroui/react'
import { Settings2Icon, XIcon } from 'lucide-react'

import { Options } from './Options'

export function Header() {
  const [isOptionOpen, setIsOptionOpen] = useState(false)

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

      <Options isOpen={isOptionOpen} />
    </div>
  )
}
