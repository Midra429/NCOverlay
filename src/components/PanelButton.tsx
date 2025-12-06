import type { ButtonProps } from '@heroui/react'

import { Button, cn } from '@heroui/react'

import { Tooltip } from './Tooltip'

export interface PanelButtonProps extends ButtonProps {
  label?: string
}

export function PanelButton(props: PanelButtonProps) {
  return (
    <Tooltip content={props.label}>
      <Button
        {...props}
        className={cn(
          'h-[37px] min-w-0',
          '[&>svg]:size-[1.2rem]',
          '[&>svg]:pointer-events-none',
          props.className
        )}
        size="sm"
        variant="light"
        radius="none"
        fullWidth
      />
    </Tooltip>
  )
}
