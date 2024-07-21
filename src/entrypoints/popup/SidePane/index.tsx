import type { Slot } from '@/ncoverlay/state'

import { memo, useCallback } from 'react'
import { Button, Spinner, cn } from '@nextui-org/react'
import { ClipboardPenIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { getFormsUrl } from '@/utils/extension/getFormsUrl'

import { useNcoStateJson } from '@/hooks/useNcoState'

import { SlotItem } from './SlotItem'

const SlotItems: React.FC<{ slots: Slot[] }> = ({ slots }) => {
  return (
    <div className="flex flex-col gap-2">
      {slots.map((slot) => (
        <SlotItem key={slot.id} slot={slot} />
      ))}
    </div>
  )
}

const SlotItemsEmpty: React.FC = () => {
  const ncoStateJson = useNcoStateJson('vod', 'title')

  const onPress = useCallback(async () => {
    const tab = await webext.getCurrentActiveTab()

    webext.tabs.create({
      url: await getFormsUrl({
        content: 'bug',
        vod: ncoStateJson?.vod,
        title: ncoStateJson?.title,
        url: ncoStateJson && tab?.url,
      }),
    })
  }, [ncoStateJson])

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
  const ncoStateJson = useNcoStateJson('status')

  if (ncoStateJson?.status === 'searching') {
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
  const ncoStateJson = useNcoStateJson('slots')

  return (
    <div className="relative h-full w-full overflow-y-auto p-2">
      {ncoStateJson?.slots?.length ? (
        <SlotItems slots={ncoStateJson.slots} />
      ) : (
        <StatusOverlay />
      )}
    </div>
  )
})
