import type { VirtuosoProps, VirtuosoHandle } from 'react-virtuoso'
import type { V1Thread } from '@xpadev-net/niconicomments'

import { memo, useMemo, useEffect, useState, useRef, forwardRef } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { useNcoStateJson, useNcoTime } from '@/hooks/useNcoState'
import { filterDisplayThreads } from '@/ncoverlay/state'

import { Header } from './Header'
import { Item } from './Item'

const components: VirtuosoProps<
  V1Thread['comments'][number],
  any
>['components'] = {
  EmptyPlaceholder: forwardRef(() => {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="text-small text-foreground-500">
          コメントはありません
        </span>
      </div>
    )
  }),

  Scroller: forwardRef(({ children, ...props }, ref) => {
    return (
      <div {...props} className="flex flex-col" ref={ref}>
        <Header />

        <div className="relative h-full w-full">{children}</div>
      </div>
    )
  }),
}

export const CommentList: React.FC = memo(() => {
  const [isHover, setIsHover] = useState(false)
  const [comments, setComments] = useState<V1Thread['comments']>([])
  const [offsetMs, setOffsetMs] = useState(0)

  const ncoStateJson = useNcoStateJson('slots', 'offset')
  const time = useNcoTime()

  const displayComments = useMemo(() => {
    return comments.flatMap((cmt) => {
      const vposMs = cmt.vposMs + offsetMs

      return 0 <= vposMs ? { ...cmt, vposMs } : []
    })
  }, [comments, offsetMs])

  const index = useMemo(() => {
    return displayComments.findLastIndex((cmt) => cmt.vposMs <= time)
  }, [displayComments, time])

  const virtuoso = useRef<VirtuosoHandle>(null)

  useEffect(() => {
    const slots = ncoStateJson?.slots ?? []

    filterDisplayThreads(slots).then((threads) => {
      const comments = threads
        ?.flatMap((thread) => thread.comments)
        .sort((cmtA, cmtB) => cmtA.vposMs - cmtB.vposMs)

      setComments(comments ?? [])
    })
  }, [ncoStateJson?.slots])

  useEffect(() => {
    setOffsetMs((ncoStateJson?.offset ?? 0) * 1000)
  }, [ncoStateJson?.offset])

  useEffect(() => {
    if (isHover || index === -1) return

    virtuoso.current?.scrollToIndex({
      index,
      align: 'end',
    })
  }, [index])

  return (
    <Virtuoso
      ref={virtuoso}
      components={components}
      data={displayComments}
      itemContent={(_, data) => <Item comment={data} />}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    />
  )
})
