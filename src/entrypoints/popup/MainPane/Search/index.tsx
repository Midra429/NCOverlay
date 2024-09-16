import type { StateSlotDetail } from '@/ncoverlay/state'

import { memo, useMemo, useState, useCallback } from 'react'
import { Spinner, cn } from '@nextui-org/react'
import { ncoApi } from '@midra/nco-api'
import { DANIME_CHANNEL_ID } from '@midra/nco-api/constants'

import { extractVideoId } from '@/utils/api/extractVideoId'

import { useNcoState } from '@/hooks/useNco'

import { SearchInput } from './Input'
import { Results } from './Results'
import { Pagination } from './Pagination'

type SearchResult = {
  total: number
  details: StateSlotDetail[]
}

const searchByVideoId = async (
  videoId: string
): Promise<SearchResult | null> => {
  const data = await ncoApi.niconico.video(videoId)

  if (data) {
    const isDAnime = data.channel?.id === `ch${DANIME_CHANNEL_ID}`
    const isOfficialAnime = !!data.channel?.isOfficialAnime

    const total = 1
    const details: StateSlotDetail[] = [
      {
        type:
          (isDAnime && 'danime') || (isOfficialAnime && 'official') || 'normal',
        id: videoId,
        status: 'pending',
        info: {
          id: videoId,
          title: data.video.title,
          duration: data.video.duration,
          date: new Date(data.video.registeredAt).getTime(),
          tags: data.tag.items.map((v) => v.name),
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
    ]

    return { total, details }
  }

  return null
}

const searchByKeyword = async (
  keyword: string,
  page: number
): Promise<SearchResult | null> => {
  const limit = 20
  const offset = limit * (page - 1)

  const response = await ncoApi.niconico.search({
    q: keyword,
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
      'categoryTags',
      'tags',
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
    const total = Math.ceil(response.meta.totalCount / 20)
    const details: StateSlotDetail[] = response.data.map((value) => {
      const isDAnime = value.channelId === DANIME_CHANNEL_ID
      const isOfficialAnime = !!(
        value.channelId &&
        value.categoryTags &&
        /(^|\s)アニメ(\s|$)/.test(value.categoryTags)
      )

      return {
        type:
          (isDAnime && 'danime') || (isOfficialAnime && 'official') || 'normal',
        id: value.contentId,
        status: 'pending',
        info: {
          id: value.contentId,
          title: value.title,
          duration: value.lengthSeconds,
          date: new Date(value.startTime).getTime(),
          tags: value.tags?.split(' ') ?? [],
          count: {
            view: value.viewCounter,
            comment: value.commentCounter,
          },
          thumbnail: value.thumbnailUrl,
        },
      }
    })

    return { total, details }
  }

  return null
}

export const Search: React.FC = memo(() => {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [slotDetails, setSlotDetails] = useState<StateSlotDetail[]>([])

  const stateStatus = useNcoState('status')

  const isReady = useMemo(() => {
    return !(stateStatus === 'searching' || stateStatus === 'loading')
  }, [stateStatus])

  const search = useCallback(async (value: string, page: number) => {
    setIsLoading(true)

    setCurrentPage(page)
    setSlotDetails([])

    const videoId = extractVideoId(value)

    const result = videoId
      ? await searchByVideoId(videoId)
      : await searchByKeyword(value, page)

    if (result) {
      setTotalCount(result.total)
      setSlotDetails(result.details)
    } else {
      setTotalCount(0)
    }

    setIsLoading(false)
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
          isDisabled={!isReady || isLoading}
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
          <Results items={slotDetails} />
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
