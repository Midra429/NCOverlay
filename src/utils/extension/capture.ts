import type { StorageItems } from '@/types/storage'

import { Logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'
import { sendNcoMessage } from '@/ncoverlay/messaging'

export const capture = async (): Promise<
  false | StorageItems['settings:capture:method']
> => {
  const {
    'settings:capture:format': captureFormat,
    'settings:capture:method': captureMethod,
  } = await settings.get('settings:capture:format', 'settings:capture:method')

  try {
    const { format, data } = await sendNcoMessage(
      'capture',
      captureMethod === 'copy' ? 'png' : captureFormat
    )

    if (data) {
      const blob = new Blob([new Uint8Array(data)], {
        type: `image/${format}`,
      })

      switch (captureMethod) {
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

      return captureMethod
    }
  } catch (err) {
    Logger.error('capture', err)
  }

  return false
}
