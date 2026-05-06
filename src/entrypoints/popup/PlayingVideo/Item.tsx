import { useOverflowDetector } from 'react-detectable-overflow'

import { useNcoState } from '@/hooks/useNco'

export function Item() {
  const { ref, overflow } = useOverflowDetector()
  const playingVideo = useNcoState('playingVideo')

  return (
    <div className="border-foreground-200 border-b-1 px-2">
      <div className="flex h-9.25 items-center">
        <span className="truncate break-all text-tiny" ref={ref}>
          {playingVideo ? (
            <span
              className="font-semibold"
              title={overflow ? playingVideo.name : undefined}
            >
              {playingVideo.name}
            </span>
          ) : (
            <span className="text-foreground-500 dark:text-foreground-600">
              動画ファイルを選択してください
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
