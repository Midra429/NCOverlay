import type { ButtonProps } from "@heroui/react"

import { Button, cn } from "@heroui/react"
import { Tooltip } from './Tooltip'

export type PanelButtonProps = ButtonProps & {
  label?: string
}

export const PanelButton: React.FC<PanelButtonProps> = (props) => {
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
