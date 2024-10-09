import type { SearchQuerySort } from '@midra/nco-api/types/niconico/search'
import type { StateSlotDetail } from '@/ncoverlay/state'

import { memo, useMemo, useState, useCallback, useEffect } from 'react'
import { Spinner, cn } from '@nextui-org/react'
import { ncoApi } from '@midra/nco-api'
import { DANIME_CHANNEL_ID } from '@midra/nco-api/constants'

import { extractVideoId } from '@/utils/api/extractVideoId'

import { useSettings } from '@/hooks/useSettings'
import { useNcoState } from '@/hooks/useNco'

import { SearchInput } from './Input'
import { Results } from './Results'
import { Pagination } from './Pagination'

type SearchResult = {
  total: number
  details: StateSlotDetail[]
}

const searchNiconicoById = async (
  contentId: string
): Promise<SearchResult | null> => {
  const data = await ncoApi.niconico.video(contentId)

  if (data) {
    const tags = data.tag.items.map((v) => v.name)

    const isDAnime = data.channel?.id === `ch${DANIME_CHANNEL_ID}`
    const isOfficialAnime = !!data.channel?.isOfficialAnime
    const isSzbh = !!(
      data.owner &&
      /(^|\s)(コメント専用動画|SZBH方式)(\s|$)/i.test(tags.join(' '))
    )

    const total = 1
    const details: StateSlotDetail[] = [
      {
        type:
          (isDAnime && 'danime') ||
          (isOfficialAnime && 'official') ||
          (isSzbh && 'szbh') ||
          'normal',
        id: contentId,
        status: 'pending',
        info: {
          id: contentId,
          title: data.video.title,
          duration: data.video.duration,
          date: new Date(data.video.registeredAt).getTime(),
          tags,
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

const searchNiconicoByKeyword = async (
  keyword: string,
  page: number,
  options?: {
    sort?: SearchQuerySort
    lengthRange?: [start: number | null, end: number | null]
  }
): Promise<SearchResult | null> => {
  const limit = 20
  const offset = limit * (page - 1)

  const response = await ncoApi.niconico.search({
    q: keyword,
    targets: ['title', 'description'],
    fields: [
      'contentId',
      'title',
      'userId',
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
      'lengthSeconds': options?.lengthRange
        ? {
            gte: options.lengthRange[0] ?? undefined,
            lte: options.lengthRange[1] ?? undefined,
          }
        : undefined,
    },
    _sort: options?.sort ?? '-startTime',
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
      const isSzbh = !!(
        value.userId &&
        value.tags &&
        /(^|\s)(コメント専用動画|SZBH方式)(\s|$)/i.test(value.tags)
      )

      return {
        type:
          (isDAnime && 'danime') ||
          (isOfficialAnime && 'official') ||
          (isSzbh && 'szbh') ||
          'normal',
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

  const [sort] = useSettings('settings:search:sort')
  const [lengthRange] = useSettings('settings:search:lengthRange')

  const stateStatus = useNcoState('status')

  const isReady = useMemo(() => {
    return !(stateStatus === 'searching' || stateStatus === 'loading')
  }, [stateStatus])

  const searchNiconico = useCallback(
    async (value: string, page: number) => {
      if (!value) return

      setIsLoading(true)

      setCurrentPage(page)
      setSlotDetails([])

      const videoId = extractVideoId(value)

      const result = videoId
        ? await searchNiconicoById(videoId)
        : await searchNiconicoByKeyword(value, page, {
            sort,
            lengthRange,
          })

      if (result) {
        setTotalCount(result.total)
        setSlotDetails(result.details)
      } else {
        setTotalCount(0)
      }

      setIsLoading(false)
    },
    [sort, lengthRange]
  )

  useEffect(() => {
    searchNiconico(inputValue, 1)
  }, [searchNiconico])

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
          onSearch={(value) => {
            setInputValue(value)
            searchNiconico(value, 1)
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

      <div className="border-t-1 border-foreground-200 bg-content1 p-2">
        <Pagination
          page={currentPage}
          total={totalCount}
          isDisabled={!isReady || isLoading}
          onPageChange={(page) => {
            searchNiconico(inputValue, page)
          }}
        />
      </div>
    </div>
  )
})
