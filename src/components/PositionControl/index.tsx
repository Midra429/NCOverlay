import { cn } from '@heroui/react'

import { GlobalOffsetControl } from './GlobalOffsetControl'
import { MarkerButtons } from './MarkerButtons'

export interface PositionControlProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  compact?: boolean
}

export function PositionControl({ compact, ...props }: PositionControlProps) {
  return (
    <div
      {...props}
      className={cn('flex flex-col bg-content1', props.className)}
    >
      <MarkerButtons />

      <GlobalOffsetControl compact={compact} />
    </div>
  )
}
