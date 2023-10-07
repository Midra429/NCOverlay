import type {
  ChromeMessage,
  ChromeMessageBody,
  ChromeResponse,
} from '@/types/chrome/message'

const queue: ChromeMessage<'chrome:sendToPopup'>[] = []
let running: Promise<ChromeResponse> | null = null

const run = (message?: ChromeMessage<'chrome:sendToPopup'>) => {
  if (message) {
    running = chrome.runtime
      .sendMessage(message)
      .finally(() => run(queue.shift()))
  } else {
    running = null
  }
}

export const sendToPopup = (body: ChromeMessageBody['chrome:sendToPopup']) => {
  const message: ChromeMessage<'chrome:sendToPopup'> = {
    type: 'chrome:sendToPopup',
    body: body,
  }

  if (running) {
    queue.push(message)
  } else {
    run(message)
  }
}
