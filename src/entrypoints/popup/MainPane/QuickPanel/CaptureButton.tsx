import { useState } from 'react'
import { addToast } from '@heroui/react'
import { CameraIcon, CheckIcon, XIcon } from 'lucide-react'

import { capture } from '@/utils/extension/capture'

import { PanelButton } from '@/components/PanelButton'

export function CaptureButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isFailed, setIsFailed] = useState(false)

  async function onPress() {
    setIsLoading(true)

    const result = await capture()

    setIsLoading(false)

    if (!result) {
      setIsFailed(true)

      setTimeout(() => {
        setIsFailed(false)
      }, 2000)

      addToast({
        color: 'danger',
        title: 'キャプチャに失敗しました',
      })
    } else if (result === 'copy') {
      setIsCopied(true)

      setTimeout(() => {
        setIsCopied(false)
      }, 2000)

      addToast({
        color: 'success',
        title: 'キャプチャをコピーしました',
      })
    }
  }

  return (
    <PanelButton
      label="キャプチャ"
      startContent={
        (isCopied && <CheckIcon />) ||
        (isFailed && <XIcon />) ||
        (!isLoading && <CameraIcon />)
      }
      isLoading={isLoading}
      isDisabled={isCopied || isFailed}
      onPress={onPress}
    />
  )
}
