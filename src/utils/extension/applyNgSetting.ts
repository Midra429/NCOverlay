import type { V1Thread } from '@xpadev-net/niconicomments'
import type { Ng } from '@midra/nco-api/types/niconico/video'
import type { NgSettings } from './getNgSettings'

export const isNgComment = (
  { body, commands, userId }: V1Thread['comments'][number],
  ngSettings: NgSettings
): boolean => {
  // 単語
  const isNgWord = ngSettings.words.some(({ content, isRegExp }) => {
    if (isRegExp) {
      try {
        return new RegExp(content).test(body)
      } catch {}
    } else {
      return body.includes(content)
    }
  })

  // コマンド
  const isNgCommand = commands.some((command) => {
    return ngSettings.commands.some(({ content, isRegExp }) => {
      if (isRegExp) {
        try {
          return new RegExp(content).test(command)
        } catch {}
      } else {
        return command === content
      }
    })
  })

  // ユーザーID
  const isNgId = ngSettings.ids.some(({ content, isRegExp }) => {
    if (isRegExp) {
      try {
        return new RegExp(content).test(userId)
      } catch {}
    } else {
      return userId === content
    }
  })

  return isNgWord || isNgCommand || isNgId
}

export const convertNgSettings = (ng: Ng): NgSettings => {
  const ngSettings: NgSettings = {
    words: [],
    commands: [],
    ids: [],
  }

  ng.viewer?.items.forEach((item) => {
    ngSettings[`${item.type}s` as const]?.push({
      content: item.source,
    })
  })

  return ngSettings
}

export const applyNgSettings = (
  threads: V1Thread[],
  ngSettings: NgSettings
): V1Thread[] => {
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
