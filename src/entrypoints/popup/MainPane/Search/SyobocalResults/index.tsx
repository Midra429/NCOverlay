import type { ScTitleItem } from './TitleItem'
import type { TitleDetailHandle } from './TitleDetail'

import { useState, useRef } from 'react'
import { useDisclosure } from '@heroui/react'

import { TitleItem } from './TitleItem'
import { TitleDetail } from './TitleDetail'

export interface SyobocalResultsProps {
  titles: ScTitleItem[]
}

export function SyobocalResults({ titles }: SyobocalResultsProps) {
  const detailRef = useRef<TitleDetailHandle>(null)

  const [selectedTitle, setSelectedTitle] = useState<ScTitleItem>()

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <div className="flex flex-col gap-2">
        {titles.map((title) => (
          <TitleItem
            key={title.TID}
            item={title}
            onClick={() => {
              setSelectedTitle(title)

              onOpen()

              setTimeout(() => {
                detailRef.current?.initialize()
              })
            }}
          />
        ))}
      </div>

      {selectedTitle && (
        <TitleDetail
          title={selectedTitle}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          ref={detailRef}
        />
      )}
    </>
  )
}
