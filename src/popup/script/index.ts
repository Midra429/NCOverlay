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
  // ポップアップへ送信
  if (ChromeMessageTypeCheck['chrome:sendToPopup'](message)) {
    if (0 < Object.keys(message.body).length) {
      getCurrentTab().then((tab) => {
        if (tab.id === sender.tab?.id) {
          console.log('[NCOverlay] chrome:sendToPopup', message.body)

          update(message.body)
        }
      })
    } else {
      update({})
    }
  }

  return false
})

const init = async () => {
  document.body.classList.add('loading')

  const { version } = chrome.runtime.getManifest()

  document.querySelector('#Version')!.textContent = `v${version}`

  const linkGitHub = document.querySelector<HTMLAnchorElement>('#LinkGitHub')!
  linkGitHub.href = GITHUB_URL

  const settings = await ChromeStorageApi.getSettings()

  // enable
  const settingEnable =
    document.querySelector<HTMLInputElement>('#SettingEnable')!

  settingEnable.checked = settings.enable
  settingEnable.addEventListener('change', async function () {
    await ChromeStorageApi.set({ enable: this.checked })
  })

  // opacity
  const settingOpacity =
    document.querySelector<HTMLInputElement>('#SettingOpacity')!
  const settingOpacityValue = document.querySelector('#SettingOpacityValue')!

  settingOpacityValue.textContent = settingOpacity.value =
    settings.opacity.toString()

  const opacityChanged = async function (this: HTMLInputElement, e: Event) {
    settingOpacityValue.textContent = this.value
    await ChromeStorageApi.set({ opacity: Number(this.value) })
  }

  settingOpacity.addEventListener('input', opacityChanged)
  settingOpacity.addEventListener('change', opacityChanged)

  // lowPerformance
  const settingLowPerformance = document.querySelector<HTMLInputElement>(
    '#SettingLowPerformance'
  )!

  settingLowPerformance.checked = settings.lowPerformance
  settingLowPerformance.addEventListener('change', async function () {
    await ChromeStorageApi.set({ lowPerformance: this.checked })
  })

  // showChangelog
  const settingShowChangelog = document.querySelector<HTMLInputElement>(
    '#SettingShowChangelog'
  )!

  settingShowChangelog.checked = settings.showChangelog
  settingShowChangelog.addEventListener('change', async function () {
    await ChromeStorageApi.set({ showChangelog: this.checked })
  })

  // コメント件数
  if ('open' in chrome.sidePanel) {
    const commentsCount = document.querySelector<HTMLElement>('#CommentsCount')!
    commentsCount.classList.add('is-button')
    commentsCount.title = 'サイドパネルを開く'
    commentsCount.addEventListener('click', () => {
      getCurrentTab().then(async (tab) => {
        await chrome.sidePanel.setOptions({
          tabId: tab.id,
          enabled: true,
        })

        // @ts-ignore
        chrome.sidePanel.open({
          windowId: tab.windowId,
        })
      })
    })
  }

  // 別のポップアップからの設定変更時
  chrome.storage.local.onChanged.addListener(
    (changes: ChromeStorageChanges) => {
      if (
        typeof changes.enable?.newValue !== 'undefined' &&
        settingEnable.checked !== changes.enable.newValue
      ) {
        settingEnable.checked = changes.enable.newValue
      }

      if (
        typeof changes.opacity?.newValue !== 'undefined' &&
        settingOpacity.value !== changes.opacity.newValue.toString()
      ) {
        settingOpacityValue.textContent = settingOpacity.value =
          changes.opacity.newValue.toString()
      }

      if (
        typeof changes.showChangelog?.newValue !== 'undefined' &&
        settingShowChangelog.checked !== changes.showChangelog.newValue
      ) {
        settingShowChangelog.checked = changes.showChangelog.newValue
      }
    }
  )

  setTimeout(() => document.body.classList.remove('loading'), 100)
}

const update = ({
  videoData,
  commentsCount,
}: ChromeMessageBody['chrome:sendToPopup']) => {
  const items = document.querySelector<HTMLElement>('#Items')!

  if (
    typeof videoData === 'undefined' &&
    typeof commentsCount === 'undefined'
  ) {
    removeChilds(items)
  }

  if (videoData) {
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
