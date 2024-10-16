import type { SearchNiconicoOptions } from '@/utils/api/searchNiconico'
import type { StateSlotDetail } from '@/ncoverlay/state'
import type { SearchSource, SearchInputHandle } from './Input'
import type { ScTitleItem } from './SyobocalResults/TitleItem'

import { memo, useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { Spinner, cn } from '@nextui-org/react'

import { extractVideoId } from '@/utils/api/extractVideoId'
import { extractSyobocalId } from '@/utils/api/extractSyobocalId'
import {
  searchNiconicoByIds,
  searchNiconicoByKeyword,
} from '@/utils/api/searchNiconico'
import {
  searchSyobocalByIds,
  searchSyobocalByKeyword,
} from '@/utils/api/searchSyobocal'
import { useSettings } from '@/hooks/useSettings'
import { useNcoState } from '@/hooks/useNco'

import { SearchInput } from './Input'
import { NiconicoResults } from './NiconicoResults'
import { SyobocalResults } from './SyobocalResults'
import { Pagination } from './Pagination'

export const Search: React.FC = memo(() => {
  const inputRef = useRef<SearchInputHandle>(null)

  const [inputSource, setInputSource] = useState<SearchSource>()
  const [inputValue, setInputValue] = useState<string>()

  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [niconicoItems, setNiconicoItems] = useState<StateSlotDetail[]>([])
  const [syobocalItems, setSyobocalItems] = useState<ScTitleItem[]>([])

  const stateStatus = useNcoState('status')

  const [sort] = useSettings('settings:search:sort')
  const [dateRange] = useSettings('settings:search:dateRange')
  const [genre] = useSettings('settings:search:genre')
  const [lengthRange] = useSettings('settings:search:lengthRange')

  const isReady = useMemo(() => {
    return !(stateStatus === 'searching' || stateStatus === 'loading')
  }, [stateStatus])

  const isNiconico = inputSource === 'niconico'
  const isSyobocal = inputSource === 'syobocal'

  const niconicoOptions = useMemo<SearchNiconicoOptions>(() => {
    return {
      sort,
      dateRange,
      genre,
      lengthRange,
    }
  }, [sort, dateRange, genre, lengthRange])

  const searchNiconico = useCallback(
    async (value: string, page: number, options: SearchNiconicoOptions) => {
      setIsLoading(true)

      setCurrentPage(page)
      setNiconicoItems([])
      setSyobocalItems([])

      const videoId = extractVideoId(value)

      const result = videoId
        ? await searchNiconicoByIds(videoId)
        : await searchNiconicoByKeyword(value, page, options)

      if (result) {
        setTotalCount(result.total)
        setNiconicoItems(result.details)
      } else {
        setTotalCount(0)
      }

      setIsLoading(false)
    },
    []
  )

  const searchSyobocal = useCallback(async (value: string) => {
    setIsLoading(true)

    setCurrentPage(1)
    setNiconicoItems([])
    setSyobocalItems([])

    const syobocalId = extractSyobocalId(value)

    const result = syobocalId
      ? await searchSyobocalByIds(syobocalId)
      : await searchSyobocalByKeyword(value)

    if (result) {
      setTotalCount(result.length)
      setSyobocalItems(result)
    } else {
      setTotalCount(0)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isNiconico || !inputValue) return

    inputRef.current?.setSource(inputSource)
    inputRef.current?.setValue(inputValue)

    if (!extractVideoId(inputValue)) {
      searchNiconico(inputValue, 1, niconicoOptions)
    }
  }, [niconicoOptions])

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex flex-col gap-2',
          'p-2',
          'bg-content1',
          'border-b-1 border-foreground-200'
        )}
      >
        <SearchInput
          isDisabled={!isReady || isLoading}
          onSearch={({ source, value }) => {
            setInputSource(source)
            setInputValue(value)

            if (source === 'niconico') {
              searchNiconico(value, 1, niconicoOptions)
            } else if (source === 'syobocal') {
              searchSyobocal(value)
            }
          }}
          ref={inputRef}
        />
      </div>

      <div className="relative h-full overflow-y-auto p-2">
        {isLoading ? (
          <div
            className={cn(
              'absolute inset-0 z-20',
              'flex size-full items-center justify-center'
            )}
          >
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          (isNiconico && <NiconicoResults details={niconicoItems} />) ||
          (isSyobocal && <SyobocalResults titles={syobocalItems} />)
        )}
      </div>

      <div
        className={cn(
          'border-t-1 border-foreground-200 bg-content1 p-2',
          isSyobocal && 'hidden'
        )}
      >
        <Pagination
          page={currentPage}
          total={totalCount}
          isDisabled={!isReady || isLoading}
          onPageChange={(page) => {
            if (!inputSource || !inputValue) return

            inputRef.current?.setSource(inputSource)
            inputRef.current?.setValue(inputValue)

            if (isNiconico) {
              searchNiconico(inputValue, page, niconicoOptions)
            }
          }}
        />
      </div>
    </div>
  )
})
