import { TvMinimalPlayIcon } from 'lucide-react'

import { webext } from '@/utils/webext'

import { IconLink } from '@/components/IconLink'

const playerUrl = webext.runtime.getURL('/player.html')

export function PlayerButton() {
  return (
    <IconLink
      Icon={TvMinimalPlayIcon}
      title="動画プレイヤー"
      href={playerUrl}
    />
  )
}
