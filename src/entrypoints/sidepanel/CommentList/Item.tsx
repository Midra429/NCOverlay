import type { SlotsToClasses } from '@heroui/react'
import type { NcoV1Comment, StateSlotDetail } from '@/ncoverlay/state'

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  cn,
} from '@heroui/react'
import { addToast } from '@heroui/toast'
import { ClockIcon, CopyIcon, PlusIcon } from 'lucide-react'
import { useOverflowDetector } from 'react-detectable-overflow'

import { COLOR_CODE_REGEXP, NICONICO_COLORS } from '@/constants'
import { readableColor } from '@/utils/color'
import { formatDate, formatDuration } from '@/utils/format'
import { settings } from '@/utils/settings/extension'
import { ncoState } from '@/hooks/useNco'
import { sendMessageToContent } from '@/messaging/to-content'

type CnReturn = ReturnType<typeof cn>

const COMMENT_WRAPPER_TYPE_CLASSES: Record<StateSlotDetail['type'], CnReturn> =
  {
    normal: cn('before:bg-transparent'),
    official: cn('before:bg-[#ffe248] dark:before:bg-[#ffd700]'),
    danime: cn('before:bg-danime-400 dark:before:bg-danime-500'),
    chapter: cn('before:bg-danime-400 dark:before:bg-danime-500'),
    szbh: cn('before:bg-gray-500 dark:before:bg-gray-600'),
    jikkyo: cn('before:bg-jikkyo-600 dark:before:bg-jikkyo-700'),
    nicolog: cn('before:bg-blue-500 dark:before:bg-blue-600'),
    file: cn('before:bg-blue-500 dark:before:bg-blue-600'),
  }

const COMMENT_CELL_COMMAND_CLASSES: Record<string, CnReturn> = {
  // 位置: 上
  ue: cn('justify-center pt-0.5 pb-5'),
  // 位置: 下
  shita: cn('justify-center pt-5 pb-0.5'),
}

const COMMENT_COMMAND_CLASSES: Record<string, CnReturn> = {
  // サイズ: 大
  big: cn('font-bold text-[110%]'),
  // サイズ: 小
  small: cn('text-[75%]'),
  // 明朝体
  mincho: cn('font-serif'),
  // 半透明
  _live: cn('opacity-50'),
}

const NICORU_COLORS: Record<number, string> = {
  1: 'rgb(252 216 66 / 10%)',
  2: 'rgb(252 216 66 / 20%)',
  3: 'rgb(252 216 66 / 35%)',
  4: 'rgb(252 216 66 / 50%)',
}

interface ItemCellProps
  extends React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> {}

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

