import { Button, Pagination as HeroUIPagination } from '@heroui/react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export type PaginationProps = {
  total: number
  page: number
  isDisabled?: boolean
  onPageChange: (page: number) => void
}

export function Pagination({
  total,
  page,
  isDisabled,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex flex-row justify-between">
      <Button
        size="sm"
        variant="flat"
        isIconOnly
        isDisabled={page <= 1 || isDisabled}
        onPress={() => onPageChange(1 < page ? page - 1 : page)}
      >
        <ChevronLeftIcon className="size-4" />
      </Button>

      <HeroUIPagination
        classNames={{
          base: '-m-2 p-2',
          wrapper: 'shadow-none',
          item: [
            'bg-default/40 shadow-none',
            '[&:first-of-type:last-of-type]:rounded-full!',
          ],
        }}
        size="sm"
        radius="full"
        isCompact
        isDisabled={isDisabled}
        total={total || 1}
        page={page || 1}
        onChange={onPageChange}
      />

      <Button
        size="sm"
        variant="flat"
        isIconOnly
        isDisabled={total <= page || isDisabled}
        onPress={() => onPageChange(page < total ? page + 1 : page)}
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  )
}
