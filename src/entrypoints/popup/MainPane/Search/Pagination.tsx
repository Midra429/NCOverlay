import { Button, Pagination as NextUIPagination } from '@nextui-org/react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export type PaginationProps = {
  total: number
  page: number
  isDisabled?: boolean
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  total,
  page,
  isDisabled,
  onPageChange,
}) => {
  return (
    <div className="flex flex-row justify-between">
      <Button
        size="sm"
        variant="flat"
        isIconOnly
        isDisabled={page <= 1 || isDisabled}
        startContent={<ChevronLeftIcon className="size-4" />}
        onPress={() => onPageChange(1 < page ? page - 1 : page)}
      />

      <NextUIPagination
        classNames={{
          base: '-m-2 p-2',
          wrapper: 'shadow-none',
          item: [
            'bg-default/40 shadow-none',
            '[&:first-of-type:last-of-type]:rounded-full',
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
        startContent={<ChevronRightIcon className="size-4" />}
        onPress={() => onPageChange(page < total ? page + 1 : page)}
      />
    </div>
  )
}
