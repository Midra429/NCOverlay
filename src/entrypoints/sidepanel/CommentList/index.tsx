import type { VirtuosoHandle, VirtuosoProps } from 'react-virtuoso'
import type { NcoV1Comment } from '@/ncoverlay/state'

import { useEffect, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { onNcoMessage } from '@/ncoverlay/messaging'
import { filterDisplayThreads } from '@/ncoverlay/state'
import { ncoId, useNcoState } from '@/hooks/useNco'
import { useSettings } from '@/hooks/useSettings'

import { Header } from './Header'
import { Item } from './Item'

const components: VirtuosoProps<NcoV1Comment, any>['components'] = {
  EmptyPlaceholder: () => (
    <div className="flex size-full items-center justify-center">
      <span className="text-foreground-500 text-small">
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

export function CommentList() {
  const virtuoso = useRef<VirtuosoHandle>(null)

  const [isHover, setIsHover] = useState(false)
  const [comments, setComments] = useState<NcoV1Comment[]>([])

  const stateOffset = useNcoState('offset')
  const stateSlots = useNcoState('slots')
  const stateSlotDetails = useNcoState('slotDetails')

  const [smoothScrolling] = useSettings('settings:commentList:smoothScrolling')

  const offsetMs = (stateOffset ?? 0) * 1000
  const behavior = smoothScrolling ? 'smooth' : 'auto'

  useEffect(() => {
    filterDisplayThreads(stateSlots, stateSlotDetails).then((threads) => {
      const comments: NcoV1Comment[] | undefined = threads
        ?.flatMap((thread) => thread.comments)
        .sort((a, b) => a.vposMs - b.vposMs)

      setComments(comments ?? [])
    })
  }, [stateSlots, stateSlotDetails])

  useEffect(() => {
    if (isHover) return

    return onNcoMessage('timeupdate', ({ data }) => {
      if (data.id !== ncoId) return

      const currentTime = data.time - offsetMs
      const index = comments.findLastIndex((cmt) => cmt.vposMs <= currentTime)

      if (index !== -1) {
        virtuoso.current?.scrollToIndex({
          index,
          align: 'end',
          behavior,
        })
      }
    })
  }, [virtuoso.current, isHover, behavior])

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
}
