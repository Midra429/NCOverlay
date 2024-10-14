import type { ScTitleItem } from './TitleItem'
import type { TitleDetailHandle } from './TitleDetail'

import { useState, useRef } from 'react'
import { useDisclosure } from '@nextui-org/react'

import { TitleItem } from './TitleItem'
import { TitleDetail } from './TitleDetail'

export type SyobocalResultsProps = {
  titles: ScTitleItem[]
}

export const SyobocalResults: React.FC<SyobocalResultsProps> = ({ titles }) => {
  const detailRef = useRef<TitleDetailHandle>(null)

  const [selectedTitle, setSelectedTitle] = useState<ScTitleItem>()
  const disclosure = useDisclosure()

  return (
    <>
      <div className="flex flex-col gap-2">
        {titles.map((title) => (
          <TitleItem
            key={title.TID}
            item={title}
            onPress={() => {
              setSelectedTitle(title)

              disclosure.onOpen()

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
          isOpen={disclosure.isOpen}
          onOpenChange={disclosure.onOpenChange}
          ref={detailRef}
        />
      )}
    </>
  )
}
