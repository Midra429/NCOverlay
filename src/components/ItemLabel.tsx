import { cn } from '@heroui/react'

export interface ItemLabelProps {
  title: React.ReactNode
  description?: React.ReactNode
  isDisabled?: boolean
}

export function ItemLabel(props: ItemLabelProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5',
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-disabled'
      )}
      data-disabled={props.isDisabled}
    >
      <span className="text-foreground text-small">{props.title}</span>

      {props.description && (
        <span
          className={cn(
            'whitespace-pre-wrap text-tiny',
            'text-foreground-500 dark:text-foreground-600'
          )}
        >
          {props.description}
        </span>
      )}
    </div>
  )
}
