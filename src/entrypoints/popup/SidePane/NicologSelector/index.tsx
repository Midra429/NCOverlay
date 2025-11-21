import type { StateSlotDetailFile } from '@/ncoverlay/state'

import { useState } from 'react'
import { ChevronRightIcon, PlusIcon } from 'lucide-react'

import { getNicologComments } from '@/utils/api/nicolog/getNicologComments'
import { ncoState, useNcoState } from '@/hooks/useNco'

import { Modal } from '@/components/Modal'

import { Directories } from './Directories'
import { Files } from './Files'

export const NICO_LIVE_ANIME_ROOT = '/nico-live-anime'
export const IGNORE_NAME_SUFFIXES = [
  '_raw.xml',
  '振り返り上映会.xml',
  '一挙放送.xml',
]

function createSlotDetailFile(path: string): StateSlotDetailFile {
  return {
    type: 'file',
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

  const ids = stateSlotDetails?.map((v) => v.id)

  const slotDetail =
    directoryName &&
    fileName &&
    createSlotDetailFile(`${directoryName}/${fileName}`)

  async function onAdd() {
    if (!ncoState || !slotDetail) return

    await ncoState.add('slotDetails', {
      ...slotDetail,
      status: 'loading',
    })

    await ncoState.set('status', 'loading')

    const { id } = slotDetail

    const [comment] = await getNicologComments([
      `${NICO_LIVE_ANIME_ROOT}/${id}`,
    ])

    if (comment) {
      const { data, thread, kawaiiCount } = comment

      await ncoState.update('slotDetails', ['id'], {
        id,
        status: 'ready',
        info: {
          date: data.created,
          count: {
            comment: thread.commentCount,
            kawaii: kawaiiCount,
          },
        },
      })

      await ncoState.add('slots', {
        id,
        threads: [thread],
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
      isOkDisabled={!isReady || !slotDetail || ids?.includes(slotDetail.id)}
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
