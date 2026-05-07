import { TvMinimalPlayIcon } from 'lucide-react'

import { webext } from '@/utils/webext'

import { IconLink } from '@/components/IconLink'

export function PlayerButton() {
  function onPress() {
    webext.tabs.create({
      url: webext.runtime.getURL('/player.html'),
    })
  }

  return (
    <IconLink
      Icon={TvMinimalPlayIcon}
      title="動画プレイヤー"
      onPress={onPress}
    />
  )
}
