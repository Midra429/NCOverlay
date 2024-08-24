import type { VirtuosoProps, VirtuosoHandle } from 'react-virtuoso'
import type { V1Thread } from '@xpadev-net/niconicomments'

import { memo, useEffect, useState, useRef, forwardRef } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { useSettings } from '@/hooks/useSettings'
import { useNcoState, useNcoTime } from '@/hooks/useNco'
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
  const [offsetMs, setOffsetMs] = useState(0)
  const [comments, setComments] = useState<V1Thread['comments']>([])

  const { value: fps } = useSettings('settings:comment:fps')

  const stateOffset = useNcoState('offset')
  const stateSlots = useNcoState('slots')
  const stateSlotDetails = useNcoState('slotDetails')
  const time = useNcoTime()

  const virtuoso = useRef<VirtuosoHandle>(null)

  useEffect(() => {
    setOffsetMs((stateOffset ?? 0) * 1000)
  }, [stateOffset])

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

    const index = comments.findLastIndex((cmt) => cmt.vposMs + offsetMs <= time)

    if (index !== -1) {
      virtuoso.current?.scrollToIndex({
        index,
        align: 'end',
        behavior: fps === 30 ? 'auto' : 'smooth',
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
