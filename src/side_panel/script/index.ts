import type { ChromeMessage, ChromeMessageBody } from '@/types/chrome/message'
import { ChromeMessageTypeCheck } from '@/types/chrome/message'
import NiconiComments from '@xpadev-net/niconicomments'
import { getFromPage } from '@/utils/chrome'
import { removeChilds } from '@/utils/dom'
import { createCommentItem } from './utils/createCommentItem'

console.log('[NCOverlay] side_panel.html')

let timeIdxPairs: number[][] = []
let prevIdx: number | null = null

chrome.runtime.onMessage.addListener((message: ChromeMessage, sender) => {
  // サイドパネルへ送信
  if (ChromeMessageTypeCheck['chrome:sendToSidePanel'](message)) {
    if (0 < Object.keys(message.body).length) {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab?.id === sender.tab?.id) {
          update(message.body)
        }
      })
    } else {
      update({})
    }
  }

  return false
})

// const init = async () => {}

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
          behavior: 'smooth',
          block: 'end',
        })

        prevIdx = idx!
      }
    }
  }
}

const main = async () => {
  // await init()

  const res = await getFromPage()

  console.log('[NCOverlay] getFromPage()', res)

  if (res) {
    update(res.result)
  }
}

main()
