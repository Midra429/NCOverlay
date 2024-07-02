import { defineContentScript } from 'wxt/sandbox'

import onStoragePageMessage from './onStoragePageMessage'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: () => void main(),
})

const main = () => {
  onStoragePageMessage()
}
