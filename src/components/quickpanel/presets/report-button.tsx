import { useCallback } from 'react'
import { Button, cn } from '@nextui-org/react'
import { ClipboardPenIcon } from 'lucide-react'

import { getFormsUrl } from '@/utils/extension/getFormsUrl'
import { webext } from '@/utils/webext'

import { useNcoState } from '@/hooks/useNco'

export const ReportButton: React.FC = () => {
  const stateVod = useNcoState('vod')
  const stateInfo = useNcoState('info')

  const onPress = useCallback(async () => {
    const tab = await webext.getCurrentActiveTab()

    webext.tabs.create({
      url: await getFormsUrl({
        content: 'bug',
        vod: stateVod,
        info: stateInfo,
        url: stateVod && tab?.url,
      }),
    })
  }, [stateVod, stateInfo])

  return (
    <Button
      className={cn(
        'border-1 border-foreground-100',
        'bg-content1 text-foreground',
        'shadow-small'
      )}
      fullWidth
      startContent={<ClipboardPenIcon className="size-4" />}
      onPress={onPress}
    >
      不具合報告
    </Button>
  )
}
