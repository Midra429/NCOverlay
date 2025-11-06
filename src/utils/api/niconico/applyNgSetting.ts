import type { V1Thread, V1Comment } from '@xpadev-net/niconicomments'
import type { NgSettingsConverted } from '@/utils/api/niconico/getNgSettings'

export function isNgComment(
  { body, commands, userId }: V1Comment,
  ngSettings: NgSettingsConverted
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

export function applyNgSettings(
  threads: V1Thread[],
  ngSettings: NgSettingsConverted
): V1Thread[] {
  if (!Object.values(ngSettings).flat().length) {
    return threads
  }

  const applied: V1Thread[] = []

  for (const thread of threads) {
    let commentCount = thread.commentCount

    const comments = thread.comments.filter(
      (cmt) => !isNgComment(cmt, ngSettings)
    )

    commentCount -= thread.comments.length - comments.length

    applied.push({ ...thread, commentCount, comments })
  }

  return applied
}
