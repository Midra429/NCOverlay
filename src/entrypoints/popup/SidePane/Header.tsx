import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  cn,
} from '@nextui-org/react'
import { ChevronDownIcon, PlusIcon } from 'lucide-react'

import { JikkyoSelector } from './JikkyoSelector'

export const Header: React.FC = () => {
  const jkModalDc = useDisclosure()

  return (
    <>
      <div
        className={cn(
          'flex flex-row items-center justify-between',
          'p-2',
          'border-b-1 border-foreground-200',
          'bg-content1',
          'text-medium font-semibold'
        )}
      >
        <div className="flex flex-row items-center">
          <span>表示中のコメント</span>
        </div>

        <Dropdown
          classNames={{
            backdrop: 'bg-transparent',
            content: 'min-w-32 border-1 border-foreground-100',
          }}
          backdrop="opaque"
          placement="bottom-end"
        >
          <DropdownTrigger>
            <Button
              className={cn(
                '[&>svg]:rotate-0 [&[aria-expanded="true"]>svg]:rotate-180',
                '[&>svg]:transition-transform'
              )}
              size="sm"
              variant="flat"
              color="primary"
              disableRipple
              endContent={<ChevronDownIcon className="size-4" />}
            >
              追加
            </Button>
          </DropdownTrigger>

          <DropdownMenu variant="flat" color="primary">
            <DropdownItem
              startContent={<PlusIcon className="size-4" />}
              onPress={jkModalDc.onOpen}
            >
              ニコニコ実況 過去ログ
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <JikkyoSelector
        isOpen={jkModalDc.isOpen}
        onOpenChange={jkModalDc.onOpenChange}
      />
    </>
  )
}
