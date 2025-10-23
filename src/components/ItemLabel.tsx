import { cn } from '@heroui/react'

export interface ItemLabelProps {
  title: React.ReactNode
  description?: React.ReactNode
}

export function ItemLabel(props: ItemLabelProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-small text-foreground">{props.title}</span>
      {props.description && (
        <span
          className={cn(
            'text-tiny whitespace-pre-wrap',
            'text-foreground-500 dark:text-foreground-600'
          )}
        >
          {props.description}
        </span>
      )}
    </div>
  )
}
