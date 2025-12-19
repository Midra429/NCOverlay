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
    regexp: /^(ｷﾀ|キタ)[ｰー━].*[!！]$|^きたあ{0,}$|^(始|はじ)まっ?た$/i,
    range: [0, 180],
  },
  {
    key: 'op',
    label: 'オープニング',
    shortLabel: 'OP',
    regexp: /^(OP|ＯＰ)$/i,
    range: [null, null],
  },
  {
    key: 'a-part',
    label: 'Aパート',
    shortLabel: 'A',
    regexp: /^(A|Ａ)$/,
    range: [null, null],
  },
  {
    key: 'b-part',
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
    range: [null, null],
  },
  {
    key: 'c-part',
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
  range: [start: number | null, end: number | null]
}[]
