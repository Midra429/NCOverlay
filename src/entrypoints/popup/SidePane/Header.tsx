import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  cn,
} from '@nextui-org/react'
import {
  PlusIcon,
  ChevronDownIcon,
  CalendarClockIcon,
  Table2Icon,
} from 'lucide-react'

import { JikkyoSelector } from './JikkyoSelector'
import { JikkyoEpgSelector } from './JikkyoEpgSelector'

export const Header: React.FC = () => {
  const jkModalDc = useDisclosure()
  const jkEpgModalDc = useDisclosure()

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
                '[&>svg:last-child]:rotate-0 [&[aria-expanded="true"]>svg]:rotate-180',
                '[&>svg:last-child]:transition-transform'
              )}
              size="sm"
              variant="flat"
              color="primary"
              disableRipple
              startContent={<PlusIcon className="size-4" />}
              endContent={<ChevronDownIcon className="size-4" />}
            >
              追加
            </Button>
          </DropdownTrigger>

          <DropdownMenu variant="flat" color="primary">
            <DropdownItem
              key="jikkyo-kakolog"
              startContent={<CalendarClockIcon className="size-4" />}
              onPress={jkModalDc.onOpen}
            >
              ニコニコ実況 過去ログ
            </DropdownItem>

            <DropdownItem
              key="jikkyo-kakolog-epg"
              startContent={<Table2Icon className="size-4" />}
              onPress={jkEpgModalDc.onOpen}
            >
              ニコニコ実況 過去ログ (番組表)
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <JikkyoSelector
        isOpen={jkModalDc.isOpen}
        onOpenChange={jkModalDc.onOpenChange}
      />

      <JikkyoEpgSelector
        isOpen={jkEpgModalDc.isOpen}
        onOpenChange={jkEpgModalDc.onOpenChange}
      />
    </>
  )
}
