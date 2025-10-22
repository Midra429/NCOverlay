import type { SlotsToClasses } from '@heroui/react'
import type { StateSlotDetail, NcoV1ThreadComment } from '@/ncoverlay/state'

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  cn,
} from '@heroui/react'
import { CopyIcon, PlusIcon, ClockIcon } from 'lucide-react'
import { useOverflowDetector } from 'react-detectable-overflow'

import { NICONICO_COLOR_COMMANDS, COLOR_CODE_REGEXP } from '@/constants'

import { formatDuration, formatDate } from '@/utils/format'
import { readableColor } from '@/utils/color'
import { settings } from '@/utils/settings/extension'
import { sendNcoMessage } from '@/ncoverlay/messaging'

import { ncoState } from '@/hooks/useNco'

const COMMENT_WRAPPER_TYPE_CLASSES: {
  [k in StateSlotDetail['type']]: string
} = {
  normal: cn('before:bg-transparent'),
  official: cn('before:bg-[#ffe248] dark:before:bg-[#ffd700]'),
  danime: cn('before:bg-danime-400 dark:before:bg-danime-500'),
  chapter: cn('before:bg-danime-400 dark:before:bg-danime-500'),
  szbh: cn('before:bg-gray-500 dark:before:bg-gray-600'),
  jikkyo: cn('before:bg-jikkyo-600 dark:before:bg-jikkyo-700'),
}

const COMMENT_CELL_COMMAND_CLASSES: Record<string, string> = {
  // 位置: 上
  ue: cn('justify-center pt-0.5 pb-5'),
  // 位置: 下
  shita: cn('justify-center pt-5 pb-0.5'),
}

const COMMENT_COMMAND_CLASSES: Record<string, string> = {
  // サイズ: 大
  'big': cn('text-[110%] font-bold'),
  // サイズ: 小
  'small': cn('text-[75%]'),
  // 明朝体
  'mincho': cn('font-serif'),
  // 半透明
  '_live': cn('opacity-50'),
  'nico:opacity:0.5': cn('opacity-50'),
}

const NICORU_COLORS: Record<number, string> = {
  1: 'rgb(252 216 66 / 10%)',
  2: 'rgb(252 216 66 / 20%)',
  3: 'rgb(252 216 66 / 35%)',
  4: 'rgb(252 216 66 / 50%)',
}

type ItemCellProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement>
>

function ItemCell({ className, ...props }: ItemCellProps) {
  return (
    <div
      {...props}
      className={cn(
        'flex',
        'shrink-0 p-1.5',
        'border-divider border-b-1 border-l-1',
        'text-small',
        className
      )}
    />
  )
}

type ItemCellWithMenuProps = {
  classNames?: SlotsToClasses<'trigger' | 'wrapper' | 'cell'>
  style?: React.CSSProperties
  children: React.ReactNode
  menuElement: React.ReactElement
}

function ItemCellWithMenu({
  classNames,
  style,
  children,
  menuElement,
}: ItemCellWithMenuProps) {
  return (
    <Dropdown
      classNames={{
        backdrop: 'bg-transparent',
        base: 'max-w-[90vw]',
        content: 'border-foreground-100 overflow-hidden border-1',
      }}
      backdrop="opaque"
    >
      <DropdownTrigger
        className={cn(
          'z-0',
          'shrink-0',
          'cursor-pointer',
          'hover:bg-default/20 aria-expanded:bg-default/20',
          'dark:hover:bg-default/40 dark:aria-expanded:bg-default/40',
          'aria-expanded:scale-100',
          'aria-expanded:opacity-100',
          classNames?.trigger
        )}
      >
        <div className={cn(classNames?.wrapper)}>
          <ItemCell className={cn('size-full', classNames?.cell)} style={style}>
            {children}
          </ItemCell>
        </div>
      </DropdownTrigger>

      {menuElement}
    </Dropdown>
  )
}

function getCmtClassAndColor(commands: string[]) {
  const cmtCellCmdClass: string[] = []
  const cmtCmdClass: string[] = []
  let cmtBgColor: string | undefined
  let cmtFgColor: string | undefined

  commands?.forEach((command) => {
    if (command === 'white') return

    if (command in COMMENT_CELL_COMMAND_CLASSES) {
      cmtCellCmdClass.push(COMMENT_CELL_COMMAND_CLASSES[command])
    } else if (command in COMMENT_COMMAND_CLASSES) {
      cmtCmdClass.push(COMMENT_COMMAND_CLASSES[command])
    } else if (
      command in NICONICO_COLOR_COMMANDS ||
      COLOR_CODE_REGEXP.test(command)
    ) {
      cmtBgColor = NICONICO_COLOR_COMMANDS[command] ?? command
      cmtFgColor = readableColor(cmtBgColor)

      cmtCmdClass.push(
        cn('border-foreground-300 m-[-1px] rounded-[5px] border-1 px-1')
      )
    }
  })

  return { cmtCellCmdClass, cmtCmdClass, cmtBgColor, cmtFgColor }
}

export type ItemProps = {
  comment: NcoV1ThreadComment
  offsetMs: number
}

