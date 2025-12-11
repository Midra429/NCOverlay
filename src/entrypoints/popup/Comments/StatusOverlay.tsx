import { Spinner, cn } from '@heroui/react'

import { useNcoState } from '@/hooks/useNco'

export function StatusOverlay() {
  const stateStatus = useNcoState('status')

  return (
    <div
      className={cn(
        'absolute inset-0 z-20',
        'flex size-full flex-col items-center justify-center gap-3'
      )}
    >
      {stateStatus === 'searching' ? (
        <>
          <Spinner size="lg" color="primary" />

          <p className="text-small">検索中...</p>
        </>
      ) : (
        <span className="text-foreground-500 text-small">
          コメントはありません
        </span>
      )}
    </div>
  )
}
