import { memo } from 'react'
import { cn } from '@heroui/react'

import { MarkerButtons } from './MarkerButtons'
import { GlobalOffsetControl } from './GlobalOffsetControl'

export type PositionControlProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  compact?: boolean
}

export const PositionControl: React.FC<PositionControlProps> = memo(
  ({ compact, ...props }) => {
    return (
      <div
        {...props}
        className={cn('bg-content1 flex flex-col', props.className)}
      >
        <MarkerButtons />

        <GlobalOffsetControl compact={compact} />
      </div>
    )
  }
)
