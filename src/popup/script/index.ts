import type { WebExtMessage } from '@/types/webext/message'
import type { WebExtStorageChanges } from '@/types/webext/storage'
import { WebExtMessageTypeCheck } from '@/types/webext/message'
import { GITHUB_URL } from '@/constants'
import webext from '@/webext'
import { WebExtStorageApi } from '@/utils/webext/storage'
import { getCurrentTab } from '@/utils/webext/getCurrentTab'
import { getFromPage } from '@/utils/webext/getFromPage'
import { removeChilds } from '@/utils/dom'
import { createVideoItem } from './utils/createVideoItem'

console.log('[NCOverlay] popup.html')

// const manifest = webext.runtime.getManifest()

webext.runtime.onMessage.addListener((message: WebExtMessage, sender) => {
  if (sender.tab!.active) {
    // ポップアップへ送信
    if (WebExtMessageTypeCheck('webext:sendToPopup', message)) {
      webext.windows.getCurrent().then((window) => {
        if (window.id === sender.tab!.windowId) {
          update(message.body)
        }
      })
    }
  }
})

const init = async () => {
  document.body.classList.add('loading')

  const { version } = webext.runtime.getManifest()

  // バージョン
  const linkVersion = document.querySelector<HTMLAnchorElement>('#Version')!
  linkVersion.textContent = `v${version}`
  linkVersion.href = `${GITHUB_URL}/releases/tag/v${version}`
  linkVersion.title = `${linkVersion.textContent}の更新内容`

  // GitHub
  const linkGitHub = document.querySelector<HTMLAnchorElement>('#LinkGitHub')!
  linkGitHub.href = GITHUB_URL

  // リセット
  const buttonReset = document.querySelector<HTMLElement>('#ButtonReset')!
  buttonReset.addEventListener('click', async () => {
    if (confirm('設定をリセットしますか？')) {
      await WebExtStorageApi.clearSettings()
    }
  })

  const settings = await WebExtStorageApi.getSettings()

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
      // チェックボックス
      if (inputElem.type === 'checkbox' && typeof setting === 'boolean') {
        inputElem.checked = setting

        const onChange = async function () {
          if (valueElem) {
            valueElem.textContent = this.value
          }

          await WebExtStorageApi.set({ [key]: this.checked })
        }

        inputElem.addEventListener('change', onChange)
      }

      // スライダー
      if (inputElem.type === 'range' && typeof setting === 'number') {
        inputElem.value = setting.toString()

        const onChange = async function () {
          if (valueElem) {
            valueElem.textContent = this.value
          }

          await WebExtStorageApi.set({ [key]: Number(this.value) })
        }

        inputElem.addEventListener('input', onChange)
        inputElem.addEventListener('change', onChange)
      }
    }

    if (valueElem) {
      valueElem.textContent = setting.toString()
    }

    // 設定変更時のイベントリスナー
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
  if (webext.sidePanel?.open) {
    const commentsCount = document.querySelector<HTMLElement>('#CommentsCount')!
    commentsCount.classList.add('is-button')
    commentsCount.title = 'サイドパネルを開く'
    commentsCount.addEventListener('click', () => {
      getCurrentTab().then((tab) => {
        if (typeof tab?.id !== 'undefined') {
          // Chrome
          if (webext.isChrome && webext.sidePanel) {
            webext.sidePanel.setOptions({
              tabId: tab.id,
              enabled: true,
            })

            webext.sidePanel.open?.({
              windowId: tab.windowId,
            })
          }
          // Firefox
          // else if (webext.isFirefox) {
          //   webext.sidebarAction.setPanel({
          //     tabId: tab.id,
          //     panel: manifest.sidebar_action!.default_panel,
          //   })
          // }
        }
      })

      // if (webext.isFirefox) {
      //   webext.sidebarAction.open()
      // }
    })
  }

  // 別のポップアップからの設定変更時
  webext.storage.local.onChanged.addListener(
    (changes: WebExtStorageChanges) => {
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

const update = (body: WebExtMessage<'webext:sendToPopup'>['body']) => {
  const items = document.querySelector<HTMLElement>('#VideoItems')!

  if (!body) {
    removeChilds(items)

    return
  }

  const { initData, commentsCount } = body
  const videoData = initData?.map((v) => v.videoData)

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
