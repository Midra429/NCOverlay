import type { SettingItems } from '@/types/storage'

import { logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'
import { sendExtensionMessage } from '@/messaging/extension'

export async function capture(): Promise<
  SettingItems['capture:method'] | false
> {
  const [format, method] = await settings.get(
    'capture:format',
    'capture:method'
  )

  const response = await sendExtensionMessage(
    'content:capture',
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
