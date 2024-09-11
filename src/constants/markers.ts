/**
 * マーカー
 */
export const MARKERS = [
  {
    label: 'ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!',
    shortLabel: 'ｷﾀ-',
    regexp: /^(ｷﾀ|キタ)[ｰー━].+[!！]$|^きたあ{0,}$|^(始|はじ)まっ?た$/i,
    range: [0, 180], // 3分間待ってやる
  },
  {
    label: 'オープニング',
    shortLabel: 'OP',
    regexp: /^(OP|ＯＰ)$/i,
    range: [null, null],
  },
  {
    label: 'Aパート',
    shortLabel: 'A',
    regexp: /^(A|Ａ)$/,
    range: [null, null],
  },
  {
    label: 'Bパート',
    shortLabel: 'B',
    regexp: /^(B|Ｂ)$/,
    range: [null, null],
  },
  {
    label: 'Cパート',
    shortLabel: 'C',
    regexp: /^(C|Ｃ)$/,
    range: [null, null],
  },
] as const satisfies {
  label: string
  shortLabel: string
  regexp: RegExp
  range: [start: number | null, end: number | null]
}[]
