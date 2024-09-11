import type { ButtonProps } from '@nextui-org/react'

import { Button, cn } from '@nextui-org/react'
import { Tooltip } from './tooltip'

export type PanelButtonProps = ButtonProps & {
  compact?: boolean
}

export const PanelButton: React.FC<PanelButtonProps> = (props) => {
  const button = (
    <Button
      {...props}
      className={cn(
        'min-w-0',
        'border-1 border-foreground-100',
        'bg-content1 text-foreground',
        !props.isDisabled && 'shadow-small',
        props.className
      )}
      size={props.compact ? 'sm' : 'md'}
      variant="flat"
      fullWidth
    >
      {!props.compact && props.children}
    </Button>
  )

  return props.compact ? (
    <Tooltip content={props.children}>{button}</Tooltip>
  ) : (
    button
  )
}
