import type {
  ChromeStorageSettings,
  ChromeStorageChanges,
} from '@/types/chrome/storage'
import type { ChromeMessage, ChromeMessageBody } from '@/types/chrome/message'
import { ChromeMessageTypeCheck } from '@/types/chrome/message'
import NiconiComments from '@xpadev-net/niconicomments'
import { ChromeStorageApi } from '@/utils/chrome/storage'
import { getFromPage } from '@/utils/chrome/getFromPage'
import { removeChilds } from '@/utils/dom'
import { createCommentItem } from './utils/createCommentItem'

console.log('[NCOverlay] side_panel.html')

let settings: ChromeStorageSettings
let timeIdxPairs: number[][] = []
let prevIdx: number | null = null

chrome.runtime.onMessage.addListener((message: ChromeMessage, sender) => {
  // サイドパネルへ送信
  if (ChromeMessageTypeCheck['chrome:sendToSidePanel'](message)) {
    chrome.windows.getCurrent().then((window) => {
      if (window.id === sender.tab!.windowId) {
        if (0 < Object.keys(message.body).length) {
          update(message.body)
        } else {
          update({})
        }
      }
    })
  }

  return false
})

chrome.storage.local.onChanged.addListener((changes: ChromeStorageChanges) => {
  if (typeof changes.lowPerformance?.newValue !== 'undefined') {
    settings.lowPerformance = changes.lowPerformance.newValue
  }
})

const init = async () => {
  settings = await ChromeStorageApi.getSettings()
}

const update = async ({
  commentsData,
  currentTime,
}: ChromeMessageBody['chrome:sendToSidePanel']) => {
  const items = document.querySelector<HTMLElement>('#Items')!

  if (
    typeof commentsData === 'undefined' &&
    typeof currentTime === 'undefined'
  ) {
    timeIdxPairs = []
    removeChilds(items)
  }

  if (NiconiComments.typeGuard.v1.threads(commentsData)) {
    const comments = commentsData
      .map((v) => v.comments)
      .flat()
      .sort((a, b) => a.vposMs - b.vposMs)

    const fragment = document.createDocumentFragment()
    for (const key in comments) {
      const comment = comments[key]

      fragment.appendChild(createCommentItem(comment))

      timeIdxPairs.unshift([Math.floor(comment.vposMs / 1000), Number(key)])
    }
    items.appendChild(fragment)

    prevIdx = null
  }

  if (typeof currentTime !== 'undefined') {
    const idx = timeIdxPairs.find((v) => v[0] <= currentTime)?.[1]

    if (typeof idx !== 'undefined' && idx !== prevIdx) {
      const targetItem = items.children[idx]

      if (targetItem) {
        targetItem.scrollIntoView({
          behavior: settings.lowPerformance ? 'instant' : 'smooth',
          block: 'end',
        })

        prevIdx = idx!
      }
    }
  }
}

const main = async () => {
  await init()

  const res = await getFromPage()

  console.log('[NCOverlay] getFromPage()', res)

  if (res) {
    update(res.result)
  }
}

main()
