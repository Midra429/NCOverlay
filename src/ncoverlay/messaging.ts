import type { StorageItems } from '@/types/storage'
import type { NCOverlay } from '.'

import { defineExtensionMessaging } from '@webext-core/messaging'

import { webext } from '@/utils/webext'

// popup, background -> content

type ProtocolMap = {
  getId: (args?: null) => string | null

  jumpMarker: (
    args: Parameters<NCOverlay['jumpMarker']>[0]
  ) => ReturnType<NCOverlay['jumpMarker']>

  capture: (format: StorageItems['settings:capture:format']) => {
    format: 'jpeg' | 'png'
    data?: number[]
  }

  timeupdate: (args: { id: string; time: number }) => void
}

export const ncoMessenger = defineExtensionMessaging<ProtocolMap>()

export const sendNcoMessage: typeof ncoMessenger.sendMessage = async (
  ...args
) => {
  let tabId: number | undefined

  if (typeof args[2] === 'number') {
    tabId = args[2]
  } else {
    const tab = await webext.getCurrentActiveTab()

    tabId = tab?.id
  }

  return ncoMessenger.sendMessage(args[0], args[1], tabId)
}
