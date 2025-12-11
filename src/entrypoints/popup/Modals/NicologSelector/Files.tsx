import type { ContentFormatted } from '@midra/nco-utils/types/api/nicolog/list'

import { useEffect, useState } from 'react'
import { Radio, RadioGroup, Spinner, cn } from '@heroui/react'
import { CalendarDaysIcon } from 'lucide-react'
import { NICO_LIVE_ANIME_ROOT } from '@midra/nco-utils/api/services/nicolog'

import { formatDate } from '@/utils/format'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

export interface FilesProps {
  directoryName: string | null
  disabledIds?: string[]
  setFileName: (name: string | null) => void
}

export function Files({ directoryName, disabledIds, setFileName }: FilesProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState<ContentFormatted[]>([])

  useEffect(() => {
    if (!directoryName) return

    setIsLoading(true)

    ncoApiProxy.nicolog
      .list({
        path: `${NICO_LIVE_ANIME_ROOT}/${directoryName}`,
      })
      .then((list) => {
        const files = list?.content.filter(
          (v) => !v.is_dir && !v.name.endsWith('_raw.xml')
        )
        // .sort((a, b) => b.created - a.created)

        setFiles(files ?? [])
      })
      .finally(() => setIsLoading(false))

    return () => {
      setIsLoading(false)
      setFiles([])
      setFileName(null)
    }
  }, [directoryName])

  return (
    <div className="relative size-full overflow-y-auto">
      {isLoading || !files.length ? (
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
              ファイルがありません
            </span>
          )}
        </div>
      ) : (
        <RadioGroup
          classNames={{
            wrapper: 'gap-0',
          }}
          size="sm"
          onValueChange={setFileName}
        >
          {files.map(({ created, name }) => (
            <Radio
              key={name}
              classNames={{
                base: [
                  'flex flex-row items-center justify-between',
                  'm-0 min-h-fit w-full max-w-full! shrink-0 px-2 py-1.5',
                  'data-[selected=true]:bg-primary',
                  'hover:bg-default/40',
                  'transition-colors',
                ],
                hiddenInput: 'inset-0 [&+span]:hidden',
                labelWrapper: 'ml-0 w-full',
                label: 'flex flex-col gap-0.5 text-tiny',
              }}
              value={name}
              isDisabled={disabledIds?.includes(`${directoryName}/${name}`)}
            >
              <span
                className={cn(
                  'flex flex-row items-center gap-1',
                  'text-mini',
                  'text-foreground-500 dark:text-foreground-600',
                  'in-data-[selected=true]:text-primary-foreground/80!'
                )}
              >
                <CalendarDaysIcon className="size-3" />

                <span>{formatDate(created)}</span>
              </span>

              <span className="font-bold in-data-[selected=true]:text-primary-foreground">
                {name}
              </span>
            </Radio>
          ))}
        </RadioGroup>
      )}
    </div>
  )
}
