import type { WatchResponse } from '@midra/nco-utils/api/services/niconico'

export function filterNvComment({ type, data, rawData }: WatchResponse) {
  switch (type) {
    case 'v3':
    case 'v4': {
      // 除外
      const ignoreThreadIds: `${string}:${string}`[] = []

      for (const thread of data.comment.threads) {
        if (
          // かんたんコメント
          thread.label.includes('easy') ||
          // 引用コメント
          thread.label.includes('extra') ||
          // AIキャラクターコメント
          thread.forkLabel === 'ai' ||
          thread.label === 'ai'
        ) {
          ignoreThreadIds.push(`${thread.forkLabel}:${thread.id}`)
        }
      }

      rawData.comment.nvComment.params.targets =
        rawData.comment.nvComment.params.targets.filter((val) => {
          return !ignoreThreadIds.includes(`${val.fork}:${val.id}`)
        })

      break
    }
  }
}
