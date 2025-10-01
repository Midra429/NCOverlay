import type { GetDataType, GetReturnType } from '@webext-core/messaging'
import type { StorageItems } from '@/types/storage'
import type { NCOverlay } from '.'

import { defineExtensionMessaging } from '@webext-core/messaging'

import { webext } from '@/utils/webext'

// popup, background -> content

type ProtocolMap = {
  getId: (args?: null) => string | null

  getCurrentTime: (args?: null) => number

  reload: (args?: null) => void

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

export async function sendNcoMessage<TType extends keyof ProtocolMap>(
  type: TType,
  data: GetDataType<ProtocolMap[TType]>,
  tabId?: number
): Promise<GetReturnType<ProtocolMap[TType]> | undefined> {
  if (typeof tabId === 'undefined') {
    const tab = await webext.getCurrentActiveTab()

    tabId = tab?.id
  }

  try {
    return await ncoMessenger.sendMessage(type, data, tabId)
  } catch {}
}
