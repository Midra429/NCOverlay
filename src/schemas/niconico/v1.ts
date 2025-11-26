import {
  array,
  boolean,
  nullable,
  number,
  object,
  optional,
  string,
  unknown,
} from 'valibot'

/**
 * @see {@link https://github.com/xpadev-net/niconicomments/blob/develop/src/%40types/format.v1.ts#L13}
 */
export const ZV1Comment = object({
  id: string(),
  no: number(),
  vposMs: number(),
  body: string(),
  commands: array(string()),
  userId: string(),
  isPremium: boolean(),
  score: number(),
  postedAt: string(),
  nicoruCount: number(),
  nicoruId: nullable(string()),
  source: string(),
  isMyPost: boolean(),
})

/**
 * @see {@link https://github.com/xpadev-net/niconicomments/blob/develop/src/%40types/format.v1.ts#L30}
 */
export const ZV1Thread = object({
  id: unknown(),
  fork: string(),
  commentCount: optional(number(), 0),
  comments: array(ZV1Comment),
})
