import type { TVerChannelId } from '@midra/nco-utils/types/api/constants'

import { cn } from '@heroui/react'
import { tverJikkyoChIdMap } from '@midra/nco-utils/api/constants'
import { JIKKYO_CHANNELS } from '@midra/nco-utils/api/constants'

import { COLUMN_WIDTH } from './TverEpg'

export interface ChannelCellProps {
  tverChId: TVerChannelId
}

export function ChannelCell({ tverChId }: ChannelCellProps) {
  const jkChId = tverJikkyoChIdMap.get(tverChId)!
  const chName = JIKKYO_CHANNELS[jkChId]

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        'shrink-0',
        'border-divider border-r-1',
        'bg-content2 text-content2-foreground',
        'font-semibold text-mini',
        'truncate'
      )}
      style={{
        width: COLUMN_WIDTH,
        height: 20,
      }}
    >
      <span>{chName}</span>
    </div>
  )
}

export interface ChannelsProps {
  tverChIds: TVerChannelId[]
}

export function Channels({ tverChIds }: ChannelsProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-30',
        'flex flex-row',
        'border-divider border-b-1'
      )}
    >
      <div
        className={cn('shrink-0 bg-content2', 'border-divider border-r-1')}
        style={{ width: 20 }}
      />

      {tverChIds.map((tverChId) => (
        <ChannelCell key={tverChId} tverChId={tverChId} />
      ))}
    </div>
  )
}
