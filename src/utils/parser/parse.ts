import { normalizer } from './normalizer'
import { extractor } from './extractor'
import { regExpNum } from './extractor/core'

/**
 * 解析結果
 * @example '陰の実力者になりたくて！ 2nd season #01 無法都市'
 */
export type ParseResult = {
  /**
   * 入力値
   * @example '陰の実力者になりたくて！ 2nd season #01 無法都市'
   */
  input: string
  /**
   * シリーズ名
   * @example '陰の実力者になりたくて!'
   */
  seriesTitle?: string
  /** シーズン */
  season?: {
    /** @example 2 */
    number: number
    /** @example '2nd season' */
    text: string
  }
  /**
   * 作品名
   * @example '陰の実力者になりたくて! 2nd season'
   */
  workTitle?: string
  /** エピソード */
  episode?: {
    /** @example 1 */
    number: number
    /** @example '#01' */
    text: string
  }
  /**
   * サブタイトル
   * @example '無法都市'
   */
  subTitle?: string
}

/**
 * タイトルを解析
 */
export const parse = (str: string): ParseResult => {
  // タイトルを統一 (括弧なし)
  const normalized = normalizer.text(str, { bracket: true, anime: true })

  const extractedSeason = extractor.season(normalized)
  const extractedEpisode = extractor.episode(normalized)

  const result: ParseResult = {
    input: str,
  }

  if (extractedSeason.length === 1) {
    const season = extractedSeason[0]
    const [seriesTitle] = normalized.split(season.text).map((v) => v.trim())

    result.seriesTitle = seriesTitle
    result.season = season
  }

  if (extractedEpisode.length === 1) {
    const episode = extractedEpisode[0]
    const [workTitle, subTitle] = normalized
      .split(episode.text)
      .map((v) => v.trim())

    result.episode = episode
    result.workTitle = workTitle
    result.subTitle = subTitle
  } else if (extractedEpisode.length === 0) {
    const splitedA = normalized.split(' ')
    const splitedB = normalizer.text(str, { anime: true }).split(' ')

    let splited: string[] = []

    if (splitedA.length === 3 && new RegExp(regExpNum).test(splitedA[1])) {
      splited = splitedA
    }
    if (splitedB.length === 3 && new RegExp(regExpNum).test(splitedB[1])) {
      splited = splitedB
    }

    if (0 < splited.length) {
      // [作品名, エピソード, サブタイトル]
      const [workTitle, episodeText, subTitle] = splited
      const num = Number(episodeText)

      if (Number.isFinite(num)) {
        result.episode = {
          number: num,
          text: episodeText,
        }
        result.workTitle = workTitle
        result.subTitle = subTitle
      }
    }
  }

  if (result.workTitle) {
    result.seriesTitle ??= result.workTitle
  }

  return result
}
