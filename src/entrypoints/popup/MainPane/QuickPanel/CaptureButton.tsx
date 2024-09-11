import { useState, useCallback } from 'react'
import { CameraIcon, CheckIcon, XIcon } from 'lucide-react'

import { capture } from '@/utils/extension/capture'

import { PanelButton } from '@/components/panel-button'

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
    <PanelButton
      compact
      isLoading={isLoading}
      isDisabled={isCopied || isFailed}
      startContent={
        (isCopied && <CheckIcon className="size-4" />) ||
        (isFailed && <XIcon className="size-4" />) ||
        (!isLoading && <CameraIcon className="size-4" />)
      }
      onPress={onPress}
    >
      キャプチャー
    </PanelButton>
  )
}
