import type { Ng } from '@midra/nco-api/types/niconico/video'
import type { NgSettingsConverted } from '@/utils/extension/getNgSettings'

export const extractNgSettings = (ng: Ng): NgSettingsConverted => {
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
