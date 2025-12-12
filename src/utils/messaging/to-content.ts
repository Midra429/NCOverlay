import type {
  ExtensionMessagingConfig,
  GetDataType,
  RemoveListenerCallback,
} from '@webext-core/messaging'
import type { ReceivedCallback } from '.'

import { defineExtensionMessaging } from '@webext-core/messaging'

import { webext } from '@/utils/webext'

export function defineToContentMessaging<
  ProtocolMap extends Record<string, any>,
>(config?: ExtensionMessagingConfig) {
  const messenger = defineExtensionMessaging<ProtocolMap>(config)

  async function sendMessage<T extends keyof ProtocolMap>(
    type: T,
    data: GetDataType<ProtocolMap[T]>,
    tabId?: number
  ): Promise<ReturnType<ProtocolMap[T]> | undefined> {
    if (tabId == null) {
      tabId = await webext.getCurrentActiveTabId()
    }

    try {
      return messenger.sendMessage(type, data, tabId).catch(() => {}) as any
    } catch {}
  }

  function onMessage<T extends keyof ProtocolMap>(
    type: T,
    onReceived: ReceivedCallback<ProtocolMap, T>
  ): RemoveListenerCallback {
    try {
      return messenger.onMessage(type, onReceived)
    } catch {
      return () => {}
    }
  }

  const removeAllListeners = messenger.removeAllListeners

  return {
    sendMessage,
    onMessage,
    removeAllListeners,
  }
}
