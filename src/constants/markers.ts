export type Marker = (typeof MARKERS)[number]
export type MarkerKey = Marker['key']

/**
 * マーカー
 */
export const MARKERS = [
  {
    key: 'start',
    label: 'ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!',
    shortLabel: 'ｷﾀ-',
    regexp:
      /^(ｷﾀ|キタ)[ｰー━].*[!！]$|^きたあ{0,}$|^(始|はじ)まっ?た|hjmt|ｈｊｍｔ$/i,
    range: [0, 300000],
  },
  {
    key: 'op',
    label: 'オープニング',
    shortLabel: 'OP',
    regexp: /^出?(OP|ＯＰ)$/i,
    range: (duration) => [null, duration / 2],
  },
  {
    key: 'aPart',
    label: 'Aパート',
    shortLabel: 'A',
    regexp: /^(A|Ａ)$/,
    range: [null, null],
  },
  {
    key: 'bPart',
    label: 'Bパート',
    shortLabel: 'B',
    regexp: /^(B|Ｂ)$/,
    range: [null, null],
  },
  {
    key: 'ed',
    label: 'エンディング',
    shortLabel: 'ED',
    regexp: /^(ED|ＥＤ)$/i,
    range: (duration) => [duration / 2, null],
  },
  {
    key: 'cPart',
    label: 'Cパート',
    shortLabel: 'C',
    regexp: /^(C|Ｃ)$/,
    range: [null, null],
  },
] as const satisfies {
  key: string
  label: string
  shortLabel: string
  regexp: RegExp
  range:
    | [start: number | null, end: number | null]
    | ((duration: number) => [start: number | null, end: number | null])
}[]
