import type { VodKey } from '@/types/constants'

import { settings } from '@/utils/settings/extension'

export async function checkVodEnable(vod: VodKey) {
  const vods = await settings.get('settings:vods')

  return vods.includes(vod)
}
