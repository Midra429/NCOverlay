import { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { Button, Input, cn } from '@nextui-org/react'
import { Table2Icon, SearchIcon, ChevronDownIcon } from 'lucide-react'
import { SiNiconico } from '@icons-pack/react-simple-icons'

import { ncoState } from '@/hooks/useNco'

import { Select, SelectItem } from '@/components/Select'

import { NiconicoOptions } from './NiconicoOptions'

export type SearchSource = 'niconico' | 'syobocal'

export type SearchInputHandle = {
  setSource: (source: SearchSource) => void
  setValue: (value: string) => void
}

export type SearchInputProps = {
  isDisabled: boolean
  onSearch: (change: { source: SearchSource; value: string }) => void
}

export const SearchInput = forwardRef<SearchInputHandle, SearchInputProps>(
  ({ isDisabled, onSearch }, ref) => {
    const [source, setSource] = useState<SearchSource>('niconico')
    const [value, setValue] = useState('')
    const [isNiconicoOptionsOpen, setIsNiconicoOptionsOpen] = useState(false)

    const isNiconico = source === 'niconico'
    const isSyobocal = source === 'syobocal'

    useEffect(() => {
      ncoState?.get('info').then((info) => {
        if (!info) return

        let initValue: string | undefined

        if (isNiconico) {
          initValue = info.rawText
        } else if (isSyobocal) {
          initValue = info.workTitle ?? info.title ?? info.rawText
        }

        if (initValue) {
          setValue(initValue)
        }
      })
    }, [source])

    useImperativeHandle(ref, () => {
      return { setSource, setValue }
    }, [])

    return (
      <div className="flex flex-col">
        <div className="flex flex-row gap-1">
          <div className="flex w-full flex-row">
            <Select
              classNames={{
                base: 'w-9 min-w-9 max-w-9',
                label: 'hidden',
                trigger: 'block rounded-r-none px-0 [&>svg]:hidden',
                innerWrapper: 'w-full',
                popoverContent: 'w-56',
              }}
              size="sm"
              label="検索対象"
              labelPlacement="outside-left"
              selectedKeys={[source]}
              renderValue={([{ props }]) => props?.startContent}
              onSelectionChange={([key]) => {
                setSource((key as SearchSource) || 'niconico')
                setIsNiconicoOptionsOpen(false)
              }}
            >
              <SelectItem
                key="niconico"
                startContent={<SiNiconico className="size-4" />}
              >
                ニコニコ動画
              </SelectItem>
              <SelectItem
                key="syobocal"
                startContent={<Table2Icon className="size-4" />}
              >
                しょぼいカレンダー
              </SelectItem>
            </Select>

            <Input
              classNames={{
                label: 'hidden',
                mainWrapper: 'w-full',
                inputWrapper: [
                  'border-1 border-x-0 border-divider',
                  'shadow-none',
                ],
                input: 'pr-5',
                clearButton: 'end-1 mr-0 p-1',
              }}
              radius="none"
              size="sm"
              label="検索欄"
              labelPlacement="outside-left"
              isClearable
              isDisabled={isDisabled}
              placeholder={
                (isNiconico && 'キーワード / 動画ID / URL') ||
                (isSyobocal && '番組名 / タイトルID / URL') ||
                undefined
              }
              value={value}
              onValueChange={setValue}
            />

            <Button
              className="rounded-l-none"
              size="sm"
              variant="solid"
              color="primary"
              isIconOnly
              isDisabled={!value.trim() || isDisabled}
              onPress={() => {
                onSearch({
                  source,
                  value: value.trim(),
                })
              }}
            >
              <SearchIcon className="size-4" />
            </Button>
          </div>

          {isNiconico && (
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
                  data-open={isNiconicoOptionsOpen}
                />
              }
              onPress={() => setIsNiconicoOptionsOpen((v) => !v)}
            />
          )}
        </div>

        {isNiconico && (
          <NiconicoOptions
            isOpen={isNiconicoOptionsOpen}
            isDisabled={isDisabled}
          />
        )}
      </div>
    )
  }
)
