import type { ScTitleItem } from './TitleItem'
import type { ScSubtitleItem, SubtitleItemHandle } from './SubtitleItem'

import {
  useMemo,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useRef,
} from 'react'
import { Spinner, cn } from '@nextui-org/react'
import { ncoApi } from '@midra/nco-api'

import { Modal } from '@/components/modal'

import { TitleItemInner } from './TitleItem'
import { SubtitleItem } from './SubtitleItem'
import { zeroPadding } from '@/utils/zeroPadding'

let controller: AbortController | undefined

export type TitleDetailHandle = {
  initialize: () => void
}

export type TitleDetailProps = {
  title: ScTitleItem
  isOpen: boolean
  onOpenChange: () => void
}

export const TitleDetail = forwardRef<TitleDetailHandle, TitleDetailProps>(
  ({ title, isOpen, onOpenChange }, ref) => {
    const subtitleItemRefs = useRef<{
      [index: number]: SubtitleItemHandle
    }>({})

    const [isLoading, setIsLoading] = useState(false)
    const [subtitles, setSubtitles] = useState<ScSubtitleItem[]>([])

    const subtitleItems = useMemo(() => {
      return subtitles.map((val, idx) => ({
        subtitle: val,
        refCallbackFunction: (handle: SubtitleItemHandle | null) => {
          if (handle && !subtitleItemRefs.current[idx]) {
            subtitleItemRefs.current[idx] = handle
          } else {
            delete subtitleItemRefs.current[idx]
          }
        },
      }))
    }, [subtitles])

    const macCountLength = useMemo(() => {
      return Math.max(...subtitles.map(([count]) => count.length), 2)
    }, [subtitles])

    const initialize = useCallback(() => {
      controller?.abort()

      setSubtitles([])
      setIsLoading(true)

      controller = new AbortController()

      const { signal } = controller

      new Promise<ScSubtitleItem[]>((resolve, reject) => {
        signal.addEventListener('abort', reject, { once: true })

        ncoApi.syobocal
          .json(['SubTitles'], {
            TID: title.TID,
          })
          .then((response) => {
            if (response) {
              const subtitles = response.SubTitles[title.TID]

              resolve(subtitles ? Object.entries(subtitles) : [])
            } else {
              reject()
            }
          })
          .catch(() => reject())
      })
        .then((value) => setSubtitles(value))
        .catch(() => setSubtitles([]))
        .finally(() => setIsLoading(false))
    }, [title.TID])

    useImperativeHandle(ref, () => {
      return { initialize }
    }, [initialize])

    return (
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        cancelText="閉じる"
        header={<TitleItemInner item={title} isHeader />}
      >
        {isLoading || !subtitles.length ? (
          <div
            className={cn(
              'absolute inset-0 z-20',
              'flex size-full items-center justify-center'
            )}
          >
            {isLoading ? (
              <Spinner size="lg" color="primary" />
            ) : (
              <span className="text-small text-foreground-500">
                サブタイトルがありません
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-2">
            {subtitleItems.map(({ subtitle, refCallbackFunction }, idx) => (
              <SubtitleItem
                key={idx}
                title={title}
                subtitle={[
                  zeroPadding(subtitle[0], macCountLength),
                  subtitle[1],
                ]}
                onClick={() => {
                  const itemHandle = subtitleItemRefs.current[idx]

                  if (itemHandle.isOpen) {
                    itemHandle.close()
                  } else {
                    const handles = Object.values(subtitleItemRefs.current)

                    handles.forEach((handle) => {
                      if (handle.isOpen) {
                        handle.close()
                      }
                    })

                    itemHandle.open()
                  }
                }}
                ref={refCallbackFunction}
              />
            ))}
          </div>
        )}
      </Modal>
    )
  }
)
