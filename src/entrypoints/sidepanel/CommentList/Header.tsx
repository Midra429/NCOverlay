import { cn } from '@nextui-org/react'

const Cell: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>
> = ({ className, ...props }) => {
  return (
    <span
      {...props}
      className={cn(
        'flex-shrink-0 p-1.5',
        'bg-content2 text-center text-content2-foreground',
        'border-b-1 border-b-divider',
        '[&:not(:first-child)]:border-l-1 [&:not(:first-child)]:border-l-divider',
        className
      )}
    />
  )
}

export const Header: React.FC = () => {
  return (
    <div className={cn('sticky top-0 z-10', 'flex flex-row', 'font-bold')}>
      <Cell className="w-[5rem]">時間</Cell>

      <Cell className="w-[calc(100%-5rem)]">コメント</Cell>

      <Cell className="w-52">投稿日時</Cell>

      <Cell className="w-full">コマンド</Cell>
    </div>
  )
}
