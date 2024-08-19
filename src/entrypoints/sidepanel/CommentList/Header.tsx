import { cn } from '@nextui-org/react'

const HeaderCell: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>
> = ({ className, ...props }) => {
  return (
    <span
      {...props}
      className={cn(
        'flex-shrink-0 py-1.5',
        'bg-content2 text-center text-content2-foreground',
        'border-b-1 border-divider',
        '[&:not(:first-child)]:border-l-1',
        className
      )}
    />
  )
}

export const Header: React.FC = () => {
  return (
    <div className={cn('sticky top-0 z-10', 'flex flex-row', 'font-bold')}>
      <HeaderCell className="w-[5rem]">時間</HeaderCell>

      <HeaderCell className="w-[calc(100%-5rem)]">コメント</HeaderCell>

      <HeaderCell className="w-52">投稿日時</HeaderCell>

      <HeaderCell className="w-full">コマンド</HeaderCell>
    </div>
  )
}
