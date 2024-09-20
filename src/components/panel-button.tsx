import type { ButtonProps } from '@nextui-org/react'

import { Button, cn } from '@nextui-org/react'
import { Tooltip } from './tooltip'

export type PanelButtonProps = ButtonProps & {
  label?: string
}

export const PanelButton: React.FC<PanelButtonProps> = (props) => {
  return (
    <Tooltip content={props.label}>
      <Button
        {...props}
        className={cn(
          'h-9 min-w-0',
          'bg-content1 text-foreground',
          '[&>svg]:size-[1.125rem]',
          props.className
        )}
        size="sm"
        variant="flat"
        radius="none"
        fullWidth
      />
    </Tooltip>
  )
}
