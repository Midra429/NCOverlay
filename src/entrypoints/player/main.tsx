import React from 'react'
import ReactDOM from 'react-dom/client'

import { logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { querySelectorAsync } from '@/utils/dom/querySelectorAsync'
import { onExtensionMessage } from '@/messaging/extension'
import { NCOPatcher } from '@/ncoverlay/patcher'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

const FILE_EXT_REGEXP = /\.[a-z0-9]+$/i

void (async () => {
  // NCOPatcher
  const patcher = new NCOPatcher('_local', {
    getInfo: async (nco) => {
      const fileDetail = await nco.state.get('fileDetail')

      const title = fileDetail?.name.replace(FILE_EXT_REGEXP, '')
      const duration = nco.video.duration

      logger.log('title', title)
      logger.log('duration', duration)

      return title
        ? {
            input: title,
            duration,
          }
        : null
    },
    appendCanvas: (video, canvas) => {
      video.insertAdjacentElement('afterend', canvas)
    },
  })

  const video = (await querySelectorAsync<HTMLVideoElement>(
    document.body,
    'video'
  ))!
  const videoFilePicker = (await querySelectorAsync<HTMLInputElement>(
    document.body,
    '#video-file-picker'
  ))!

  let thumbObjUrl: string | undefined

  async function setFile(file?: File) {
    if (!file) return

    if (!file.type.startsWith('video/')) {
      alert('非対応のファイルです')

      return
    }

    await patcher.dispose()

    await patcher.setVideo(video, {
      type: file.type,
      name: file.name,
      size: file.size,
    })

    if (video.src) {
      URL.revokeObjectURL(video.src)
    }

    video.src = URL.createObjectURL(file)

    const title = file.name.replace(FILE_EXT_REGEXP, '')

    if (!thumbObjUrl) {
      const url = webext.runtime.getURL('/thumbnail.png')
      const blob = await fetch(url).then((res) => res.blob())
      thumbObjUrl = URL.createObjectURL(blob)
    }

    document.title = `${title} | NCOverlay`
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: 'NCOverlay',
      artwork: thumbObjUrl ? [{ src: thumbObjUrl }] : undefined,
    })
  }

  videoFilePicker.addEventListener('change', function (evt) {
    evt.preventDefault()

    setFile(this.files?.[0])
  })

  // ドラッグ&ドロップ
  function preventDefault(evt: Event) {
    evt.preventDefault()
  }

  window.addEventListener('dragenter', preventDefault)
  window.addEventListener('dragover', preventDefault)
  window.addEventListener('dragleave', preventDefault)
  window.addEventListener('drop', (evt) => {
    evt.preventDefault()

    setFile(evt.dataTransfer?.files?.[0])
  })

  // 右クリック
  window.addEventListener('contextmenu', (evt) => {
    evt.preventDefault()

    videoFilePicker.click()
  })

  // ポップアップ: 選択
  onExtensionMessage('content:selectVideoFile', () => {
    videoFilePicker.click()
  })
})()
