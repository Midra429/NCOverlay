import type { ExtensionMessagingConfig } from '@webext-core/messaging'

import { defineExtensionMessaging } from '@webext-core/messaging'

import { patchOnMessage, patchSendMessage } from '.'

export function defineToContentMessaging<
  ProtocolMap extends Record<string, any>,
>(config?: ExtensionMessagingConfig) {
  const messenger = defineExtensionMessaging<ProtocolMap>(config)

  const sendMessage = patchSendMessage('content', messenger.sendMessage)
  const onMessage = patchOnMessage(messenger.onMessage)
  const removeAllListeners = messenger.removeAllListeners

  return {
    sendMessage,
    onMessage,
    removeAllListeners,
  }
}
