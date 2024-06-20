import type { ContentScriptContext } from 'wxt/client'

import { defineContentScript } from 'wxt/sandbox'

import onStoragePageMessage from './onStoragePageMessage'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: (ctx) => void main(ctx),
})

const main = (ctx: ContentScriptContext) => {
  onStoragePageMessage(ctx)
}
