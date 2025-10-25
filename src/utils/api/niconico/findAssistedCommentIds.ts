import type { V1ThreadComment } from '@/types/niconico'

interface V1ThreadCommentSorted extends V1ThreadComment {
  _postedAtTime: number
}

// コメントアシストの開始日
const COMMENT_ASSIST_STARTED_AT = new Date(
  '2025-04-26T00:00:00+09:00'
).getTime()

function isAssistedCommentBase(comment: V1ThreadCommentSorted): boolean {
  const cmdLen = comment.commands.length

  return (
    // コメントのスコアが-1000より大きい
    -1000 < comment.score &&
    // コマンドなし or 匿名コマンドのみ
    (cmdLen === 0 || (cmdLen === 1 && comment.commands[0] === '184'))
  )
}

function isAssistedComment(
  base: V1ThreadCommentSorted,
  target: V1ThreadCommentSorted
): boolean {
  const cmdLen = target.commands.length

  return (
    // コメントアシストの開始日以降に投稿
    COMMENT_ASSIST_STARTED_AT <= target._postedAtTime &&
    // コメントIDが異なる
    target.id !== base.id &&
    // ユーザーIDが異なる
    target.userId !== base.userId &&
    // 同じコメント
    target.body === base.body &&
    // コマンドなし or 匿名コマンドのみ
    (cmdLen === 0 || (cmdLen === 1 && target.commands[0] === '184')) &&
    // ニコるが10未満
    target.nicoruCount < 10 &&
    // 時間差が12秒以下
    Math.abs(target.vposMs - base.vposMs) <= 12000
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
  if (comments.length <= 3) {
    return []
  }

  const sameCommentGroups: [
    base: V1ThreadCommentSorted,
    ...targets: V1ThreadCommentSorted[],
  ][] = []

  // 投稿日時順にソート
  const sorted = comments
    .map<V1ThreadCommentSorted>((cmt) => ({
      ...cmt,
      _postedAtTime: new Date(cmt.postedAt).getTime(),
    }))
    .sort((a, b) => a._postedAtTime - b._postedAtTime)

  for (const cmt of sorted) {
    const group = sameCommentGroups.find(([base]) => {
      return isAssistedComment(base, cmt)
    })

    if (group) {
      // targets
      group.push(cmt)
    } else if (isAssistedCommentBase(cmt)) {
      // base
      sameCommentGroups.push([cmt])
    }
  }

  const sameComments = sameCommentGroups.flat()
  const userCounts: Record<string, number> = {}

  for (const { userId } of sameComments) {
    userCounts[userId] ??= 0
    userCounts[userId]++
  }

  return sameCommentGroups.flatMap<string>(([base, ...targets]) => {
    let baseScore = 0

    // 同じコメントの数
    const sameCommentCount = targets.length

    if (sameCommentCount <= 2) return []

    if (8 <= sameCommentCount) {
      baseScore += 3
    } else if (6 <= sameCommentCount) {
      baseScore += 2
    } else if (4 <= sameCommentCount) {
      baseScore += 1
    }

    // 文字の長さ
    const wordCount = base.body.length

    if (9 <= wordCount) {
      baseScore += 3
    } else if (6 <= wordCount) {
      baseScore += 2
    } else if (3 <= wordCount) {
      baseScore += 1
    }

    if (!baseScore) return []

    return targets.flatMap<string>(({ id, userId }) => {
      // 合計スコア (1 <= n <= 9)
      let score = baseScore

      // ユーザーが同じコメントをした回数
      const sameUserCount = userCounts[userId]

      score += Math.min(sameUserCount - 1, 3)

      return scoreThreshold < score ? id : []
    })
  })
}
