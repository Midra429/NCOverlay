/**
 * マーカー
 */
export const MARKERS: {
  label: string
  shortLabel: string
  regexp: RegExp
}[] = [
  {
    label: 'オープニング',
    shortLabel: 'OP',
    regexp: /^(OP|ＯＰ)$/i,
  },
  {
    label: 'Aパート',
    shortLabel: 'A',
    regexp: /^(A|Ａ)$/,
  },
  {
    label: 'Bパート',
    shortLabel: 'B',
    regexp: /^(B|Ｂ)$/,
  },
  {
    label: 'Cパート',
    shortLabel: 'C',
    regexp: /^(C|Ｃ)$/,
  },
]
