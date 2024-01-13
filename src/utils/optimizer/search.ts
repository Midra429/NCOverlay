import type { ParseResult } from '../parser/parse'
import { number2kanji } from '@geolonia/japanese-numeral'
import { Parser } from '../parser'
import { zeroPadding } from '../zeroPadding'
import { normalizer } from '../parser/normalizer'

/**
 * 検索用に最適化
 * @param parseResult 解析結果
 * @param strict 厳密な検索
 */
export const search = (
  target: string | ParseResult,
  strict: boolean = false
) => {
  if (typeof target === 'string') target = Parser.parse(target)

  const { seriesTitle, season, workTitle, episode, subTitle } = target

  let optimized = ''

  if (seriesTitle && workTitle && episode && (!strict || subTitle)) {
    const seasonStr =
      season &&
      [
        `"${season.text}"`,
        `${season.number}期`,
        `${number2kanji(season.number)}期`,
        `シーズン${season.number}`,
        `Season${season.number}`,
      ].join(' OR ')

    const episodeStr = [
      episode.number,
      episode.number < 10 && zeroPadding(episode.number, 2),
      number2kanji(episode.number),
    ]
      .flatMap((v) => v || [])
      .join(' OR ')

    optimized = [
      // 作品名
      strict
        ? workTitle
        : seriesTitle
            .split(' ')
            .map((v) => normalizer.text(v, { symbol: true }))
            .join(' OR '),
      // シーズン
      seasonStr,
      // エピソード
      episodeStr,
      // サブタイトル
      strict
        ? subTitle &&
          normalizer.text(subTitle, {
            symbol: true,
          })
        : '',
    ]
      .flatMap((v) => v || [])
      .join(' ')
  } else {
    optimized = normalizer.text(target.input, {
      bracket: true,
      symbol: true,
      anime: true,
    })
  }

  return optimized
}
