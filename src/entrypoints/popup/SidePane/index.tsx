import type { StateSlotDetail } from '@/ncoverlay/state'

import { memo, useCallback } from 'react'
import { Button, Spinner, cn } from '@nextui-org/react'
import { ClipboardPenIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { getFormsUrl } from '@/utils/extension/getFormsUrl'

import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from './SlotItem'

const SlotItems: React.FC<{ details: StateSlotDetail[] }> = ({ details }) => {
  return (
    <div className="flex flex-col gap-2">
      {details.map((detail) => (
        <SlotItem key={detail.id} detail={detail} />
      ))}
    </div>
  )
}

const SlotItemsEmpty: React.FC = () => {
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
    <div
      className={cn(
        'absolute inset-0 z-20',
        'flex h-full w-full flex-col items-center justify-center gap-3'
      )}
    >
      <p className="text-small">コメントはありません</p>

      <Button
        className="h-7"
        size="sm"
        color="default"
        variant="flat"
        startContent={<ClipboardPenIcon className="size-4" />}
        onPress={onPress}
      >
        不具合報告
      </Button>
    </div>
  )
}

const StatusOverlay: React.FC = () => {
  const stateStatus = useNcoState('status')

  if (stateStatus === 'searching') {
    return (
      <div
        className={cn(
          'absolute inset-0 z-20',
          'flex h-full w-full flex-col items-center justify-center gap-3'
        )}
      >
        <Spinner size="lg" color="primary" />

        <p className="text-small">検索中...</p>
      </div>
    )
  }

  return <SlotItemsEmpty />
}

/**
 * サイド
 */
export const SidePane: React.FC = memo(() => {
  const stateSlotDetails = useNcoState('slotDetails')

  return (
    <div className="relative h-full w-full overflow-y-auto p-2">
      {stateSlotDetails?.length ? (
        <SlotItems details={stateSlotDetails} />
      ) : (
        <StatusOverlay />
      )}
    </div>
  )
})
