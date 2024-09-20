export const ItemLabel: React.FC<{
  title: React.ReactNode
  description?: React.ReactNode
}> = (props) => {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-small text-foreground">{props.title}</span>
      {props.description && (
        <span className="whitespace-pre-wrap text-tiny text-foreground-400">
          {props.description}
        </span>
      )}
    </div>
  )
}
