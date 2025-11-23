import type { ContentFormatted } from '@midra/nco-utils/types/api/nicolog/list'

import { useEffect, useRef, useState } from 'react'
import { RadioGroup, Radio, Spinner, cn } from '@heroui/react'
import { ChevronRightIcon, FolderIcon, FolderOpenIcon } from 'lucide-react'
import { parse } from '@midra/nco-utils/parse'
import { compare } from '@midra/nco-utils/compare'
import { NICO_LIVE_ANIME_ROOT } from '@midra/nco-utils/api/services/nicolog'

import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'
import { ncoState } from '@/hooks/useNco'

export interface DirectoriesProps {
  directoryName: string | null
  setDirectoryName: (name: string | null) => void
}

export function Directories({
  directoryName,
  setDirectoryName,
}: DirectoriesProps) {
  const directoryItemRefs = useRef<{
    [index: number]: HTMLElement
  }>({})

  const [isLoading, setIsLoading] = useState(false)
  const [directories, setDirectories] = useState<ContentFormatted[]>([])

  const directoryItems = directories.map((directory, idx) => ({
    directory,
    refCallbackFunction: (element: HTMLElement | null) => {
      if (element && !directoryItemRefs.current[idx]) {
        directoryItemRefs.current[idx] = element
      } else {
        delete directoryItemRefs.current[idx]
      }
    },
  }))

  useEffect(() => {
    setIsLoading(true)

    ncoApiProxy.nicolog
      .list({ path: NICO_LIVE_ANIME_ROOT })
      .then((list) => {
        const directories = list?.content.filter((v) => v.is_dir)
        // .sort((a, b) => b.created - a.created)

        setDirectories(directories ?? [])

        // 視聴中の作品タイトルを選択
        ncoState?.get('info').then((info) => {
          if (!info || typeof info.input === 'string' || !info.input?.title) {
            return
          }

          const base = parse(`${info.input.titleStripped} #0`)
          const idx =
            directories?.findIndex((v) => compare(base, `${v.name} #0`)) ?? -1

          if (idx !== -1) {
            const directory = directories![idx]
            const element = directoryItemRefs.current[idx]

            setDirectoryName(directory.name)

            setTimeout(
              (elm) => {
                elm.scrollIntoView({
                  behavior: 'instant',
                  block: 'start',
                })
              },
              0,
              element
            )
          }
        })
      })
      .finally(() => setIsLoading(false))

    return () => {
      setIsLoading(false)
      setDirectories([])
      setDirectoryName(null)
    }
  }, [])

  return (
    <div className="relative size-full overflow-y-auto">
      {isLoading || !directories.length ? (
        <div
          className={cn(
            'absolute inset-0 z-20',
            'flex size-full items-center justify-center'
          )}
        >
          {isLoading ? (
            <Spinner size="lg" color="primary" />
          ) : (
            <span className="text-foreground-500 text-small">
              データの取得に失敗しました
            </span>
          )}
        </div>
      ) : (
        <RadioGroup
          classNames={{
            wrapper: 'gap-0',
          }}
          size="sm"
          value={directoryName}
          onValueChange={setDirectoryName}
        >
          {directoryItems.map(
            ({ directory: { name }, refCallbackFunction }) => (
              <Radio
                classNames={{
                  base: [
                    'flex flex-row items-center justify-between',
                    'm-0 min-h-fit w-full max-w-full! shrink-0 px-2 py-1.5',
                    'data-[selected=true]:bg-primary/20',
                    '[&[data-selected=true]_span]:text-primary-600',
                    'hover:bg-default/40',
                    'transition-colors',
                  ],
                  hiddenInput: 'inset-0 [&+span]:hidden',
                  labelWrapper: 'ml-0 w-full',
                  label:
                    'flex flex-row items-center justify-between gap-2 font-bold text-tiny',
                }}
                value={name}
                ref={refCallbackFunction}
              >
                <span className="flex flex-row items-center gap-2">
                  <FolderIcon className="block in-data-[selected=true]:hidden size-4 shrink-0" />
                  <FolderOpenIcon className="in-data-[selected=true]:block hidden size-4 shrink-0" />
                  <span>{name}</span>
                </span>

                <ChevronRightIcon className="size-4 shrink-0" />
              </Radio>
            )
          )}
        </RadioGroup>
      )}
    </div>
  )
}
