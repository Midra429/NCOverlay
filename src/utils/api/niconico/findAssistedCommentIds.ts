import type { V1Thread } from '@xpadev-net/niconicomments'

type V1ThreadComment = V1Thread['comments'][number]

function isAssistedComment(
  base: V1ThreadComment,
  target: V1ThreadComment
): boolean {
  return (
    // コマンドなし or 匿名コマンドのみ
    (target.commands.length === 0 ||
      (target.commands.length === 1 && target.commands[0] === '184')) &&
    // ニコるが10未満
    target.nicoruCount < 10 &&
    // コメントIDが異なる
    target.id !== base.id &&
    // ユーザーIDが異なる
    target.userId !== base.userId &&
    // 同じコメント
    target.body === base.body &&
    // 時間差が10秒以下
    Math.abs(target.vposMs - base.vposMs) <= 10000
  )
}

export type AssistedCommentResult = {
  id: V1ThreadComment['id']
  score: number
}

/**
 * アシストコメントを探す
 */
export function findAssistedCommentIds(
  comments: V1ThreadComment[],
  scoreThreshold = 4
): string[] {
  if (comments.length <= 1) {
    return []
  }

  const sameCommentGroups: [
    base: V1ThreadComment,
    ...targets: V1ThreadComment[],
  ][] = []

  comments
    // 投稿日時順にソート
    .sort((a, b) => {
      return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()
    })
    .forEach((cmt) => {
      const groupIdx = sameCommentGroups.findIndex(([base]) => {
        return isAssistedComment(base, cmt)
      })

      if (groupIdx !== -1) {
        // targets
        sameCommentGroups[groupIdx].push(cmt)
      } else if (
        cmt.commands.length === 0 ||
        (cmt.commands.length === 1 && cmt.commands[0] === '184')
      ) {
        // base
        sameCommentGroups.push([cmt])
      }
    })

  const sameComments = sameCommentGroups.flat()

  return sameCommentGroups.flatMap<string>(([base, ...targets]) => {
    let baseScore = 0

    // 同じコメントの数
    const sameCommentCount = targets.length

    if (sameCommentCount < 3) return []

    if (7 <= sameCommentCount) {
      baseScore += 3
    } else if (5 <= sameCommentCount) {
      baseScore += 2
    } else if (3 <= sameCommentCount) {
      baseScore += 1
    }

    // 文字の長さ
    const wordCount = base.body.length

    if (9 < wordCount) {
      baseScore += 3
    } else if (6 < wordCount) {
      baseScore += 2
    } else if (3 < wordCount) {
      baseScore += 1
    }

    if (!baseScore) return []

    return targets.flatMap<string>(({ id, userId }) => {
      // 合計スコア (0 <= n <= 9)
      let score = baseScore

      // ユーザーが同じコメントをした回数
      const sameUserCount = sameComments.filter(
        (v) => v.userId === userId
      ).length

      if (6 <= sameUserCount) {
        score += 3
      } else if (4 <= sameUserCount) {
        score += 2
      } else if (2 <= sameUserCount) {
        score += 1
      }

      return scoreThreshold < score ? id : []
    })
  })
}
