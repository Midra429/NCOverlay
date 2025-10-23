import type { V1ThreadComment } from '@/types/niconico'

// コメントアシストの開始日
const COMMENT_ASSIST_START_DATE = new Date('2025-04-26T00:00:00+09:00')

function isAssistedCommentBase(comment: V1ThreadComment): boolean {
  return (
    // コメントのスコアが-1000より大きい
    -1000 < comment.score &&
    // コマンドなし or 匿名コマンドのみ
    (comment.commands.length === 0 ||
      (comment.commands.length === 1 && comment.commands[0] === '184'))
  )
}

function isAssistedComment(
  base: V1ThreadComment,
  target: V1ThreadComment
): boolean {
  return (
    // コメントアシストの開始日以降に投稿
    COMMENT_ASSIST_START_DATE <= new Date(target.postedAt) &&
    // コメントIDが異なる
    target.id !== base.id &&
    // ユーザーIDが異なる
    target.userId !== base.userId &&
    // 同じコメント
    target.body === base.body &&
    // コマンドなし or 匿名コマンドのみ
    (target.commands.length === 0 ||
      (target.commands.length === 1 && target.commands[0] === '184')) &&
    // ニコるが10未満
    target.nicoruCount < 10 &&
    // 時間差が8秒以下
    Math.abs(target.vposMs - base.vposMs) <= 8000
  )
}

export interface AssistedCommentResult {
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

  // 投稿日時順にソート
  comments.sort((a, b) => {
    return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()
  })

  for (const cmt of comments) {
    const groupIdx = sameCommentGroups.findIndex(([base]) => {
      return isAssistedComment(base, cmt)
    })

    // targets
    if (groupIdx !== -1) {
      sameCommentGroups[groupIdx].push(cmt)
    }
    // base
    else if (isAssistedCommentBase(cmt)) {
      sameCommentGroups.push([cmt])
    }
  }

  const sameComments = sameCommentGroups.flat()

  return sameCommentGroups.flatMap<string>(([base, ...targets]) => {
    let baseScore = 0

    // 同じコメントの数
    const sameCommentCount = targets.length

    if (sameCommentCount <= 3) return []

    if (8 <= sameCommentCount) {
      baseScore += 3
    } else if (6 <= sameCommentCount) {
      baseScore += 2
    } else if (4 <= sameCommentCount) {
      baseScore += 1
    }

    // 文字の長さ
    const wordCount = base.body.length

    if (10 <= wordCount) {
      baseScore += 3
    } else if (7 <= wordCount) {
      baseScore += 2
    } else if (4 <= wordCount) {
      baseScore += 1
    }

    if (!baseScore) return []

    return targets.flatMap<string>(({ id, userId }) => {
      // 合計スコア (1 <= n <= 9)
      let score = baseScore

      // ユーザーが同じコメントをした回数
      const sameUserCount = sameComments.filter(
        (v) => v.userId === userId
      ).length

      score += Math.min(sameUserCount - 1, 3)

      return scoreThreshold < score ? id : []
    })
  })
}
