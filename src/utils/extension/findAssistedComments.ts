import type { V1Thread } from '@xpadev-net/niconicomments'

type V1ThreadComment = V1Thread['comments'][number]

// テンプレコメント
const TEMPLATE_COMMENT_REGEXPS = [
  // ｗｗｗ
  /^[wｗ]{3,}$/,
]

export function isAssistedComment(
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
    // 時間差が6秒以下
    Math.abs(target.vposMs - base.vposMs) <= 6000 &&
    // ベースの1時間以上後に投稿
    new Date(base.postedAt).getTime() + 3600000 * 1 <=
      new Date(target.postedAt).getTime()
  )
}

export type AssistedCommentResult = {
  id: V1ThreadComment['id']
  score: number
}

/**
 * アシストコメントを探す
 */
export function findAssistedComments(
  comments: V1ThreadComment[]
): AssistedCommentResult[] {
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

  return sameCommentGroups.flatMap<AssistedCommentResult>(
    ([base, ...targets]) => {
      if (targets.length <= 3) return []

      // コメント自体のスコア（1 <= n <= 4）
      let baseScore = 1

      // テンプレに一致しない
      if (!TEMPLATE_COMMENT_REGEXPS.some((v) => v.test(base.body))) {
        // 文字の長さ
        const len = base.body.length

        if (7 <= len) {
          baseScore += 3
        } else if (5 <= len) {
          baseScore += 2
        } else if (3 <= len) {
          baseScore += 1
        }
      }

      return targets
        .map<AssistedCommentResult>((cmt) => {
          // ユーザー毎のスコア（0 <= n <= 3）
          let userScore = 0

          // 同一ユーザーによる同一コメントの出現回数
          const sameUserCount = sameComments.filter(
            (v) => v.userId === cmt.userId
          ).length

          if (4 <= sameUserCount) {
            userScore += 3
          } else if (3 <= sameUserCount) {
            userScore += 2
          } else if (2 <= sameUserCount) {
            userScore += 1
          }

          // 合計スコア（1 <= n <= 7）
          const score = baseScore + userScore

          return { id: cmt.id, score }
        })
        .filter((v) => 3 <= v.score)
    }
  )
}
