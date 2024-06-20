import { cn } from '@nextui-org/react'

export type PanelItemProps = {
  children: React.ReactNode
  className?: string
}

export const PanelItem: React.FC<PanelItemProps> = (props) => {
  return (
    <div
      className={cn(
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
