import type { GetDataType, GetReturnType } from '@webext-core/messaging'
import type { StorageItems } from '@/types/storage'
import type { NCOverlay } from '.'

import { defineExtensionMessaging } from '@webext-core/messaging'

import { webext } from '@/utils/webext'

// popup, background -> content

interface ProtocolMap {
  getId: (args?: null) => number | null

  getCurrentTime: (args?: null) => number

  reload: (args?: null) => void

  jumpMarker: (
    args: Parameters<NCOverlay['jumpMarker']>[0]
  ) => ReturnType<NCOverlay['jumpMarker']>

  capture: (format: StorageItems['settings:capture:format']) => {
    format: 'jpeg' | 'png'
    data?: number[]
  }

  timeupdate: (args: { id: number; time: number }) => void
}

export const ncoMessenger = defineExtensionMessaging<ProtocolMap>()

export async function sendNcoMessage<T extends keyof ProtocolMap>(
  type: T,
  data: GetDataType<ProtocolMap[T]>,
  tabId?: number
): Promise<GetReturnType<ProtocolMap[T]> | undefined> {
  if (typeof tabId === 'undefined' && !webext.isContentScript) {
    const tab = await webext.getCurrentActiveTab()

    tabId = tab?.id
  }

  try {
    return await ncoMessenger.sendMessage(type, data, tabId)
  } catch {}
}
