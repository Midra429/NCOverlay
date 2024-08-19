import type { V1Thread } from '@xpadev-net/niconicomments'

import { useMemo } from 'react'
import { cn } from '@nextui-org/react'
import { readableColor } from 'color2k'

import { NICONICO_COLOR_COMMANDS, COLOR_CODE_REGEXP } from '@/constants'

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

const ItemCell: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>
> = ({ className, ...props }) => {
  return (
    <span
      {...props}
      className={cn(
        'flex',
        'flex-shrink-0 p-1.5',
        'border-b-1 border-divider',
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

    return [cn(classNames), bgColor, fgColor]
  }, [comment.commands])

  const formattedDuration = useMemo(() => {
    return formatDuration((comment.vposMs + offsetMs) / 1000)
  }, [comment.vposMs, offsetMs])

  const formattedDate = useMemo(() => {
    return formatDate(comment.postedAt)
  }, [comment.postedAt])

  return (
    <div className="flex flex-row">
      {/* 再生時間 */}
      <ItemCell className="w-[5rem] justify-center font-mono">
        <span className="line-clamp-1">{formattedDuration}</span>
      </ItemCell>

      {/* コメント */}
      <ItemCell className="w-[calc(100%-5rem)]">
        <span
          className={cn('line-clamp-2 !break-words break-keep', commentClass)}
          style={{
            backgroundColor: commentBgColor,
            color: commentFgColor,
          }}
        >
          {comment.body}
        </span>
      </ItemCell>

      {/* 投稿日時 */}
      <ItemCell className="w-52 justify-center font-mono">
        <span className="line-clamp-1">{formattedDate}</span>
      </ItemCell>

      {/* コマンド */}
      <ItemCell className="w-full font-mono">
        <span className="line-clamp-1">{comment.commands.join(' ')}</span>
      </ItemCell>
    </div>
  )
}
