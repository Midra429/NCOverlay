import type { ParseResult } from './parse'
import { normalizer } from './normalizer'
import { extractor } from './extractor'
import { parse } from './parse'
import { equal } from './equal'
import { match } from './match'

export type CompareResult = {
  total: number
  workTitle: number
  episode: number
  subTitle: number
}

/**
 * 2つのテキスト or 解析結果を比較する
 * @returns 一致率 (0 ~ 100)
 */
export const compare = (
  targetA: string | ParseResult,
  targetB: string | ParseResult
): CompareResult => {
  if (typeof targetA === 'string') targetA = parse(targetA)
  if (typeof targetB === 'string') targetB = parse(targetB)

  const result: CompareResult = {
    total: 0,
    workTitle: 0,
    episode: 0,
    subTitle: 0,
  }

  if (equal(targetA.input, targetB.input)) {
    result.total = 100

    return result
  }

  // 作品名
  if (equal(targetA.workTitle, targetB.workTitle)) {
    result.workTitle = 100
  } else {
    // シリーズ名
    if (equal(targetA.seriesTitle, targetB.seriesTitle)) {
      result.workTitle += 70
    } else {
      let pctA = 0
      let pctB = 0

      if (
        targetA.workTitle &&
        targetB.workTitle &&
        targetA.season &&
        targetB.season
      ) {
        pctA = match(
          normalizer.all(targetA.workTitle.split(targetA.season.text).join('')),
          normalizer.all(targetB.workTitle.split(targetB.season.text).join(''))
        )
      }

      if (targetA.seriesTitle && targetB.seriesTitle) {
        pctB = match(
          normalizer.all(targetA.seriesTitle),
          normalizer.all(targetB.seriesTitle)
        )
      }

      result.workTitle += Math.round(Math.max(pctA, pctB) * 0.7)
    }

    // シーズン
    if (equal(targetA.season?.number, targetB.season?.number)) {
      result.workTitle += 30
    }
  }

  // エピソード
  if (equal(targetA.episode?.number, targetB.episode?.number)) {
    result.episode = 100
  }

  // サブタイトル
  if (equal(targetA.subTitle, targetB.subTitle)) {
    result.subTitle = 100
  } else {
    result.workTitle += match(
      normalizer.all(targetA.subTitle ?? ''),
      normalizer.all(targetB.subTitle ?? '')
    )
  }

  result.total = Math.round(
    result.workTitle * 0.5 + result.episode * 0.3 + result.subTitle * 0.2
  )

  if (result.total === 0) {
    const splitedA = normalizer
      .text(targetA.input, { bracket: true, anime: true })
      .split(' ')
      .filter(Boolean)
    const splitedB = normalizer
      .text(targetB.input, { bracket: true, anime: true })
      .split(' ')
      .filter(Boolean)

    const splitedShort = splitedA.length < splitedB.length ? splitedA : splitedB
    const splitedLong = splitedA.length < splitedB.length ? splitedB : splitedA

    const strLong = splitedLong.join('')

    let pct = 0

    for (const long of splitedLong) {
      for (let i = 0; i < splitedShort.length; i++) {
        if (equal(long, splitedShort[i])) {
          pct += (splitedShort[i].length / strLong.length) * 100

          splitedShort[i] = ''
        } else {
          const epNumA = extractor.episode(long)[0]?.number
          const epNumB = extractor.episode(splitedShort[i])[0]?.number

          if (
            Number.isFinite(epNumA) &&
            Number.isFinite(epNumB) &&
            epNumA === epNumB
          ) {
            pct += (long.length / strLong.length) * 100

            splitedShort[i] = ''
          }
        }
      }
    }

    result.total = Math.round(pct)
  }

  return result
}
