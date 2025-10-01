import { cn } from '@heroui/react'

import { MarkerButtons } from './MarkerButtons'
import { GlobalOffsetControl } from './GlobalOffsetControl'

export type PositionControlProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  compact?: boolean
}

export function PositionControl({ compact, ...props }: PositionControlProps) {
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
