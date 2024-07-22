import { useCallback, useState } from 'react'
import { Button } from '@nextui-org/react'
import { CameraIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { sendNcoMessage } from '@/ncoverlay/messaging'

export const CaptureButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)

  const onPress = useCallback(async () => {
    setIsLoading(true)

    try {
      const result = await sendNcoMessage('capture', null)

      if (result) {
        const { data, format } = result

        const blob = new Blob([new Uint8Array(data)], {
          type: `image/${format}`,
        })
        const url = URL.createObjectURL(blob)

        await webext.windows.create({
          type: 'popup',
          width: 1280,
          height: 960,
          url,
        })
      }
    } catch {}

    setIsLoading(false)
  }, [])

  return (
    <Button
      fullWidth
      size="md"
      variant="flat"
      startContent={!isLoading && <CameraIcon className="size-4" />}
      isLoading={isLoading}
      onPress={onPress}
    >
      キャプチャー
    </Button>
  )
}
