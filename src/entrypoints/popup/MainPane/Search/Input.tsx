import { useEffect, useState } from 'react'
import { Button, Input, cn } from '@nextui-org/react'
import { SearchIcon, ChevronDownIcon } from 'lucide-react'

import { ncoState } from '@/hooks/useNco'

import { Options } from './Options'

export type SearchInputProps = {
  isDisabled: boolean
  onSearch: (value: string) => void
}

export const SearchInput: React.FC<SearchInputProps> = ({
  isDisabled,
  onSearch,
}) => {
  const [tmpValue, setTmpValue] = useState('')
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  useEffect(() => {
    ncoState?.get('info').then((info) => {
      setTmpValue(info?.rawText ?? tmpValue)
    })
  }, [])

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-1">
        <div className="flex w-full flex-row">
          <Input
            classNames={{
              inputWrapper: [
                'border-1 border-divider shadow-none',
                'rounded-r-none',
              ],
              input: 'pr-5',
              clearButton: 'end-1 mr-0 p-1',
            }}
            size="sm"
            isClearable
            isDisabled={isDisabled}
            placeholder="キーワード / 動画ID / URL"
            value={tmpValue}
            onValueChange={setTmpValue}
          />

          <Button
            className="rounded-l-none"
            size="sm"
            variant="solid"
            color="primary"
            isIconOnly
            isDisabled={!tmpValue.trim() || isDisabled}
            startContent={<SearchIcon className="size-4" />}
            onPress={() => onSearch(tmpValue.trim())}
          />
        </div>

        <Button
          className="min-w-6 shrink-0 p-0"
          size="sm"
          variant="light"
          disableRipple
          startContent={
            <ChevronDownIcon
              className={cn(
                'size-4',
                'transition-transform',
                'rotate-0 data-[open=true]:rotate-180'
              )}
              data-open={isOptionsOpen}
            />
          }
          onPress={() => setIsOptionsOpen((v) => !v)}
        />
      </div>

      <Options isOpen={isOptionsOpen} isDisabled={isDisabled} />
    </div>
  )
}
