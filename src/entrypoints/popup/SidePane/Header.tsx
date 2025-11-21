import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  cn,
} from '@heroui/react'
import {
  PlusIcon,
  ChevronDownIcon,
  CalendarClockIcon,
  Table2Icon,
  FileTextIcon,
  DatabaseIcon,
} from 'lucide-react'

// import { openWindow } from '@/entrypoints/input-file/open'

import { JikkyoSelector } from './JikkyoSelector'
import { JikkyoEpgSelector } from './JikkyoEpgSelector'
import { NicologSelector } from './NicologSelector'

export function Header() {
  const jkModalDc = useDisclosure()
  const jkEpgModalDc = useDisclosure()
  const nicologModalDc = useDisclosure()

  return (
    <>
      <div
        className={cn(
          'flex flex-row items-center justify-between',
          'p-2',
          'border-foreground-200 border-b-1',
          'bg-content1',
          'font-semibold text-medium'
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

            {/* <DropdownItem
              key="files"
              startContent={<FileTextIcon className="size-4" />}
              onPress={() => openWindow('select-comment-files')}
            >
              ローカルファイル (β)
            </DropdownItem> */}

            <DropdownItem
              key="nicolog"
              startContent={<DatabaseIcon className="size-4" />}
              onPress={nicologModalDc.onOpen}
            >
              nicolog (ニコニコ生放送のアニメコメントアーカイブ)
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

      <NicologSelector
        isOpen={nicologModalDc.isOpen}
        onOpenChange={nicologModalDc.onOpenChange}
      />
    </>
  )
}
