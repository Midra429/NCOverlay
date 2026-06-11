import { Button, cn } from '@heroui/react'
import { FilePlayIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { sendExtensionMessage } from '@/messaging/extension'

export function Header() {
  async function onPress() {
    await sendExtensionMessage('content:selectVideoFile', null)

    window.close()
  }

  return (
    <>
      <div
        className={cn(
          'flex flex-row items-center justify-between',
          'p-2',
          'border-foreground-200 border-b-1',
          'bg-content1',
          'font-semibold text-medium'
        )}
      >
        <div className="flex flex-row items-center">
          <span>再生中の動画</span>
        </div>

        <Button
          style={{
            visibility: webext.isFirefox ? 'hidden' : undefined,
          }}
          size="sm"
          variant="flat"
          color="primary"
          startContent={<FilePlayIcon className="size-4" />}
          onPress={onPress}
        >
          選択
        </Button>
      </div>
    </>
  )
}
