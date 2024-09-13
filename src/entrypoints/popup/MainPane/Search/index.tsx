import type { StateSlotDetail } from '@/ncoverlay/state'

import { memo, useMemo, useState, useCallback } from 'react'
import { cn, Spinner } from '@nextui-org/react'
import { ncoApi } from '@midra/nco-api'
import { DANIME_CHANNEL_ID } from '@midra/nco-api/constants'

import { extractVideoId } from '@/utils/api/extractVideoId'

import { useNcoState } from '@/hooks/useNco'

import { SearchInput } from './Input'
import { Results } from './Results'
import { Pagination } from './Pagination'

export const Search: React.FC = memo(() => {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchResults, setSearchResults] = useState<StateSlotDetail[]>([])

  const stateStatus = useNcoState('status')

  const isReady = useMemo(() => {
    return !(stateStatus === 'searching' || stateStatus === 'loading')
  }, [stateStatus])

  const search = useCallback(async (value: string, page: number) => {
    setIsLoading(true)
    setCurrentPage(page)
    setSearchResults([])

    const videoId = extractVideoId(value)

    if (videoId) {
      const data = await ncoApi.niconico.video(videoId)

      if (data) {
        setTotalCount(1)
        setSearchResults([
          {
            type:
              data.channel?.id === `ch${DANIME_CHANNEL_ID}`
                ? 'danime'
                : 'normal',
            id: videoId,
            status: 'pending',
            info: {
              id: videoId,
              title: data.video.title,
              duration: data.video.duration,
              date: new Date(data.video.registeredAt).getTime(),
              count: {
                view: data.video.count.view,
                comment: data.video.count.comment,
              },
              thumbnail:
                data.video.thumbnail.largeUrl ||
                data.video.thumbnail.middleUrl ||
                data.video.thumbnail.url,
            },
          },
        ])
      } else {
        setTotalCount(0)
      }
    } else {
      const limit = 20
      const offset = limit * (page - 1)

      const response = await ncoApi.niconico.search({
        q: value,
        targets: ['title', 'description'],
        fields: [
          'contentId',
          'title',
          'channelId',
          'viewCounter',
          'lengthSeconds',
          'thumbnailUrl',
          'startTime',
          'commentCounter',
        ],
        filters: {
          'genre.keyword': ['アニメ'],
          'commentCounter': { gt: 0 },
        },
        _sort: '-startTime',
        _offset: offset,
        _limit: limit,
        _context: EXT_USER_AGENT,
      })

      if (response) {
        setTotalCount(Math.ceil(response.meta.totalCount / 20))
        setSearchResults(
          response.data.map((value) => ({
            type: value.channelId === DANIME_CHANNEL_ID ? 'danime' : 'normal',
            id: value.contentId,
            status: 'pending',
            info: {
              id: value.contentId,
              title: value.title,
              duration: value.lengthSeconds,
              date: new Date(value.startTime).getTime(),
              count: {
                view: value.viewCounter,
                comment: value.commentCounter,
              },
              thumbnail: value.thumbnailUrl,
            },
          }))
        )
      } else {
        setTotalCount(0)
      }
    }

    setTimeout(() => {
      setIsLoading(false)
    }, 250)
  }, [])

  return (
    <div className={cn('flex flex-col', 'h-full')}>
      <div
        className={cn(
          'flex flex-col gap-2',
          'p-2',
          'bg-content1',
          'border-b-1 border-divider'
        )}
      >
        <SearchInput
          isLoading={isLoading}
          isDisabled={!isReady}
          onSearch={(value) => {
            setInputValue(value)
            search(value, 1)
          }}
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
          <Results items={searchResults} />
        )}
      </div>

      <div className={cn('p-2', 'bg-content1', 'border-t-1 border-divider')}>
        <Pagination
          page={currentPage}
          total={totalCount}
          isDisabled={!isReady || isLoading}
          onPageChange={(page) => {
            search(inputValue, page)
          }}
        />
      </div>
    </div>
  )
})
