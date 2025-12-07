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

const ncoMessenger = defineExtensionMessaging<ProtocolMap>()

ncoMessenger.sendMessage = new Proxy(ncoMessenger.sendMessage, {
  async apply(
    target,
    thisArg,
    argArray: Parameters<typeof ncoMessenger.sendMessage>
  ) {
    if (typeof argArray[2] === 'undefined' && !webext.isContentScript) {
      const tab = await webext.getCurrentActiveTab()

      argArray[2] = tab?.id
    }

    try {
      return await Reflect.apply(target, thisArg, argArray)
    } catch {}
  },
})

export const {
  onMessage: onNcoMessage,
  sendMessage: sendNcoMessage,
  removeAllListeners: removeNcoListeners,
} = ncoMessenger
