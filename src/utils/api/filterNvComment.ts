import type {
  VideoData,
  NvComment,
} from '@midra/nco-utils/types/api/niconico/video'

export const filterNvComment = (comment: VideoData['comment']): NvComment => {
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

  return {
    ...comment.nvComment,
    params: {
      ...comment.nvComment.params,
      targets: comment.nvComment.params.targets.filter((val) => {
        return !ignoreThreadIds.includes(`${val.fork}:${val.id}`)
      }),
    },
  }
}
