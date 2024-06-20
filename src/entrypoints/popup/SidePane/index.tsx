import { memo } from 'react'

import { VideoItem } from './VideoItem'
import { useNcoStateJson } from '@/hooks/useNcoState'

/**
 * サイド
 */
export const SidePane: React.FC = memo(() => {
  const [ncoStateJson] = useNcoStateJson()

  return (
    <div className="h-full w-full overflow-y-auto p-2">
      <div className="flex flex-col gap-2">
        {ncoStateJson?.slots?.length ? (
          ncoStateJson.slots.map((slot) => (
            <VideoItem key={slot.id} slot={slot} />
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  )
})
