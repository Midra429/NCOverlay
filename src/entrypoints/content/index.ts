import { defineContentScript } from 'wxt/sandbox'
// import { ncoApi } from '@midra/nco-api'

// import { registerProxy } from '@/utils/proxy-service/register'
// import { onMessage } from '@/utils/proxy-service/messaging/page'

import registerStorageMessage from './registerStorageMessage'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: () => void main(),
})

const main = () => {
  // registerProxy('ncoApi', ncoApi, onMessage)

  registerStorageMessage()
}
