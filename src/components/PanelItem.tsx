import type { ClassValue } from 'clsx'

import { cn } from '@heroui/react'

export interface PanelItemProps {
  className?: string
  classNames?: {
    wrapper?: ClassValue
    base?: ClassValue
  }
  children: React.ReactNode
}

export function PanelItem(props: PanelItemProps) {
  return (
    <div
      className={cn(
        'shrink-0',
        'rounded-medium overflow-hidden',
        'border-foreground-200 border-1',
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
