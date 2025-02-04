import type { ClassValue } from 'clsx'

import { cn } from "@heroui/react"

export type PanelItemProps = {
  className?: string
  classNames?: {
    wrapper?: ClassValue
    base?: ClassValue
  }
  children: React.ReactNode
}

export const PanelItem: React.FC<PanelItemProps> = (props) => {
  return (
    <div
      className={cn(
        'shrink-0',
        'overflow-hidden rounded-medium',
        'border-1 border-foreground-200',
        'bg-content1 text-foreground',
        // @ts-ignore
        props.classNames?.wrapper
      )}
    >
      <div
        className={cn(
          props.className,
          // @ts-ignore
          props.classNames?.base
        )}
      >
        {props.children}
      </div>
    </div>
  )
}
