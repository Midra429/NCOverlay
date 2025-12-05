import { cn } from '@heroui/react'

type ClassValue = Parameters<typeof cn>[0]

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
        'overflow-hidden rounded-medium',
        'border-1 border-foreground-200',
        'bg-content1 text-foreground',
        props.classNames?.wrapper
      )}
    >
      <div className={cn(props.className, props.classNames?.base)}>
        {props.children}
      </div>
    </div>
  )
}
