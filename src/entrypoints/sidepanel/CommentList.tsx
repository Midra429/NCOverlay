import type { VirtuosoProps, VirtuosoHandle } from 'react-virtuoso'
import type { V1Thread } from '@xpadev-net/niconicomments'

import { memo, useMemo, useEffect, useState, useRef, forwardRef } from 'react'
import { cn } from '@nextui-org/react'
import { Virtuoso } from 'react-virtuoso'
import { readableColor } from 'color2k'

import { NICONICO_COLOR_COMMANDS, REGEXP_COLOR_CODE } from '@/constants'

import { formatDuration, formatDate } from '@/utils/format'
import { useNcoStateJson, useNcoTime } from '@/hooks/useNcoState'
import { filterDisplayThreads } from '@/ncoverlay/state'

const CommentListHeader: React.FC = () => {
  return (
    <div
      className={cn(
        'sticky top-0 z-10',
        'flex flex-row',
        'font-bold',
        '[&>*]:flex-shrink-0 [&>*]:p-1.5',
        '[&>*]:bg-content1 [&>*]:text-center',
        '[&>*]:border-b-1 [&>*]:border-b-divider',
        '[&>*:not(:first-child)]:border-l-1 [&>*:not(:first-child)]:border-l-divider'
      )}
    >
      <span className="w-[5rem]">時間</span>

      <span className="w-[calc(100%-5rem)]">コメント</span>

      <span className="w-52">投稿日時</span>

      <span className="w-full">コマンド</span>
    </div>
  )
}

const CommentListRow: React.FC<{
  comment: V1Thread['comments'][number]
}> = ({ comment }) => {
  const [classNames, bgColor, fgColor] = useMemo(() => {
    const classNames: string[] = []
    let bgColor: string | undefined
    let fgColor: string | undefined

    comment.commands.forEach((command) => {
      if (['white'].includes(command)) return

      // カラー
      if (
        command in NICONICO_COLOR_COMMANDS ||
        REGEXP_COLOR_CODE.test(command)
      ) {
        bgColor =
          NICONICO_COLOR_COMMANDS[
            command as keyof typeof NICONICO_COLOR_COMMANDS
          ] ?? command

        fgColor = readableColor(bgColor)

        classNames.push(
          cn('m-[-1px] rounded-[5px] border-1 border-foreground-300 px-1')
        )
      }
      // 明朝体
      else if (command === 'mincho') {
        classNames.push(cn('font-serif'))
      }
      // 小
      else if (command === 'small') {
        classNames.push(cn('text-[75%]'))
      }
      // 大
      else if (command === 'big') {
        classNames.push(cn('text-[110%] font-bold'))
      }
    })

    return [classNames, bgColor, fgColor]
  }, [comment.commands])

  return (
    <div
      className={cn(
        'flex flex-row',
        '[&>*]:border-b-1 [&>*]:border-b-divider',
        '[&>*]:flex-shrink-0 [&>*]:p-1.5',
        '[&>*:not(:first-child)]:border-l-1 [&>*:not(:first-child)]:border-l-divider'
      )}
    >
      {/* 再生時間 */}
      <span className="w-[5rem] text-center font-mono">
        <span className="line-clamp-1">
          {formatDuration(comment.vposMs / 1000)}
        </span>
      </span>

      {/* コメント */}
      <span className="w-[calc(100%-5rem)]">
        <span
          className={cn('line-clamp-2', classNames)}
          style={{
            backgroundColor: bgColor,
            color: fgColor,
          }}
        >
          {comment.body}
        </span>
      </span>

      {/* 投稿日時 */}
      <span className="w-52 text-center font-mono">
        <span className="line-clamp-1">{formatDate(comment.postedAt)}</span>
      </span>

      {/* コマンド */}
      <span className="w-full font-mono">
        <span className="line-clamp-1">{comment.commands.join(' ')}</span>
      </span>
    </div>
  )
}

const components: VirtuosoProps<
  V1Thread['comments'][number],
  any
>['components'] = {
  EmptyPlaceholder: forwardRef(() => {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="text-small text-foreground-400">
          コメントはありません
        </span>
      </div>
    )
  }),

  Scroller: forwardRef(({ children, ...props }, ref) => {
    return (
      <div {...props} className="flex flex-col" ref={ref}>
        <CommentListHeader />

        <div className="relative h-full w-full">{children}</div>
      </div>
    )
  }),
}

export const CommentList: React.FC = memo(() => {
  const [isHover, setIsHover] = useState(false)
  const [comments, setComments] = useState<V1Thread['comments']>([])

  const ncoStateJson = useNcoStateJson('slots', 'offset')
  const time = useNcoTime()

  const index = useMemo(() => {
    return comments.findLastIndex((cmt) => cmt.vposMs <= time)
  }, [comments, time])

  const virtuoso = useRef<VirtuosoHandle>(null)

  useEffect(() => {
    const slots = ncoStateJson?.slots ?? []
    const offset = ncoStateJson?.offset

    filterDisplayThreads(slots, offset).then((threads) => {
      const comments = threads
        ?.flatMap((thread) => thread.comments)
        .sort((cmtA, cmtB) => cmtA.vposMs - cmtB.vposMs)

      setComments(comments ?? [])
    })
  }, [ncoStateJson])

  useEffect(() => {
    if (isHover || index === -1) return

    virtuoso.current?.scrollToIndex({
      index,
      align: 'end',
      behavior: 'auto',
    })
  }, [index])

  return (
    <Virtuoso
      ref={virtuoso}
      components={components}
      data={comments}
      itemContent={(_, data) => <CommentListRow comment={data} />}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    />
  )
})
