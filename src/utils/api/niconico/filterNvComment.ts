import type {
  DataComment,
  NvComment,
} from '@midra/nco-utils/types/api/niconico/video'

export function filterNvComment(comment: DataComment) {
  // 除外
  const ignoreThreadIds = comment.threads.flatMap((val) => {
    const threadId = `${val.forkLabel}:${val.id.toString()}` as const

    // かんたんコメント
    if (val.label.includes('easy')) {
      return threadId
    }

    // 引用コメント
    if (val.label.includes('extra')) {
      return threadId
    }

    return []
  })

  comment.nvComment.params.targets = comment.nvComment.params.targets.filter(
    (val) => {
      return !ignoreThreadIds.includes(`${val.fork}:${val.id}`)
    }
  )
}
