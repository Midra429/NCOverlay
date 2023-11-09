import type {
  WebExtStorageSettings,
  WebExtStorageChanges,
} from '@/types/webext/storage'
import type { WebExtMessage } from '@/types/webext/message'
import { WebExtMessageTypeCheck } from '@/types/webext/message'
import webext from '@/webext'
import { WebExtStorageApi } from '@/utils/webext/storage'
import { getFromPage } from '@/utils/webext/getFromPage'
import { removeChilds } from '@/utils/dom'
import { createCommentItem } from './utils/createCommentItem'

console.log('[NCOverlay] side_panel.html')

let settings: WebExtStorageSettings
let timeIdxPairs: number[][] = []
let prevIdx: number | null = null

webext.runtime.onMessage.addListener((message: WebExtMessage, sender) => {
  if (sender.tab!.active) {
    // サイドパネルへ送信
    if (WebExtMessageTypeCheck('webext:sendToSidePanel', message)) {
      webext.windows.getCurrent().then((window) => {
        if (window.id === sender.tab!.windowId) {
          update(message.body)
        }
      })
    }
  }
})

webext.storage.local.onChanged.addListener((changes: WebExtStorageChanges) => {
  if (typeof changes.lowPerformance?.newValue !== 'undefined') {
    settings.lowPerformance = changes.lowPerformance.newValue
  }
})

const init = async () => {
  settings = await WebExtStorageApi.getSettings()
}

const update = async (
  body: WebExtMessage<'webext:sendToSidePanel'>['body']
) => {
  const items = document.querySelector<HTMLElement>('#Items')!

  if (!body) {
    timeIdxPairs = []
    removeChilds(items)

    return
  }

  const { initData, currentTime } = body

  if (typeof initData !== 'undefined') {
    const threads = initData
      ?.map((v) => v.threads)
      .flat()
      .filter((val, idx, ary) => {
        return (
          idx === ary.findIndex((v) => v.id === val.id && v.fork === val.fork)
        )
      })

    const comments = threads
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
    const idx = timeIdxPairs.find(([time]) => time <= currentTime)?.[1]

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
