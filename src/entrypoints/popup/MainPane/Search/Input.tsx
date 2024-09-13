import { useEffect, useState } from 'react'
import { Button, Input } from '@nextui-org/react'
import { SearchIcon } from 'lucide-react'

import { ncoState } from '@/hooks/useNco'

export type SearchInputProps = {
  isLoading: boolean
  isDisabled: boolean
  onSearch: (value: string) => void
}

export const SearchInput: React.FC<SearchInputProps> = ({
  isLoading,
  isDisabled,
  onSearch,
}) => {
  const [tmpValue, setTmpValue] = useState('')

  useEffect(() => {
    ncoState?.get('info').then((info) => {
      setTmpValue(info?.rawText ?? tmpValue)
    })
  }, [])

  return (
    <div className="flex flex-row items-center gap-2">
      <Input
        classNames={{
          inputWrapper: 'border-1 border-divider shadow-none',
        }}
        size="sm"
        isClearable
        isDisabled={isLoading || isDisabled}
        placeholder="キーワード / 動画ID / URL"
        value={tmpValue}
        onValueChange={setTmpValue}
      />

      <Button
        size="sm"
        variant="solid"
        color="primary"
        isIconOnly
        isDisabled={!tmpValue.trim() || isDisabled}
        isLoading={isLoading}
        startContent={!isLoading && <SearchIcon className="size-4" />}
        onPress={() => onSearch(tmpValue.trim())}
      />
    </div>
  )
}
