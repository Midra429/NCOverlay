import { cn } from '@nextui-org/react'
import { SmileIcon } from 'lucide-react'

const HeaderCell: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
> = ({ className, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        'flex items-center justify-center',
        'shrink-0 py-1.5',
        'bg-content2 text-content2-foreground',
        'border-b-1 border-divider',
        'text-tiny font-semibold',
        '[&:not(:first-child)]:border-l-1',
        className
      )}
    />
  )
}

export const Header: React.FC = () => {
  return (
    <div className="sticky top-0 z-10 flex flex-row">
      <HeaderCell className="w-[calc(100%-5rem)]">コメント</HeaderCell>

      <HeaderCell className="w-[5rem]">再生時間</HeaderCell>

      <HeaderCell className="w-12">
        <SmileIcon className="size-4" strokeWidth={2.5} />
      </HeaderCell>

      <HeaderCell className="w-52">書込日時</HeaderCell>

      <HeaderCell className="w-full">コマンド</HeaderCell>
    </div>
  )
}
