import type { V1Thread } from '@xpadev-net/niconicomments'

import { useMemo, useCallback } from 'react'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  cn,
} from '@nextui-org/react'
import { CopyIcon, PlusIcon } from 'lucide-react'

import { NICONICO_COLOR_COMMANDS, COLOR_CODE_REGEXP } from '@/constants'

import { formatDuration, formatDate } from '@/utils/format'
import { readableColor } from '@/utils/color'
import { settings } from '@/utils/settings/extension'

const commentComamndClasses: Record<string, string> = {
  // 半透明
  _live: cn('opacity-50'),
  // 明朝体
  mincho: cn('font-serif'),
  // 小
  small: cn('text-[75%]'),
  // 大
  big: cn('text-[110%] font-bold'),
}

const nicoruColors: Record<number, string> = {
  1: 'rgb(252 216 66 / 10%)',
  2: 'rgb(252 216 66 / 20%)',
  3: 'rgb(252 216 66 / 35%)',
  4: 'rgb(252 216 66 / 50%)',
}

const ItemCell: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
> = ({ className, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        'flex',
        'flex-shrink-0 p-1.5',
        'border-b-1 border-divider',
        'text-small',
        '[&:not(:first-child)]:border-l-1',
        className
      )}
    />
  )
}

export const Item: React.FC<{
  comment: V1Thread['comments'][number]
  offsetMs: number
}> = ({ comment, offsetMs }) => {
  const [commentClass, commentBgColor, commentFgColor] = useMemo(() => {
    const classNames: string[] = []
    let bgColor: string | undefined
    let fgColor: string | undefined

    comment.commands.forEach((command) => {
      if (command === 'white') return

      if (command in commentComamndClasses) {
        classNames.push(commentComamndClasses[command])
      } else if (
        command in NICONICO_COLOR_COMMANDS ||
        COLOR_CODE_REGEXP.test(command)
      ) {
        bgColor = NICONICO_COLOR_COMMANDS[command] ?? command
        fgColor = readableColor(bgColor)

        classNames.push(
          cn('m-[-1px] rounded-[5px] border-1 border-foreground-300 px-1')
        )
      }
    })

    return [classNames, bgColor, fgColor]
  }, [comment.commands])

  const formattedDuration = useMemo(() => {
    return formatDuration((comment.vposMs + offsetMs) / 1000)
  }, [comment.vposMs, offsetMs])

  const formattedDate = useMemo(() => {
    return formatDate(comment.postedAt)
  }, [comment.postedAt])

  const nicoruColor = useMemo(() => {
    if (10 <= comment.nicoruCount) return nicoruColors[4]
    if (6 <= comment.nicoruCount) return nicoruColors[3]
    if (3 <= comment.nicoruCount) return nicoruColors[2]
    if (1 <= comment.nicoruCount) return nicoruColors[1]
  }, [comment.nicoruCount])

  const copyCommentBody = useCallback(
    () => navigator.clipboard.writeText(comment.body),
    [comment.body]
  )

  const copyCommentUserId = useCallback(
    () => navigator.clipboard.writeText(comment.userId),
    [comment.userId]
  )

  const addNgWord = useCallback(async () => {
    await settings.set('settings:ng:words', [
      ...(await settings.get('settings:ng:words')),
      { content: comment.body },
    ])
  }, [comment.body])

  const addNgId = useCallback(async () => {
    await settings.set('settings:ng:ids', [
      ...(await settings.get('settings:ng:ids')),
      { content: comment.userId },
    ])
  }, [comment.userId])

  return (
    <Dropdown
      classNames={{
        backdrop: 'bg-transparent',
        base: 'max-w-[90vw]',
        content: 'overflow-hidden border-1 border-foreground-100',
      }}
      backdrop="opaque"
    >
      <DropdownTrigger>
        <div
          className={cn(
            'flex flex-row',
            '!scale-100 !opacity-100',
            'hover:bg-default/20 aria-expanded:bg-default/20',
            'dark:hover:bg-default/40 dark:aria-expanded:bg-default/40'
          )}
        >
          {/* 再生時間 */}
          <ItemCell
            className={cn(
              'w-[5rem] justify-center font-mono',
              'cursor-pointer'
            )}
            style={{ backgroundColor: nicoruColor }}
          >
            <span className="line-clamp-1">{formattedDuration}</span>
          </ItemCell>

          {/* コメント */}
          <ItemCell
            className={cn('w-[calc(100%-5rem)]', 'cursor-pointer')}
            style={{ backgroundColor: nicoruColor }}
          >
            <span
              className={cn('line-clamp-2 break-all', commentClass)}
              style={{
                backgroundColor: commentBgColor,
                color: commentFgColor,
              }}
              title={comment.body}
            >
              {comment.body}
            </span>
          </ItemCell>

          {/* ニコる */}
          <ItemCell
            className="w-12 justify-center font-mono"
            style={{ backgroundColor: nicoruColor }}
          >
            <span className="line-clamp-1">{comment.nicoruCount}</span>
          </ItemCell>

          {/* 投稿日時 */}
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
            <span className="line-clamp-1">{comment.commands.join(' ')}</span>
          </ItemCell>
        </div>
      </DropdownTrigger>

      <DropdownMenu variant="flat">
        <DropdownSection aria-label="アクション" showDivider>
          <DropdownItem
            key="copy-comment"
            startContent={<CopyIcon className="size-4 shrink-0" />}
            onPress={copyCommentBody}
          >
            コメントをコピー
          </DropdownItem>
          <DropdownItem
            key="copy-id"
            startContent={<CopyIcon className="size-4 shrink-0" />}
            onPress={copyCommentUserId}
          >
            ユーザーIDをコピー
          </DropdownItem>
        </DropdownSection>

        <DropdownSection title="NG設定" className="mb-0">
          <DropdownItem
            key="add-ng-word"
            startContent={<PlusIcon className="size-4 shrink-0" />}
            onPress={addNgWord}
          >
            コメントを追加
          </DropdownItem>
          <DropdownItem
            key="add-ng-id"
            startContent={<PlusIcon className="size-4 shrink-0" />}
            onPress={addNgId}
          >
            ユーザーIDを追加
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}
