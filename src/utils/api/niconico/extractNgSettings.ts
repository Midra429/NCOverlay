import type { Ng } from '@midra/nco-utils/types/api/niconico/video'
import type { NgSettingsConverted } from '@/utils/api/niconico/getNgSettings'

export function extractNgSettings(ng: Ng): NgSettingsConverted {
  const ngSettings: NgSettingsConverted = {
    words: [],
    commands: [],
    ids: [],
  }

  ng.viewer?.items.forEach((item) => {
    ngSettings[`${item.type}s` as const]?.push(item.source)
  })

  return ngSettings
}
