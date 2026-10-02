import type * as Watch from '@midra/nco-utils/types/api/niconico/watch'
import type { NgSettingsFormatted } from '@/utils/api/niconico/getNgSettings'

export function extractNgSettings(ng: Watch.CommentNg): NgSettingsFormatted {
  const ngSettings: NgSettingsFormatted = {
    words: [],
    commands: [],
    ids: [],
  }

  if (ng.viewer) {
    for (const item of ng.viewer.items) {
      ngSettings[`${item.type}s`]?.push(item.source)
    }
  }

  return ngSettings
}
