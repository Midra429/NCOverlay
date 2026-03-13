import type { ProgramItemsHandle } from './ProgramItems'
import type { SubtitleItemsHandle } from './SubtitleItems'
import type { ScTitleItem } from './TitleItem'

import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Tab, Tabs } from '@heroui/react'

import { Modal } from '@/components/Modal'

import { ProgramItems } from './ProgramItems'
import { SubtitleItems } from './SubtitleItems'
import { TitleItemInner } from './TitleItem'

export interface TitleDetailHandle {
  initialize: () => void
}

export interface TitleDetailProps {
  title: ScTitleItem
  isOpen: boolean
  onOpenChange: () => void
  ref: React.Ref<TitleDetailHandle>
}

export function TitleDetail({
  title,
  isOpen,
  onOpenChange,
  ref,
}: TitleDetailProps) {
  const subtitlesRef = useRef<SubtitleItemsHandle>(null)
  const programsRef = useRef<ProgramItemsHandle>(null)

  const [selectedKey, setSelectedKey] = useState('subtitles')

  async function initialize(key?: string) {
    switch (key ?? selectedKey) {
      case 'subtitles':
        subtitlesRef.current?.initialize()
        break

      case 'programs':
        programsRef.current?.initialize()
        break
    }
  }

  useEffect(() => {
    setSelectedKey(title.Cat === '8' ? 'programs' : 'subtitles')
  }, [title.Cat])

  useImperativeHandle(ref, () => {
    return { initialize }
  }, [initialize])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      cancelText="閉じる"
      header={<TitleItemInner item={title} isHeader />}
    >
      <Tabs
        classNames={{
          base: 'border-foreground-200 border-b-1 bg-content1',
          tabList: 'p-0',
          tab: 'h-10 p-0',
          panel: 'h-full overflow-y-auto overflow-x-hidden bg-content1 p-0',
        }}
        variant="underlined"
        color="primary"
        fullWidth
        destroyInactiveTabPanel={false}
        selectedKey={selectedKey}
        onSelectionChange={(key) => {
          initialize(key as string)
          setSelectedKey(key as string)
        }}
      >
        <Tab key="subtitles" title="サブタイトル">
          <SubtitleItems title={title} ref={subtitlesRef} />
        </Tab>

        <Tab key="programs" title="放送時間">
          <ProgramItems title={title} ref={programsRef} />
        </Tab>
      </Tabs>
    </Modal>
  )
}
