import { cn } from '@heroui/react'
import { SmileIcon } from 'lucide-react'

type HeaderCellProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement>
>

function HeaderCell({ className, ...props }: HeaderCellProps) {
  return (
    <div
      {...props}
      className={cn(
        'flex items-center justify-center',
        'shrink-0 py-1.5',
        'bg-content2 text-content2-foreground',
        'border-divider border-b-1',
        'text-tiny font-semibold',
        'not-first:border-l-1',
        className
      )}
    />
  )
}

export function Header() {
  return (
    <div className="sticky top-0 z-10 flex flex-row">
      <HeaderCell className="w-[calc(100%-5rem)]">コメント</HeaderCell>

      <HeaderCell className="w-20">再生時間</HeaderCell>

      <HeaderCell className="w-12">
        <SmileIcon className="size-4" strokeWidth={2.5} />
      </HeaderCell>

      <HeaderCell className="w-52">書込日時</HeaderCell>

      <HeaderCell className="w-full">コマンド</HeaderCell>
    </div>
  )
}
