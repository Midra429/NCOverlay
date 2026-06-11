import React from 'react'
import ReactDOM from 'react-dom/client'

import { onExtensionMessage } from '@/messaging/extension'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

window.addEventListener('dragenter', (evt) => {
  evt.preventDefault()
})

window.addEventListener('dragover', (evt) => {
  evt.preventDefault()
})

window.addEventListener('dragleave', (evt) => {
  evt.preventDefault()
})

window.addEventListener('drop', (evt) => {
  evt.preventDefault()

  const files = evt.dataTransfer?.files

  if (!files?.length) return

  if (files[0].type.startsWith('video/')) {
    const input = document.getElementById('video-file-drop') as HTMLInputElement

    input.files = files

    input.click()
  } else {
    alert('非対応のファイルです')
  }
})

onExtensionMessage('content:selectVideoFile', () => {
  const input = document.getElementById('video-file-picker') as HTMLInputElement

  input.click()
})
