import type {
  JikkyoDtvChannelId,
  JikkyoBsCsChannelId,
} from '@midra/nco-utils/types/api/constants'

import {
  JIKKYO_CHANNELS_DTV,
  JIKKYO_CHANNELS_BS_CS,
  CHANNEL_IDS_JIKKYO_SYOBOCAL,
} from '@midra/nco-utils/api/constants'

export const JIKKYO_CHANNEL_GROUPS = {
  DTV: {
    TITLE: '地デジ',
    IDS: Object.keys(JIKKYO_CHANNELS_DTV) as JikkyoDtvChannelId[],
  },
  STV: {
    TITLE: 'BS / CS',
    IDS: Object.keys(JIKKYO_CHANNELS_BS_CS) as JikkyoBsCsChannelId[],
  },
}

export const SYOBOCAL_CHANNEL_IDS = CHANNEL_IDS_JIKKYO_SYOBOCAL.map(
  ([_, scChId]) => scChId
)
