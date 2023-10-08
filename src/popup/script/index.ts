import type { ChromeStorageChanges } from '@/types/chrome/storage'
import type { ChromeMessage } from '@/types/chrome/message'
import type { VideoData } from '@/types/niconico/video'
import { isChromeMessageSendToPopup } from '@/types/chrome/message'
import { GITHUB_URL } from '@/constants'
import { ChromeStorageApi } from '@/utils/storage'
import { removeChilds } from '@/utils/dom/removeChilds'
import { getFromPage } from './utils/getFromPage'
import { createVideoItem } from './utils/createVideoItem'

console.log('[NCOverlay] popup.html')

chrome.runtime.onMessage.addListener((message: ChromeMessage, sender) => {
  if (isChromeMessageSendToPopup(message)) {
    if (0 < Object.keys(message).length) {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab?.id === sender.tab?.id) {
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
  linkGitHub.style.backgroundImage = `url("${chrome.runtime.getURL(
    'assets/github-mark.svg'
  )}")`

  const settings = await ChromeStorageApi.get({
    enable: true,
    opacity: 100,
  })

  // enable
  const settingEnable =
    document.querySelector<HTMLInputElement>('#SettingEnable')!

  settingEnable.checked = settings.enable!
  settingEnable.addEventListener('change', async function () {
    await ChromeStorageApi.set({ enable: this.checked })
  })

  // opacity
  const settingOpacity =
    document.querySelector<HTMLInputElement>('#SettingOpacity')!
  const settingOpacityValue = document.querySelector('#SettingOpacityValue')!

  settingOpacityValue.textContent = settingOpacity.value =
    settings.opacity!.toString()

  const opacityChanged = async function (this: HTMLInputElement, ev: Event) {
    settingOpacityValue.textContent = this.value
    await ChromeStorageApi.set({ opacity: Number(this.value) })
  }

  settingOpacity.addEventListener('input', opacityChanged)
  settingOpacity.addEventListener('change', opacityChanged)

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
    }
  )

  setTimeout(() => {
    document.body.classList.remove('loading')
  }, 100)
}

const update = ({
  commentsCount,
  videoData,
}: {
  commentsCount?: number
  videoData?: VideoData[]
}) => {
  document.querySelector('#CommentsCount')!.textContent = commentsCount
    ? `(${commentsCount.toLocaleString()}件)`
    : ''

  const items = document.querySelector<HTMLElement>('#Items')!

  removeChilds(items)

  if (videoData) {
    const fragment = document.createDocumentFragment()
    for (const data of videoData) {
      fragment.appendChild(createVideoItem(data))
    }
    items.appendChild(fragment)
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