interface ItemCellWithMenuProps {
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
        content: 'overflow-hidden border-1 border-foreground-100',
      }}
      backdrop="opaque"
    >
      <DropdownTrigger
        className={cn(
          'z-0',
          'shrink-0',
          'cursor-pointer',
          'hover:bg-default/20 aria-expanded:bg-default/20',
          'dark:aria-expanded:bg-default/40 dark:hover:bg-default/40',
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
  const cmtCellCmdClass: CnReturn[] = []
  const cmtCmdClass: CnReturn[] = []
  const cmtStyle: React.CSSProperties = {}

  const hasCustomColor = commands.includes('nco:customize:color')

  for (const command of commands) {
    if (command === 'white') continue

    // セル
    if (command in COMMENT_CELL_COMMAND_CLASSES) {
      cmtCellCmdClass.push(COMMENT_CELL_COMMAND_CLASSES[command])
    }
    // 文字
    else if (command in COMMENT_COMMAND_CLASSES) {
      cmtCmdClass.push(COMMENT_COMMAND_CLASSES[command])
    }
    // 不透明度
    else if (command.startsWith('nico:opacity:')) {
      const opacity = Number(command.split(':')[2])

      if (Number.isFinite(opacity)) {
        cmtStyle.opacity = opacity
      }
    }
    // 色
    else if (
      !hasCustomColor &&
      (command in NICONICO_COLORS || COLOR_CODE_REGEXP.test(command))
    ) {
      cmtStyle.backgroundColor = NICONICO_COLORS[command] ?? command
      cmtStyle.color = readableColor(cmtStyle.backgroundColor)

      cmtCmdClass.push(
        cn('-m-px rounded-[5px] border-1 border-foreground-300 px-1')
      )
    }
  }

  return { cmtCellCmdClass, cmtCmdClass, cmtStyle }
}

export interface ItemProps {
  comment: NcoV1Comment
  offsetMs: number
}

export function Item({ comment, offsetMs }: ItemProps) {
  const { ref, overflow } = useOverflowDetector()

  const { cmtCellCmdClass, cmtCmdClass, cmtStyle } = getCmtClassAndColor(
    comment.commands
  )

  const formattedDuration = formatDuration((comment.vposMs + offsetMs) / 1000)

  const formattedDate = formatDate(comment.postedAt)

  const nicoruColor =
    (9 <= comment.nicoruCount && NICORU_COLORS[4]) ||
    (6 <= comment.nicoruCount && NICORU_COLORS[3]) ||
    (3 <= comment.nicoruCount && NICORU_COLORS[2]) ||
    (1 <= comment.nicoruCount && NICORU_COLORS[1]) ||
    undefined

  async function copyComment() {
    try {
      await navigator.clipboard.writeText(comment.body)

      addToast({
        color: 'success',
        title: 'コメントをコピーしました',
      })
    } catch {
      addToast({
        color: 'danger',
        title: 'コメントのコピーに失敗しました',
      })
    }
  }
  async function copyId() {
    try {
      await navigator.clipboard.writeText(comment.userId)

      addToast({
        color: 'success',
        title: 'ユーザーIDをコピーしました',
      })
    } catch {
      addToast({
        color: 'danger',
        title: 'ユーザーIDのコピーに失敗しました',
      })
    }
  }

  async function addNgComment() {
    try {
      await settings.set('settings:ng:words', [
        ...(await settings.get('settings:ng:words')),
        { content: comment.body },
      ])

      addToast({
        color: 'success',
        title: 'NG設定(コメント)に追加しました',
      })
    } catch {
      addToast({
        color: 'danger',
        title: 'NG設定(コメント)の追加に失敗しました',
      })
    }
  }
  async function addNgId() {
    try {
      await settings.set('settings:ng:ids', [
        ...(await settings.get('settings:ng:ids')),
        { content: comment.userId },
      ])

      addToast({
        color: 'success',
        title: 'NG設定(ユーザーID)に追加しました',
      })
    } catch {
      addToast({
        color: 'danger',
        title: 'NG設定(ユーザーID)の追加に失敗しました',
      })
    }
  }

  const commentMenu = (
    <DropdownMenu variant="flat">
      <DropdownSection aria-label="コメント" showDivider>
        <DropdownItem
          key="comment"
          classNames={{
            base: [
              'pointer-events-none',
              '[&>span]:wrap-anywhere [&>span]:line-clamp-5 [&>span]:whitespace-pre-wrap [&>span]:break-all',
            ],
          }}
        >
          {comment.body}
        </DropdownItem>
      </DropdownSection>

      <DropdownSection aria-label="アクション" showDivider>
        <DropdownItem
          key="copy-comment"
          description={comment.body}
          startContent={<CopyIcon className="size-4 shrink-0" />}
          onPress={copyComment}
        >
          コメントをコピー
        </DropdownItem>

        <DropdownItem
          key="copy-user-id"
          description={comment.userId}
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
    const currentTime =
      (await sendMessageToContent('getCurrentTime', null)) ?? 0

    await ncoState?.set(
      'offset',
      Math.floor((comment.vposMs / 1000) * -1 + currentTime)
    )

    sendMessageToContent('rerender', null)
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
            'side1:w-full',
            'side2:w-[calc(100%-5rem)]',
            'side3:w-[calc(100%-8rem)]',
            'side4:w-[calc(100%-21rem)]',
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
          style={cmtStyle}
          title={overflow ? comment.body : undefined}
          ref={ref}
        >
          {comment.body}
        </span>
      </ItemCellWithMenu>

      {/* 再生時間 */}
      <ItemCellWithMenu
        classNames={{
          wrapper: 'w-20 font-mono',
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
        <span className="line-clamp-1">{comment._raw.commands.join(' ')}</span>
      </ItemCell>
    </div>
  )
}
