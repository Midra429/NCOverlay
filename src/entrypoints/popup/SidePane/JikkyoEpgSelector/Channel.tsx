import type { TVerChannelId } from '@midra/nco-api/types/constants'

import { cn } from '@heroui/react'
import { tverToJikkyoChId } from '@midra/nco-api/utils/tverToJikkyoChId'
import { JIKKYO_CHANNELS } from '@midra/nco-api/constants'

import { COLUMN_WIDTH } from './TverEpg'

export type ChannelCellProps = {
  tverChId: TVerChannelId
}

export const ChannelCell: React.FC<ChannelCellProps> = ({ tverChId }) => {
  const jkChId = tverToJikkyoChId(tverChId)
  const chName = JIKKYO_CHANNELS[jkChId!]

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        'shrink-0',
        'border-divider border-r-1',
        'bg-content2 text-content2-foreground',
        'text-mini font-semibold',
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

export type ChannelsProps = {
  tverChIds: TVerChannelId[]
}

export const Channels: React.FC<ChannelsProps> = ({ tverChIds }) => {
  return (
    <div
      className={cn(
        'sticky top-0 z-30',
        'flex flex-row',
        'border-divider border-b-1'
      )}
    >
      <div
        className={cn('bg-content2 shrink-0', 'border-divider border-r-1')}
        style={{ width: 20 }}
      />

      {tverChIds.map((tverChId) => (
        <ChannelCell key={tverChId} tverChId={tverChId} />
      ))}
    </div>
  )
}
