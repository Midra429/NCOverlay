import type {
  ExtensionMessage,
  ExtensionMessagingConfig,
  ExtensionMessenger,
  GetDataType,
  GetReturnType,
  MaybePromise,
  Message,
  RemoveListenerCallback,
} from '@webext-core/messaging'

import { defineExtensionMessaging } from '@webext-core/messaging'

import { webext } from '@/utils/webext'

interface ReceivedCallback<
  ProtocolMap extends Record<string, any>,
  T extends keyof ProtocolMap,
> {
  (
    message: Message<ProtocolMap, T> & ExtensionMessage
  ): MaybePromise<GetReturnType<ProtocolMap[T]>>
}

function patchSendMessage<ProtocolMap extends Record<string, any>>(
  sendMessage: ExtensionMessenger<ProtocolMap>['sendMessage']
) {
  return async function <T extends keyof ProtocolMap>(
    type: T,
    data: GetDataType<ProtocolMap[T]>,
    tabId?: T extends `content:${string}` ? number : never
  ): Promise<ReturnType<ProtocolMap[T]> | undefined> {
    if (type.toString().startsWith('content:') && tabId == null) {
      tabId = (await webext.getCurrentActiveTabId()) as any
    }

    try {
      return sendMessage(type, data, tabId).catch(() => {}) as any
    } catch {}
  }
}

function patchOnMessage<ProtocolMap extends Record<string, any>>(
  onMessage: ExtensionMessenger<ProtocolMap>['onMessage']
) {
  return function <T extends keyof ProtocolMap>(
    type: T,
    onReceived: ReceivedCallback<ProtocolMap, T>
  ): RemoveListenerCallback {
    try {
      return onMessage(type, onReceived)
    } catch {
      return () => {}
    }
  }
}

export function defineMessaging<ProtocolMap extends Record<string, any>>(
  config?: ExtensionMessagingConfig
) {
  const messenger = defineExtensionMessaging<ProtocolMap>(config)

  const sendMessage = patchSendMessage(messenger.sendMessage)
  const onMessage = patchOnMessage(messenger.onMessage)
  const removeAllListeners = messenger.removeAllListeners

  return {
    sendMessage,
    onMessage,
    removeAllListeners,
  }
}
