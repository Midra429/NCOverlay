import { useCallback, useState } from 'react'
import { Button } from '@nextui-org/react'
import { CameraIcon, CheckIcon, XIcon } from 'lucide-react'

import { capture } from '@/utils/extension/capture'

export const CaptureButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isFailed, setIsFailed] = useState(false)

  const onPress = useCallback(async () => {
    setIsLoading(true)

    const result = await capture()

    setIsLoading(false)

    if (!result) {
      setIsFailed(true)

      setTimeout(() => {
        setIsFailed(false)
      }, 2000)
    } else if (result === 'copy') {
      setIsCopied(true)

      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    }
  }, [])

  return (
    <Button
      fullWidth
      size="md"
      variant="flat"
      startContent={
        (isCopied && <CheckIcon className="size-4" />) ||
        (isFailed && <XIcon className="size-4" />) ||
        (!isLoading && <CameraIcon className="size-4" />)
      }
      isLoading={isLoading}
      isDisabled={isCopied || isFailed}
      onPress={onPress}
    >
      {(isCopied && 'コピーしました') ||
        (isFailed && '失敗しました') ||
        'キャプチャー'}
    </Button>
  )
}
