import type { VirtuosoProps, VirtuosoHandle } from 'react-virtuoso'
import type { V1Thread } from '@xpadev-net/niconicomments'

import { memo, useMemo, useEffect, useState, useRef, forwardRef } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { useNcoState, useNcoTime } from '@/hooks/useNco'
import { filterDisplayThreads } from '@/ncoverlay/state'

import { Header } from './Header'
import { Item } from './Item'

const components: VirtuosoProps<
  V1Thread['comments'][number],
  any
>['components'] = {
  EmptyPlaceholder: () => (
    <div className="flex size-full items-center justify-center">
      <span className="text-small text-foreground-500">
        コメントはありません
      </span>
    </div>
  ),

  Scroller: forwardRef(({ children, ...props }, ref) => {
    return (
      <div {...props} className="flex flex-col" ref={ref}>
        <Header />

        <div className="relative size-full">{children}</div>
      </div>
    )
  }),
}

export const CommentList: React.FC = memo(() => {
  const [isHover, setIsHover] = useState(false)
  const [comments, setComments] = useState<V1Thread['comments']>([])

  const stateOffset = useNcoState('offset')
  const stateSlots = useNcoState('slots')
  const stateSlotDetails = useNcoState('slotDetails')
  const time = useNcoTime()

  const offsetMs = useMemo(() => {
    return (stateOffset ?? 0) * 1000
  }, [stateOffset])

  const virtuoso = useRef<VirtuosoHandle>(null)

  useEffect(() => {
    filterDisplayThreads(stateSlots, stateSlotDetails).then((threads) => {
      const comments = threads
        ?.flatMap((thread) => thread.comments)
        .sort((cmtA, cmtB) => cmtA.vposMs - cmtB.vposMs)

      setComments(comments ?? [])
    })
  }, [stateSlots, stateSlotDetails])

  useEffect(() => {
    if (isHover) return

    const currentTime = time - offsetMs
    const index = comments.findLastIndex((cmt) => cmt.vposMs <= currentTime)

    if (index !== -1) {
      virtuoso.current?.scrollToIndex({
        index,
        align: 'end',
      })
    }
  }, [time])

  return (
    <Virtuoso
      ref={virtuoso}
      defaultItemHeight={33}
      overscan={1000}
      components={components}
      data={comments}
      itemContent={(_, data) => <Item comment={data} offsetMs={offsetMs} />}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    />
  )
})
