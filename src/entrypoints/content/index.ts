import { defineContentScript } from 'wxt/sandbox'

import registerStorageMessage from './registerStorageMessage'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: () => void main(),
})

const main = () => {
  registerStorageMessage()
}