export function Item({ comment, offsetMs }: ItemProps) {
  const { ref, overflow } = useOverflowDetector()

  const { cmtCellCmdClass, cmtCmdClass, cmtBgColor, cmtFgColor } =
    getCmtClassAndColor(comment.commands)

  const displayCommands = comment.commands.filter(
    (cmd) => !cmd.startsWith('nico:')
  )

  const formattedDuration = formatDuration((comment.vposMs + offsetMs) / 1000)

  const formattedDate = formatDate(comment.postedAt)

  const nicoruColor =
    (9 <= comment.nicoruCount && NICORU_COLORS[4]) ||
    (6 <= comment.nicoruCount && NICORU_COLORS[3]) ||
    (3 <= comment.nicoruCount && NICORU_COLORS[2]) ||
    (1 <= comment.nicoruCount && NICORU_COLORS[1]) ||
    undefined

  // メニュー (コメント)
  function copyComment() {
    navigator.clipboard.writeText(comment.body)
  }
  function copyId() {
    navigator.clipboard.writeText(comment.userId)
  }

  async function addNgComment() {
    settings.set('settings:ng:words', [
      ...(await settings.get('settings:ng:words')),
      { content: comment.body },
    ])
  }
  async function addNgId() {
    settings.set('settings:ng:ids', [
      ...(await settings.get('settings:ng:ids')),
      { content: comment.userId },
    ])
  }

  const commentMenu = (
    <DropdownMenu variant="flat">
      <DropdownSection aria-label="コメント" showDivider>
        <DropdownItem
          key="comment"
          classNames={{
            base: [
              'pointer-events-none',
              '[&>span]:line-clamp-5 [&>span]:wrap-anywhere [&>span]:break-all [&>span]:whitespace-pre-wrap',
            ],
          }}
        >
          {comment.body}
        </DropdownItem>
      </DropdownSection>

      <DropdownSection aria-label="アクション" showDivider>
        <DropdownItem
          key="copy-comment"
          startContent={<CopyIcon className="size-4 shrink-0" />}
          onPress={copyComment}
        >
          コメントをコピー
        </DropdownItem>

        <DropdownItem
          key="copy-user-id"
          startContent={<CopyIcon className="size-4 shrink-0" />}
          onPress={copyId}
        >
          ユーザーIDをコピー
        </DropdownItem>
      </DropdownSection>

      <DropdownSection title="NG設定" className="mb-0">
        <DropdownItem
          key="add-comment"
          startContent={<PlusIcon className="size-4 shrink-0" />}
          onPress={addNgComment}
        >
          コメントを追加
        </DropdownItem>

        <DropdownItem
          key="add-user-id"
          startContent={<PlusIcon className="size-4 shrink-0" />}
          onPress={addNgId}
        >
          ユーザーIDを追加
        </DropdownItem>
      </DropdownSection>
    </DropdownMenu>
  )

  // メニュー (再生時間)
  async function adjustGlobalOffset() {
    const currentTime = (await sendNcoMessage('getCurrentTime', null)) ?? 0

    ncoState?.set(
      'offset',
      Math.floor((comment.vposMs / 1000) * -1 + currentTime)
    )
  }

  const timeMenu = (
    <DropdownMenu variant="flat">
      <DropdownItem
        key="adjust-global-offset"
        startContent={<ClockIcon className="size-4 shrink-0" />}
        onPress={adjustGlobalOffset}
      >
        オフセットを合わせる
      </DropdownItem>
    </DropdownMenu>
  )

  return (
    <div className="flex flex-row">
      {/* コメント */}
      <ItemCellWithMenu
        classNames={{
          wrapper: [
            'relative',
            'w-[calc(100%-5rem)]',
            'before:absolute before:left-0',
            'before:block',
            'before:h-full before:w-1',
            'before:border-content1 before:border-b-1',
            COMMENT_WRAPPER_TYPE_CLASSES[comment._nco.slotType],
          ],
          cell: [
            'ml-1 w-[calc(100%-0.25rem)]',
            'border-l-foreground-300',
            cmtCellCmdClass,
          ],
        }}
        style={{ backgroundColor: nicoruColor }}
        menuElement={commentMenu}
      >
        <span
          className={cn('line-clamp-2 break-all', cmtCmdClass)}
          style={{
            backgroundColor: cmtBgColor,
            color: cmtFgColor,
          }}
          title={overflow ? comment.body : undefined}
          ref={ref}
        >
          {comment.body}
        </span>
      </ItemCellWithMenu>

      {/* 再生時間 */}
      <ItemCellWithMenu
        classNames={{
          wrapper: 'w-[5rem] font-mono',
          cell: 'justify-center',
        }}
        style={{ backgroundColor: nicoruColor }}
        menuElement={timeMenu}
      >
        <span className="line-clamp-1">{formattedDuration}</span>
      </ItemCellWithMenu>

      {/* ニコる */}
      <ItemCell
        className="w-12 justify-center font-mono"
        style={{ backgroundColor: nicoruColor }}
      >
        <span className="line-clamp-1">{comment.nicoruCount}</span>
      </ItemCell>

      {/* 書込日時 */}
      <ItemCell
        className="w-52 justify-center font-mono"
        style={{ backgroundColor: nicoruColor }}
      >
        <span className="line-clamp-1">{formattedDate}</span>
      </ItemCell>

      {/* コマンド */}
      <ItemCell
        className="w-full font-mono"
        style={{ backgroundColor: nicoruColor }}
      >
        <span className="line-clamp-1">{displayCommands.join(' ')}</span>
      </ItemCell>
    </div>
  )
}
