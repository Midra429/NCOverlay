import type { ExtensionMessagingConfig } from '@webext-core/messaging'

import { defineExtensionMessaging } from '@webext-core/messaging'

import { patchOnMessage, patchSendMessage } from '.'

export function defineToBackgroundMessaging<
  ProtocolMap extends Record<string, any>,
>(config?: ExtensionMessagingConfig) {
  const messenger = defineExtensionMessaging<ProtocolMap>(config)

  const sendMessage = patchSendMessage('background', messenger.sendMessage)
  const onMessage = patchOnMessage(messenger.onMessage)
  const removeAllListeners = messenger.removeAllListeners

  return {
    sendMessage,
    onMessage,
    removeAllListeners,
  }
}
