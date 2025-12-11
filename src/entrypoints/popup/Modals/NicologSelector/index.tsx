import type { StateSlotDetailNicolog } from '@/ncoverlay/state'

import { useState } from 'react'
import { ChevronRightIcon, PlusIcon } from 'lucide-react'
import { NICO_LIVE_ANIME_ROOT } from '@midra/nco-utils/api/services/nicolog'

import { getNicologComment } from '@/utils/api/nicolog/getNicologComment'
import { ncoState, useNcoState } from '@/hooks/useNco'

import { Modal } from '@/components/Modal'

import { Directories } from './Directories'
import { Files } from './Files'

function createSlotDetailFile(path: string): StateSlotDetailNicolog {
  return {
    type: 'nicolog',
    id: path,
    status: 'pending',
    info: {
      id: path,
      source: 'nicolog',
      title: path.split('/').at(-1)!,
      duration: null,
      date: 0,
      count: {
        comment: 0,
      },
    },
  }
}

export interface NicologSelectorProps {
  isOpen: boolean
  onOpenChange: () => void
}

export function NicologSelector({
  isOpen,
  onOpenChange,
}: NicologSelectorProps) {
  const [directoryName, setDirectoryName] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const stateStatus = useNcoState('status')
  const stateSlotDetails = useNcoState('slotDetails')

  const isReady = !(stateStatus === 'searching' || stateStatus === 'loading')
  const ids = stateSlotDetails?.map((v) => v.id) ?? []

  const slotDetail =
    directoryName &&
    fileName &&
    createSlotDetailFile(`${directoryName}/${fileName}`)

  async function onAdd() {
    if (!ncoState || !slotDetail) return

    await ncoState.set('status', 'loading')

    await ncoState.add('slotDetails', {
      ...slotDetail,
      status: 'loading',
    })

    const { id } = slotDetail

    const comment = await getNicologComment(`${NICO_LIVE_ANIME_ROOT}/${id}`)

    if (comment) {
      const { detail, threads, commentCount, kawaiiCount } = comment

      await ncoState.update('slotDetails', ['id'], {
        id,
        status: 'ready',
        info: {
          date: detail.created,
          count: {
            comment: commentCount,
            kawaii: kawaiiCount,
          },
        },
      })

      await ncoState.add('slots', {
        id,
        threads,
      })
    } else {
      await ncoState.update('slotDetails', ['id'], {
        id,
        status: 'error',
      })
    }

    await ncoState.set('status', 'ready')
  }

  return (
    <Modal
      fullWidth
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      okText="追加"
      okIcon={<PlusIcon className="size-4" />}
      isOkDisabled={!isReady || !slotDetail || ids.includes(slotDetail.id)}
      onOk={onAdd}
      header={
        <div className="flex flex-row items-center gap-0.5">
          <span>追加</span>
          <ChevronRightIcon className="size-5 opacity-50" />
          <span>nicolog (ニコニコ生放送のアニメコメントアーカイブ)</span>
        </div>
      }
    >
      <div className="flex flex-row overflow-hidden">
        <Directories
          directoryName={directoryName}
          setDirectoryName={setDirectoryName}
        />
        <Files
          directoryName={directoryName}
          disabledIds={ids}
          setFileName={setFileName}
        />
      </div>
    </Modal>
  )
}
