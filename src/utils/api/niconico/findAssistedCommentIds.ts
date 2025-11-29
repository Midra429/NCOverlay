import type { V1Comment } from '@midra/nco-utils/types/api/niconico/v1/threads'

interface V1CommentSorted extends V1Comment {
  _postedAtTime: number
}

// コメントアシストの開始日
const COMMENT_ASSIST_STARTED_AT = new Date(
  '2025-04-26T00:00:00+09:00'
).getTime()

function isAssistedCommentBase(comment: V1CommentSorted): boolean {
  const cmdLen = comment.commands.length

  return (
    // コメントのスコアが-1000より大きい
    -1000 < comment.score &&
    // コマンドなし or 匿名コマンドのみ
    (cmdLen === 0 || (cmdLen === 1 && comment.commands[0] === '184'))
  )
}

function isAssistedComment(
  base: V1CommentSorted,
  target: V1CommentSorted
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
  id: V1Comment['id']
  score: number
}

/**
 * アシストコメントを探す
 */
export function findAssistedCommentIds(comments: V1Comment[]): string[] {
  if (comments.length <= 3) {
    return []
  }

  const sameCommentGroups: [
    base: V1CommentSorted,
    ...targets: V1CommentSorted[],
  ][] = []

  // 投稿日時順にソート
  const sorted = comments
    .map<V1CommentSorted>((cmt) => ({
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
    // 文字の長さ
    const wordCount = base.body.length
    const wordScore =
      (8 <= wordCount && 4) ||
      (4 <= wordCount && 3) ||
      (2 <= wordCount && 2) ||
      (1 <= wordCount && 1) ||
      0

    // 同じコメントの数
    const commentCount = targets.length
    const commentScore =
      (9 <= commentCount && 4) ||
      (7 <= commentCount && 3) ||
      (5 <= commentCount && 2) ||
      (3 <= commentCount && 1) ||
      0

    if (!wordScore && !commentScore) return []

    return targets.flatMap<string>(({ id, userId }) => {
      // ユーザーが同じコメントをした回数
      const userCount = userCounts[userId]

      const scoreThreshold = 5 - Math.min(userCount, 4)

      return scoreThreshold <= wordScore && scoreThreshold <= commentScore
        ? id
        : []
    })
  })
}
