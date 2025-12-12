import type {
  ExtensionMessage,
  ExtensionMessenger,
  GetDataType,
  GetReturnType,
  MaybePromise,
  Message,
  RemoveListenerCallback,
} from '@webext-core/messaging'

import { webext } from '@/utils/webext'

export interface ReceivedCallback<
  ProtocolMap extends Record<string, any>,
  T extends keyof ProtocolMap,
> {
  (
    message: Message<ProtocolMap, T> & ExtensionMessage
  ): MaybePromise<GetReturnType<ProtocolMap[T]>>
}

export function patchSendMessage<
  To extends 'background' | 'content',
  ProtocolMap extends Record<string, any>,
>(to: To, sendMessage: ExtensionMessenger<ProtocolMap>['sendMessage']) {
  return async function <T extends keyof ProtocolMap>(
    type: T,
    data: GetDataType<ProtocolMap[T]>,
    tabId?:
      | (To extends 'background' ? undefined : never)
      | (To extends 'content' ? number : never)
  ): Promise<ReturnType<ProtocolMap[T]> | undefined> {
    if (to === 'content' && tabId == null) {
      tabId = (await webext.getCurrentActiveTabId()) as any
    }

    try {
      return sendMessage(type, data, tabId).catch(() => {}) as any
    } catch {}
  }
}

export function patchOnMessage<ProtocolMap extends Record<string, any>>(
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
