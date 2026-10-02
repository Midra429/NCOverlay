import type * as ThreadsV1 from '@midra/nco-utils/types/api/niconico/threads/v1'
import type { NgSharingLevel } from '@/types/storage'
import type { NgSettingsFormatted } from '@/utils/api/niconico/getNgSettings'

export function isNgComment(
  { body, commands, userId }: ThreadsV1.Comment,
  ngSettings: NgSettingsFormatted
): boolean {
  // 単語
  const isNgWord = ngSettings.words.some((val) => {
    if (typeof val === 'string') {
      return body.includes(val)
    } else {
      return val.test(body)
    }
  })

  if (isNgWord) return true

  // コマンド
  const isNgCommand = commands.some((command) => {
    return ngSettings.commands.some((val) => {
      if (typeof val === 'string') {
        return command === val
      } else {
        return val.test(command)
      }
    })
  })

  if (isNgCommand) return true

  // ユーザーID
  const isNgId = ngSettings.ids.some((val) => {
    if (typeof val === 'string') {
      return userId === val
    } else {
      return val.test(userId)
    }
  })

  if (isNgId) return true

  return false
}

export function isNgCommentByScore(
  score: number,
  level: NgSharingLevel
): boolean {
  switch (level) {
    case 'low':
      return score <= -10000

    case 'middle':
      return score <= -4800

    case 'high':
      return score <= -1000

    default:
      return false
  }
}

export function applyNgSettings(
  threads: ThreadsV1.Thread[],
  ngSettings: NgSettingsFormatted
): ThreadsV1.Thread[] {
  if (!Object.values(ngSettings).flat().length) {
    return threads
  }

  return threads.map<ThreadsV1.Thread>((thread) => {
    let commentCount = thread.commentCount

    const comments = thread.comments.filter(
      (cmt) => !isNgComment(cmt, ngSettings)
    )

    commentCount -= thread.comments.length - comments.length

    return { ...thread, commentCount, comments }
  })
}
