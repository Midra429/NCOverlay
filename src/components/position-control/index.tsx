import { memo } from 'react'

import { MarkerButtons } from './marker-buttons'
import { GlobalOffsetControl } from './global-offset-control'

export type PositionControlProps = {
  compact?: boolean
}

export const PositionControl: React.FC<PositionControlProps> = memo(
  ({ compact }) => {
    return (
      <div className="flex flex-col bg-content1">
        <MarkerButtons />

        <GlobalOffsetControl compact={compact} />
      </div>
    )
  }
)
