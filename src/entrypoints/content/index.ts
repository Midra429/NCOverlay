import { defineContentScript } from '#imports'

// import { registerProxy } from '@/utils/proxy-service/register'
// import { onMessage } from '@/utils/proxy-service/messaging/page'
// import { ncoApiProxy } from '@/proxy/nco-api/extension'

import registerStorageMessage from './registerStorageMessage'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: () => void main(),
})

const main = () => {
  // registerProxy('ncoApi', ncoApiProxy, onMessage)
  registerStorageMessage()
}
