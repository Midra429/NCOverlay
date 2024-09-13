import { cn } from '@nextui-org/react'

export type PanelItemProps = {
  className?: string
  children: React.ReactNode
}

export const PanelItem: React.FC<PanelItemProps> = (props) => {
  return (
    <div
      className={cn(
        'shrink-0',
        'overflow-hidden rounded-medium',
        'border-1 border-foreground-100',
        'bg-content1 text-foreground',
        'shadow-small'
      )}
    >
      <div className={props.className}>{props.children}</div>
    </div>
  )
}
