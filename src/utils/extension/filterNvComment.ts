import type { VideoData, NvComment } from '@midra/nco-api/types/niconico/video'

export const filterNvComment = (comment: VideoData['comment']): NvComment => {
  // かんたんコメント, 引用コメントを除外
  const ignoreThreadIds = comment.threads.flatMap((val) => {
    return /easy|extra/.test(val.label)
      ? (`${val.forkLabel}:${val.id.toString()}` as const)
      : []
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
