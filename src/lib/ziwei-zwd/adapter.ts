/**
 * iztro Astrolabe → ziwei-zwd ZiweiChart 适配器
 *
 * 将九宫已使用的 iztro 排盘结果（Astrolabe）转换为
 * ziwei-doushu（倪海厦体系）格局识别引擎所需的 ZiweiChart 结构。
 * 来源：Renhuai123/ziwei-doushu (MIT) 适配层，自研。
 */
import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe'
import type { Palace, Star, ZiweiChart } from './types'

const BRANCH_IDX: Record<string, number> = { 子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5, 午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11 }
const STEM_IDX: Record<string, number> = { 甲: 0, 乙: 1, 丙: 2, 丁: 3, 戊: 4, 己: 5, 庚: 6, 辛: 7, 壬: 8, 癸: 9 }
const BRIGHT_MAP: Record<string, 'bright' | 'normal' | 'dim'> = {
  庙: 'bright', 旺: 'bright', 得: 'bright', 利: 'bright',
  平: 'normal', 不: 'dim', 陷: 'dim',
}
const FIVE_MAP: Record<string, number> = { 水二局: 2, 木三局: 3, 金四局: 4, 土五局: 5, 火六局: 6 }

function toStars(list: { name: string; brightness?: string; mutagen?: string }[], type: Star['type']): Star[] {
  return list.map(s => ({
    name: s.name,
    type,
    siHua: (s.mutagen && ['禄', '权', '科', '忌'].includes(s.mutagen) ? s.mutagen : undefined) as Star['siHua'],
    brightness: (s.brightness && BRIGHT_MAP[s.brightness]) || undefined,
  }))
}

export function iztroToZiweiChart(astro: IFunctionalAstrolabe): ZiweiChart {
  const palaces: Palace[] = astro.palaces.map(p => ({
    branch: BRANCH_IDX[p.earthlyBranch],
    stem: STEM_IDX[p.heavenlyStem],
    name: p.name,
    stars: [
      ...toStars(p.majorStars as { name: string; brightness?: string; mutagen?: string }[], 'major'),
      ...toStars(p.minorStars as unknown as { name: string; brightness?: string; mutagen?: string }[], 'minor'),
      ...toStars(p.adjectiveStars as unknown as { name: string; brightness?: string; mutagen?: string }[], 'lucky'),
    ],
    daXianAge: p.decadal ? [p.decadal.range[0], p.decadal.range[1]] : undefined,
    isMingGong: p.name === '命宫',
    isShenGong: p.isBodyPalace,
    oppositeBranch: (BRANCH_IDX[p.earthlyBranch] + 6) % 12,
    isEmpty: p.majorStars.length === 0,
  }))

  return {
    birthInfo: {
      year: 0, month: 0, day: 0, hour: 0,
      gender: astro.gender === 'male' ? 'male' : 'female',
    },
    lunarInfo: { lunarYear: 0, lunarMonth: 0, lunarDay: 0, yearStem: 0, yearBranch: 0, isLeapMonth: false },
    mingGongBranch: BRANCH_IDX[astro.earthlyBranchOfSoulPalace],
    shenGongBranch: BRANCH_IDX[astro.earthlyBranchOfBodyPalace],
    wuxingJu: FIVE_MAP[astro.fiveElementsClass] || 0,
    wuxingJuName: astro.fiveElementsClass,
    ziweiPos: 0,
    palaces,
    daXians: [],
    currentAge: 0,
    currentDaXianIndex: 0,
  }
}
