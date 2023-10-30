import type { ChromeMessage, ChromeMessageBody } from '@/types/chrome/message'
import type { ChromeStorageChanges } from '@/types/chrome/storage'
import { ChromeMessageTypeCheck } from '@/types/chrome/message'
import { GITHUB_URL } from '@/constants'
import { ChromeStorageApi } from '@/utils/chrome/storage'
import { getCurrentTab } from '@/utils/chrome/getCurrentTab'
import { getFromPage } from '@/utils/chrome/getFromPage'
import { removeChilds } from '@/utils/dom'
import { createVideoItem } from './utils/createVideoItem'

console.log('[NCOverlay] popup.html')

chrome.runtime.onMessage.addListener((message: ChromeMessage, sender) => {
  if (sender.tab!.active) {
    // ポップアップへ送信
    if (ChromeMessageTypeCheck['chrome:sendToPopup'](message)) {
      chrome.windows.getCurrent().then((window) => {
        if (window.id === sender.tab!.windowId) {
          update(message.body)
        }
      })
    }
  }

  return false
})

const init = async () => {
  document.body.classList.add('loading')

  const { version } = chrome.runtime.getManifest()

  const linkVersion = document.querySelector<HTMLAnchorElement>('#Version')!
  linkVersion.textContent = `v${version}`
  linkVersion.href = `${GITHUB_URL}/releases/tag/v${version}`
  linkVersion.title = `${linkVersion.textContent}の更新内容`

  const linkGitHub = document.querySelector<HTMLAnchorElement>('#LinkGitHub')!
  linkGitHub.href = GITHUB_URL

  const settings = await ChromeStorageApi.getSettings()

  const settingChangedListeners: {
    [key in keyof typeof settings]?: (newValue: any) => void
  } = {}

  for (const key in settings) {
    const setting = settings[key]

    const inputElem = document.querySelector<HTMLInputElement>(
      `input[data-setting-key="${key}"]`
    )
    const valueElem = document.querySelector<HTMLElement>(
      `[data-setting-value="${key}"]`
    )

    if (inputElem) {
      if (inputElem.type === 'checkbox' && typeof setting === 'boolean') {
        inputElem.checked = setting

        const onChange = async function () {
          if (valueElem) {
            valueElem.textContent = this.value
          }

          await ChromeStorageApi.set({ [key]: this.checked })
        }

        inputElem.addEventListener('change', onChange)
      }

      if (inputElem.type === 'range' && typeof setting === 'number') {
        inputElem.value = setting.toString()

        const onChange = async function () {
          if (valueElem) {
            valueElem.textContent = this.value
          }

          await ChromeStorageApi.set({ [key]: Number(this.value) })
        }

        inputElem.addEventListener('input', onChange)
        inputElem.addEventListener('change', onChange)
      }
    }

    if (valueElem) {
      valueElem.textContent = setting.toString()
    }

    settingChangedListeners[key] = (newValue: any) => {
      if (inputElem) {
        if (inputElem.type === 'checkbox' && typeof newValue === 'boolean') {
          inputElem.checked = newValue
        }

        if (inputElem.type === 'range' && typeof newValue === 'number') {
          inputElem.value = newValue.toString()
        }
      }

      if (valueElem) {
        valueElem.textContent = newValue.toString()
      }
    }
  }

  // コメント件数
  if ('open' in chrome.sidePanel) {
    const commentsCount = document.querySelector<HTMLElement>('#CommentsCount')!
    commentsCount.classList.add('is-button')
    commentsCount.title = 'サイドパネルを開く'
    commentsCount.addEventListener('click', async () => {
      const tab = await getCurrentTab()

      if (typeof tab?.id !== 'undefined') {
        await chrome.sidePanel.setOptions({
          tabId: tab.id,
          enabled: true,
        })

        // @ts-ignore
        chrome.sidePanel.open({
          windowId: tab.windowId,
        })
      }
    })
  }

  // 別のポップアップからの設定変更時
  chrome.storage.local.onChanged.addListener(
    (changes: ChromeStorageChanges) => {
      for (const key in changes) {
        const newValue = changes[key]?.newValue

        if (typeof newValue !== 'undefined') {
          settingChangedListeners[key]?.(newValue)
        }
      }
    }
  )

  setTimeout(() => document.body.classList.remove('loading'), 100)
}

const update = (body: ChromeMessageBody['chrome:sendToPopup']) => {
  const items = document.querySelector<HTMLElement>('#VideoItems')!

  if (!body) {
    removeChilds(items)

    return
  }

  const { videoData, commentsCount } = body

  if (typeof videoData !== 'undefined') {
    const fragment = document.createDocumentFragment()
    for (const data of videoData) {
      fragment.appendChild(createVideoItem(data))
    }
    items.appendChild(fragment)
  }

  document.querySelector('#CommentsCount')!.textContent = commentsCount
    ? `(${commentsCount.toLocaleString()}件)`
    : ''
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
