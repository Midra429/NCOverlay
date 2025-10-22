import type { Ng } from '@midra/nco-utils/types/api/niconico/video'
import type { NgSettingsConverted } from '@/utils/api/niconico/getNgSettings'

export function extractNgSettings(ng: Ng): NgSettingsConverted {
  const ngSettings: NgSettingsConverted = {
    words: [],
    commands: [],
    ids: [],
  }

  if (ng.viewer) {
    for (const item of ng.viewer.items) {
      ngSettings[`${item.type}s` as const]?.push(item.source)
    }
  }

  return ngSettings
}
