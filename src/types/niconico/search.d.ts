/**
 * スナップショット検索API v2
 * @see https://site.nicovideo.jp/search-api-docs/snapshot
 */

export type SearchQuery = {
  /** 検索キーワード  */
  q: string

  /** 検索対象のフィールド */
  targets: (keyof SearchData)[]

  /** レスポンスに含みたいヒットしたコンテンツのフィールド */
  fields?: (keyof Omit<SearchData, 'tagsExact' | 'genre.keyword'>)[]

  /** 検索条件 */
  filters?: {
    [field in keyof Omit<
      SearchData,
      | 'title'
      | 'description'
      | 'userId'
      | 'channelId'
      | 'thumbnailUrl'
      | 'lastResBody'
    >]: {
      [key in '0' | 'gt' | 'gte' | 'lt' | 'lte']?: number | string
    }
  }

  /** ソート順 */
  _sort?: `${'-' | '+'}${
    | 'viewCounter'
    | 'mylistCounter'
    | 'likeCounter'
    | 'lengthSeconds'
    | 'startTime'
    | 'commentCounter'
    | 'lastCommentTime'}`

  /** 返ってくるコンテンツの取得オフセット。最大:1600 */
  _offset?: number

  /** 返ってくるコンテンツの最大数。最大:100 */
  _limit?: number
}

export type Search = {
  meta: SearchMeta
  data: SearchData[]
}

export type SearchMeta = {
  status: number

  /** status: 200 */
  id?: string

  /** status: 200 */
  totalCount?: number

  /** status: Error */
  errorCode?: string

  /** status: Error */
  errorMessage?: string
}

export type SearchData = {
  /** コンテンツID */
  'contentId'?: string

  /** タイトル */
  'title'?: string

  /** コンテンツの説明文 */
  'description'?: string

  /** 投稿者のID */
  'userId'?: number

  /** 再生数 */
  'viewCounter'?: number

  /** マイリスト数 */
  'mylistCounter'?: number

  /** 再生時間(秒) */
  'lengthSeconds'?: number

  /** サムネイルのURL */
  'thumbnailUrl'?: string

  /** 動画の投稿時間 */
  'startTime'?: string

  /** スレッドのID */
  'threadId'?: number

  /** コメント数 */
  'commentCounter'?: number

  /** 最終コメント時間 */
  'lastCommentTime'?: number

  /** categoryTags */
  'categoryTags'?: string

  /** チャンネルのID */
  'channelId'?: number

  /** タグ(空白区切り) */
  'tags'?: string

  /** タグ完全一致(空白区切り) */
  'tagsExact'?: string

  /** ロックされたタグ完全一致(空白区切り) */
  'lockTagsExact'?: string

  /** ジャンル */
  'genre'?: string

  /** ジャンル完全一致 */
  'genre.keyword'?: string
}
