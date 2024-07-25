import type { V1Thread } from '@xpadev-net/niconicomments'

export type NgSetting = {
  word: (string | RegExp)[]
  command: (string | RegExp)[]
  id: string[]
}

export const isNgComment = (
  comment: V1Thread['comments'][number],
  ngSetting: NgSetting
): boolean => {
  return (
    // 単語
    ngSetting.word.some((ngWord) =>
      typeof ngWord === 'string'
        ? comment.body.includes(ngWord)
        : ngWord.test(comment.body)
    ) ||
    // コマンド
    comment.commands.some((cmd) =>
      ngSetting.command.some((ngCmd) =>
        typeof ngCmd === 'string' ? cmd === ngCmd : ngCmd.test(cmd)
      )
    ) ||
    // ユーザーID
    ngSetting.id.includes(comment.userId)
  )
}

export const applyNgSetting = (
  threads: V1Thread[],
  ngSetting: NgSetting
): V1Thread[] => {
  if (!Object.values(ngSetting).flat().length) {
    return threads
  }

  const applied: V1Thread[] = []

  for (const thread of threads) {
    let commentCount = thread.commentCount

    const comments = thread.comments.flatMap((cmt) => {
      if (isNgComment(cmt, ngSetting)) {
        commentCount--

        return []
      }

      return cmt
    })

    applied.push({ ...thread, comments })
  }

  return applied
}
