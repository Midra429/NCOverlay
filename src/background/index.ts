import type { ChromeMessage, ChromeResponse } from '@/types/chrome'
import { NiconicoApi } from './api/niconico'

console.log('[NCOverlay] background.js')

const isChromeMessageSearch = (
  msg: ChromeMessage
): msg is ChromeMessage<'niconico:search'> => msg.type === 'niconico:search'

const isChromeMessageVideo = (
  msg: ChromeMessage
): msg is ChromeMessage<'niconico:video'> => msg.type === 'niconico:video'

const isChromeMessageThreads = (
  msg: ChromeMessage
): msg is ChromeMessage<'niconico:threads'> => msg.type === 'niconico:threads'

const isChromeMessageBadge = (
  msg: ChromeMessage
): msg is ChromeMessage<'chrome:badge'> => msg.type === 'chrome:badge'

chrome.action.disable()

chrome.runtime.onInstalled.addListener(() => {
  // chrome.declarativeContent.onPageChanged.removeRules(() => {
  //   chrome.declarativeContent.onPageChanged.addRules([
  //     {
  //       conditions: [
  //         new chrome.declarativeContent.PageStateMatcher({
  //           css: ['html.NCOverlay'],
  //         }),
  //       ],
  //       actions: [new chrome.declarativeContent.ShowAction()],
  //     },
  //   ])
  // })

  chrome.action.setBadgeBackgroundColor({
    color: '#2389FF',
  })
  chrome.action.setBadgeTextColor({
    color: '#ffffff',
  })
})

chrome.runtime.onMessage.addListener(
  (
    message: ChromeMessage,
    sender,
    sendResponse: (response: ChromeResponse) => void
  ) => {
    let promise: Promise<any> | null = null

    if (isChromeMessageSearch(message)) {
      const minLength = message.body.duration ? message.body.duration - 30 : -1
      const maxLength = message.body.duration ? message.body.duration + 30 : -1

      promise = NiconicoApi.search({
        q: message.body.title,
        targets: ['title'],
        fields: ['contentId', 'title', 'channelId'],
        filters: {
          'genre.keyword': {
            '0': 'アニメ',
          },
          'lengthSeconds':
            0 <= minLength && 0 < maxLength
              ? {
                  gte: minLength,
                  lte: maxLength,
                }
              : undefined,
        },
        _limit: '5',
      })
    }

    if (isChromeMessageVideo(message)) {
      promise = NiconicoApi.video(message.body.videoId, message.body.guest)
    }

    if (isChromeMessageThreads(message)) {
      promise = NiconicoApi.threads(message.body.nvComment)
    }

    if (isChromeMessageBadge(message)) {
      chrome.action.setBadgeText({
        text: message.body,
        tabId: sender.tab?.id,
      })
    }

    if (promise) {
      promise
        .then((result) => {
          sendResponse({
            id: message.id,
            type: message.type,
            result: result,
          })
        })
        .catch((e) => {
          console.error(e)

          sendResponse({
            id: message.id,
            type: message.type,
            result: null,
          })
        })

      return true
    }

    return false
  }
)
