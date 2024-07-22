import type { NCOverlay } from '.'

import { defineExtensionMessaging } from '@webext-core/messaging'

import { webext } from '@/utils/webext'

// popup, background -> content

type ProtocolMap = {
  getId: (args?: null) => string | null

  updateRendererThreads: (args?: null) => void

  updateSlot: (
    args: Parameters<NCOverlay['updateSlot']>[0]
  ) => ReturnType<NCOverlay['updateSlot']>

  setGlobalOffset: (
    args: Parameters<NCOverlay['setGlobalOffset']>[0]
  ) => ReturnType<NCOverlay['setGlobalOffset']>

  jumpMarker: (
    args: Parameters<NCOverlay['jumpMarker']>[0]
  ) => ReturnType<NCOverlay['jumpMarker']>

  capture: (args?: null) => {
    data: number[]
    format: 'jpeg' | 'png'
  } | null
}

export const ncoMessenger = defineExtensionMessaging<ProtocolMap>()

export const sendNcoMessage: typeof ncoMessenger.sendMessage = async (
  ...args
) => {
  const tab = await webext.getCurrentActiveTab()

  return ncoMessenger.sendMessage(args[0], args[1], tab?.id)
}
