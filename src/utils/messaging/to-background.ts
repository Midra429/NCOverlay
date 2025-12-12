import type {
  ExtensionMessagingConfig,
  GetDataType,
  RemoveListenerCallback,
} from '@webext-core/messaging'
import type { ReceivedCallback } from '.'

import { defineExtensionMessaging } from '@webext-core/messaging'

export function defineToBackgroundMessaging<
  ProtocolMap extends Record<string, any>,
>(config?: ExtensionMessagingConfig) {
  const messenger = defineExtensionMessaging<ProtocolMap>(config)

  async function sendMessage<T extends keyof ProtocolMap>(
    type: T,
    data: GetDataType<ProtocolMap[T]>
  ): Promise<ReturnType<ProtocolMap[T]> | undefined> {
    try {
      return messenger.sendMessage(type, data).catch(() => {}) as any
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
