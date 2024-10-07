import { useEffect, useState } from 'react'
import { Button, Input, cn } from '@nextui-org/react'
import { TvMinimalIcon, SearchIcon, ChevronDownIcon } from 'lucide-react'
import { SiNiconico } from '@icons-pack/react-simple-icons'

import { ncoState } from '@/hooks/useNco'

import { Select, SelectItem } from '@/components/select'

import { Options } from './Options'

export type SearchInputProps = {
  isDisabled: boolean
  onSearch: (value: string) => void
}

export const SearchInput: React.FC<SearchInputProps> = ({
  isDisabled,
  onSearch,
}) => {
  const [source, setSource] = useState<'niconico' | 'syobocal'>('niconico')
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
          <Select
            classNames={{
              base: 'w-10',
              trigger: 'block rounded-r-none px-0 [&>svg]:hidden',
              innerWrapper: 'w-full',
              popoverContent: 'w-56',
            }}
            size="sm"
            defaultSelectedKeys={['niconico']}
            selectedKeys={[source]}
            disabledKeys={['syobocal']}
            renderValue={([{ props }]) => props?.startContent}
            onSelectionChange={([key]) => setSource((key as any) || 'niconico')}
          >
            <SelectItem
              key="niconico"
              variant="flat"
              startContent={<SiNiconico className="size-4" />}
            >
              ニコニコ動画
            </SelectItem>
            <SelectItem
              key="syobocal"
              variant="flat"
              startContent={<TvMinimalIcon className="size-4" />}
            >
              しょぼいカレンダー
            </SelectItem>
          </Select>

          <Input
            classNames={{
              inputWrapper: [
                'border-1 border-divider shadow-none',
                'border-x-0',
              ],
              input: 'pr-5',
              clearButton: 'end-1 mr-0 p-1',
            }}
            radius="none"
            size="sm"
            isClearable
            isDisabled={isDisabled}
            placeholder={
              (source === 'niconico' && 'キーワード / 動画ID / URL') ||
              (source === 'syobocal' && '番組名 / タイトルID / URL') ||
              undefined
            }
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
                'rotate-0 data-[open=true]:rotate-180',
                'transition-transform'
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
