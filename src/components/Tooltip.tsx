import type { TooltipPlacement } from '@heroui/react'

import { Tooltip as HeroUITooltip } from '@heroui/react'

export type TooltipProps = React.PropsWithChildren<{
  placement?: TooltipPlacement
  content?: React.ReactNode
}>

export function Tooltip({ placement, content, children }: TooltipProps) {
  return content ? (
    <HeroUITooltip
      classNames={{
        base: 'pointer-events-none max-w-48',
        content: 'whitespace-pre-wrap',
      }}
      placement={placement}
      size="sm"
      radius="sm"
      color="foreground"
      offset={5}
      closeDelay={0}
      content={content}
    >
      {children}
    </HeroUITooltip>
  ) : (
    children
  )
}
