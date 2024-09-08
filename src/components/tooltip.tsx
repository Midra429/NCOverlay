import type { TooltipPlacement } from '@nextui-org/react'

import { Tooltip as NextUITooltip } from '@nextui-org/react'

export type TooltipProps = React.PropsWithChildren<{
  placement?: TooltipPlacement
  content?: React.ReactNode
}>

export const Tooltip: React.FC<TooltipProps> = (props) => {
  return (
    <NextUITooltip
      classNames={{
        base: 'pointer-events-none max-w-48',
        content: 'whitespace-pre-wrap',
      }}
      placement={props.placement}
      size="sm"
      radius="sm"
      color="foreground"
      offset={5}
      closeDelay={0}
      content={props.content}
    >
      {props.children}
    </NextUITooltip>
  )
}
