import { useSettings } from '@/hooks/useSettings'

import { PositionControl } from '@/components/PositionControl'

export function Footer() {
  const [showPositionControl] = useSettings(
    'settings:commentList:showPositionControl'
  )

  return (
    <div className="ml-auto max-w-112.5">
      {showPositionControl && <PositionControl />}
    </div>
  )
}
