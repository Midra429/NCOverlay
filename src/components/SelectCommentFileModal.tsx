import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { ModalProps } from '@/components/Modal'
import type { StateSlotDetailFile } from '@/ncoverlay/state'

import { useRef, useState } from 'react'
import { Button, Textarea, addToast } from '@heroui/react'
import { ChevronRightIcon, FileInputIcon, PlusIcon } from 'lucide-react'
import {
  legacyJsonToV1Threads,
  parseLegacyJson,
} from '@midra/nco-utils/api/utils/niconico/legacy/json'
import {
  legacyXmlToV1Threads,
  parseLegacyXml,
} from '@midra/nco-utils/api/utils/niconico/legacy/xml'
import { parseV1Threads } from '@midra/nco-utils/api/utils/niconico/v1/threads'

import { KAWAII_REGEXP } from '@/constants'
import { validateJsonString } from '@/utils/validateJsonString'
import { ncoState, useNcoState } from '@/hooks/useNco'

import { Modal } from './Modal'
import { SlotItem } from './SlotItem'

function createSlotDetailFile(
  file: File,
  threads: V1Thread[]
): StateSlotDetailFile {
  const commentCount = threads.reduce(
    (prev, thread) => prev + thread.commentCount,
    0
  )
  const kawaiiCount = threads
    .map((thread) => {
      return thread.comments.filter((cmt) => {
        return KAWAII_REGEXP.test(cmt.body)
      }).length
    })
    .reduce((prev, current) => prev + current, 0)

  return {
    type: 'file',
    id: `local:${file.name}`,
    status: 'pending',
    info: {
      id: null,
      source: null,
      title: file.name,
      duration: null,
      date: file.lastModified,
      count: {
        comment: commentCount,
        kawaii: kawaiiCount,
      },
    },
  }
}

export interface SelectCommentFileModalProps
  extends Omit<ModalProps, 'children'> {}

export function SelectCommentFileModal(props: SelectCommentFileModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [threads, setThreads] = useState<V1Thread[] | null>(null)

  const stateStatus = useNcoState('status')
  const stateSlotDetails = useNcoState('slotDetails')

  const isReady = !(stateStatus === 'searching' || stateStatus === 'loading')
  const ids = stateSlotDetails?.map((v) => v.id) ?? []

  const slotDetail = file && threads && createSlotDetailFile(file, threads)

  const isOkDisabled = !isReady || !slotDetail || ids.includes(slotDetail.id)

  function reset() {
    setFile(null)
    setText('')
    setThreads(null)
  }

  async function onChange({ target }: React.ChangeEvent<HTMLInputElement>) {
    const file = target.files?.[0] ?? null
    const text = (await file?.text()) ?? ''

    setFile(file)
    setText(text)

    try {
      switch (file?.type) {
        case 'application/json':
          // v1
          if (validateJsonString(text, { object: true })) {
            const json = parseV1Threads(text)
            const { threads } = json.data

            setThreads(threads)
          }
          // legacy
          else {
            const json = parseLegacyJson(text)
            const threads = legacyJsonToV1Threads(json)

            setThreads(threads)
          }

          break

        case 'application/xml':
        case 'text/xml':
          const xml = parseLegacyXml(text)
          const threads = legacyXmlToV1Threads(xml)

          setThreads(threads)

          break
      }
    } catch {
      addToast({
        color: 'danger',
        title: 'ファイルの解析に失敗しました',
      })

      setThreads(null)
    }
  }

  async function onAdd() {
    if (!ncoState || !slotDetail) return

    await ncoState.set('status', 'loading')

    await ncoState.add('slotDetails', {
      ...slotDetail,
      status: 'ready',
    })
    await ncoState.add('slots', {
      id: slotDetail.id,
      threads,
    })

    await ncoState.set('status', 'ready')
  }

  function onClose() {
    reset()
    props.onClose?.()
  }

  return (
    <Modal
      {...props}
      okText="追加"
      okIcon={<PlusIcon className="size-4" />}
      onOk={onAdd}
      isOkDisabled={isOkDisabled}
      onClose={onClose}
      header={
        <div className="flex flex-row items-center gap-0.5">
          <span>追加</span>
          <ChevronRightIcon className="size-5 opacity-50" />
          <span>ローカルファイル</span>
        </div>
      }
      footerStartContent={
        <>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<FileInputIcon className="size-4" />}
            onPress={() => inputRef.current?.click()}
          >
            選択
          </Button>
        </>
      }
    >
      <input
        type="file"
        accept="application/json, application/xml, text/xml"
        hidden
        onChange={onChange}
        ref={inputRef}
      />

      <div className="flex size-full flex-col gap-2 bg-content1 p-2">
        <Textarea
          classNames={{
            base: 'size-full',
            label: 'hidden',
            inputWrapper: [
              'h-full! w-full! overflow-hidden p-0',
              'border-1 border-divider shadow-none',
            ],
            input: [
              'size-full px-3 py-2',
              'font-mono text-tiny',
              'cursor-pointer',
            ],
          }}
          disableAutosize
          isReadOnly
          label="入力"
          labelPlacement="outside"
          value={text}
          onClick={() => inputRef.current?.click()}
        />

        {slotDetail && (
          <div className="shrink-0">
            <SlotItem
              detail={slotDetail}
              isSearch
              isDisabled={isOkDisabled}
              onAdd={() => onAdd().then(reset)}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
