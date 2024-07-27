import type { V1Thread } from '@xpadev-net/niconicomments'

import { useMemo } from 'react'
import { cn } from '@nextui-org/react'
import { readableColor } from 'color2k'

import { NICONICO_COLOR_COMMANDS, REGEXP_COLOR_CODE } from '@/constants'

import { formatDuration, formatDate } from '@/utils/format'

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

const Cell: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>
> = ({ className, ...props }) => {
  return (
    <span
      {...props}
      className={cn(
        'border-b-1 border-b-divider',
        'flex-shrink-0 p-1.5',
        '[&:not(:first-child)]:border-l-1 [&:not(:first-child)]:border-l-divider',
        className
      )}
    />
  )
}

export const Item: React.FC<{
  comment: V1Thread['comments'][number]
}> = ({ comment }) => {
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
        REGEXP_COLOR_CODE.test(command)
      ) {
        bgColor = NICONICO_COLOR_COMMANDS[command] ?? command
        fgColor = readableColor(bgColor)

        classNames.push(
          cn('m-[-1px] rounded-[5px] border-1 border-foreground-300 px-1')
        )
      }
    })

    return [cn(classNames), bgColor, fgColor]
  }, [comment.commands])

  return (
    <div className="flex flex-row">
      {/* 再生時間 */}
      <Cell className="w-[5rem] text-center font-mono">
        <span className="line-clamp-1">
          {formatDuration(comment.vposMs / 1000)}
        </span>
      </Cell>

      {/* コメント */}
      <Cell className="w-[calc(100%-5rem)]">
        <span
          className={cn('line-clamp-2', commentClass)}
          style={{
            backgroundColor: commentBgColor,
            color: commentFgColor,
          }}
        >
          {comment.body}
        </span>
      </Cell>

      {/* 投稿日時 */}
      <Cell className="w-52 text-center font-mono">
        <span className="line-clamp-1">{formatDate(comment.postedAt)}</span>
      </Cell>

      {/* コマンド */}
      <Cell className="w-full font-mono">
        <span className="line-clamp-1">{comment.commands.join(' ')}</span>
      </Cell>
    </div>
  )
}
