import type {
  DataComment,
  Fork,
} from '@midra/nco-utils/types/api/niconico/video'

export function filterNvComment(comment: DataComment) {
  // 除外
  const ignoreThreadIds: `${Fork}:${string}`[] = []

  for (const thread of comment.threads) {
    if (
      // かんたんコメント
      thread.label.includes('easy') ||
      // 引用コメント
      thread.label.includes('extra')
    ) {
      ignoreThreadIds.push(`${thread.forkLabel}:${thread.id}`)
    }
  }

  comment.nvComment.params.targets = comment.nvComment.params.targets.filter(
    (val) => {
      return !ignoreThreadIds.includes(`${val.fork}:${val.id}`)
    }
  )
}
