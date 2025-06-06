import type { VirtuosoProps, VirtuosoHandle } from 'react-virtuoso'
import type { NcoV1ThreadComment } from '@/ncoverlay/state'

import { memo, useMemo, useEffect, useState, useRef } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { useNcoState, useNcoTime } from '@/hooks/useNco'
import { filterDisplayThreads } from '@/ncoverlay/state'

import { Header } from './Header'
import { Item } from './Item'

const components: VirtuosoProps<NcoV1ThreadComment, any>['components'] = {
  EmptyPlaceholder: () => (
    <div className="flex size-full items-center justify-center">
      <span className="text-small text-foreground-500">
        コメントはありません
      </span>
    </div>
  ),

  Scroller: ({ children, ref, ...props }) => {
    return (
      <div {...props} className="flex flex-col" ref={ref}>
        <Header />

        <div className="relative size-full">{children}</div>
      </div>
    )
  },
}

export const CommentList: React.FC = memo(() => {
  const [isHover, setIsHover] = useState(false)
  const [comments, setComments] = useState<NcoV1ThreadComment[]>([])

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
      const comments: NcoV1ThreadComment[] | undefined = threads
        ?.flatMap((thread) => thread.comments)
        .sort((a, b) => a.vposMs - b.vposMs)

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
