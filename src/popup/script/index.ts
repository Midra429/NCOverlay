import type { ChromeStorageChanges } from '@/types/chrome/storage'
import type { ChromeMessage } from '@/types/chrome/message'
import { isChromeMessageSendToPopup } from '@/types/chrome/message'
import { ChromeStorageApi } from '@/utils/storage'
import { removeChilds } from '@/utils/dom/removeChilds'
import { getFromPage } from './utils/getFromPage'
import { createVideoItem } from './utils/createVideoItem'

console.log('[NCOverlay] popup.html')

const init = async () => {
  const manifest = chrome.runtime.getManifest()

  if (manifest.version) {
    document.getElementById('Version')!.textContent = `v${manifest.version}`
  }

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
    document.querySelector<HTMLInputElement>('#SettingsOpacity')!
  const settingOpacityValue = document.getElementById('SettingsOpacityValue')!

  settingOpacityValue.textContent = settingOpacity.value =
    settings.opacity!.toString()

  settingOpacity.addEventListener('input', function () {
    settingOpacityValue.textContent = this.value
  })
  settingOpacity.addEventListener('change', async function () {
    await ChromeStorageApi.set({ opacity: Number(this.value) })
  })

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
}

const main = async () => {
  await init()

  const items = document.querySelector<HTMLElement>('#Items')!

  const response = await getFromPage()
  if (response?.result.videoData) {
    removeChilds(items)

    const fragment = document.createDocumentFragment()
    for (const data of response.result.videoData) {
      fragment.appendChild(createVideoItem(data))
    }
    items.appendChild(fragment)
  }

  chrome.runtime.onMessage.addListener((message: ChromeMessage, sender) => {
    if (isChromeMessageSendToPopup(message)) {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab?.id === sender.tab?.id) {
          console.log('[NCOverlay] chrome:sendToPopup', message.body)

          const { videoData } = message.body

          removeChilds(items)

          if (videoData) {
            const fragment = document.createDocumentFragment()
            for (const data of videoData) {
              fragment.appendChild(createVideoItem(data))
            }
            items.appendChild(fragment)
          }
        }
      })
    }

    return false
  })
}

main()
