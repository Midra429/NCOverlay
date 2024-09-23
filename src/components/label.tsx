import { cn } from '@nextui-org/react'

export const ItemLabel: React.FC<{
  title: React.ReactNode
  description?: React.ReactNode
}> = (props) => {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-small text-foreground">{props.title}</span>
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
