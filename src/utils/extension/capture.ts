import type { StorageItems } from '@/types/storage'

import { logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'
import { sendMessageToContent } from '@/messaging/to-content'

export async function capture(): Promise<
  StorageItems['settings:capture:method'] | false
> {
  const [format, method] = await settings.get(
    'settings:capture:format',
    'settings:capture:method'
  )

  const response = await sendMessageToContent(
    'capture',
    method === 'copy' ? 'png' : format
  )

  if (response?.data) {
    try {
      const blob = new Blob([new Uint8Array(response.data)], {
        type: `image/${response.format}`,
      })

      switch (method) {
        case 'copy':
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
          ])

          break

        default:
          await webext.windows.create({
            type: 'popup',
            width: 1280,
            height: 960,
            url: URL.createObjectURL(blob),
          })
      }

      return method
    } catch (err) {
      logger.error('capture', err)
    }
  }

  return false
}
