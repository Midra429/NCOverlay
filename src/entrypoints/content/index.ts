import { defineContentScript } from '#imports'

import registerStorageMessage from './registerStorageMessage'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: () => void main(),
})

function main() {
  registerStorageMessage()
}
