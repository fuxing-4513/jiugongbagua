/**
 * bazi-enrich.ts — 八字格局补层
 * 
 * 为九宫 bazi-engine 补充：格局/旺衰/调候/刑冲合害/盖头截脚
 * 移植自 Yiqi core + enrichBazi，适配 lunar-typescript
 * 
 * 使用方式：
 *   const enrich = enrichBazi(siZhu) // { 格局, 旺衰, 调候用神, 天干关系, 地支关系, 整柱, ... }
 */

import { WX_MAP, SHI_SHEN as SS_MAP, CANG_GAN as HIDDEN_GAN } from './bazi-constants'

// ====== 五行旺相（月令） ======
export function wuXingMonthStatus(monthZhi: string): Record<string, string> {
  const map: Record<string, Record<string, string>> = {
    '寅': { 木:'旺', 火:'相', 水:'休', 金:'囚', 土:'死' },
    '卯': { 木:'旺', 火:'相', 水:'休', 金:'囚', 土:'死' },
    '巳': { 火:'旺', 土:'相', 木:'休', 水:'囚', 金:'死' },
    '午': { 火:'旺', 土:'相', 木:'休', 水:'囚', 金:'死' },
    '申': { 金:'旺', 水:'相', 土:'休', 火:'囚', 木:'死' },
    '酉': { 金:'旺', 水:'相', 土:'休', 火:'囚', 木:'死' },
    '亥': { 水:'旺', 木:'相', 金:'休', 土:'囚', 火:'死' },
    '子': { 水:'旺', 木:'相', 金:'休', 土:'囚', 火:'死' },
    '辰': { 土:'旺', 金:'相', 火:'休', 木:'囚', 水:'死' },
    '戌': { 土:'旺', 金:'相', 火:'休', 木:'囚', 水:'死' },
    '丑': { 土:'旺', 金:'相', 火:'休', 木:'囚', 水:'死' },
    '未': { 土:'旺', 金:'相', 火:'休', 木:'囚', 水:'死' },
  }
  return map[monthZhi] || {}
}

export const SS_GROUP: Record<string, string> = {
  '比肩':'比劫','劫财':'比劫','食神':'食伤','伤官':'食伤',
  '正财':'财','偏财':'财','正官':'官杀','七杀':'官杀',
  '正印':'印','偏印':'印'
}

export interface WuXingStats {
  surface: Record<string, number>
  withCangGan: Record<string, number>
  missing: string[]
  strongest: string[]
  shiShenGroups: Record<string, { 十神类: string; 实例数: number }>
}

export function countWuXing(pillars: Record<string, { gan: string; zhi: string }>, dayMaster: string): WuXingStats {
  const surface: Record<string, number> = { 木:0, 火:0, 土:0, 金:0, 水:0 }
  const withCangGan: Record<string, number> = { 木:0, 火:0, 土:0, 金:0, 水:0 }
  const shiShenGroups: Record<string, { 十神类: string; 实例数: number }> = {}
  const keys = ['年', '月', '日', '时']

  for (const p of keys) {
    const pData = pillars[p]
    if (!pData) continue
    // 天干
    const wxG = WX_MAP[pData.gan]
    surface[wxG]++
    withCangGan[wxG]++
    // 地支藏干(含本气+中气+余气)
    const hidden = HIDDEN_GAN[pData.zhi] || ''
    for (const g of hidden) {
      const wx = WX_MAP[g]
      withCangGan[wx] += 0.4  // 每个藏干算0.4分
    }
  }
  // 四舍五入到整数
  for (const k of Object.keys(withCangGan)) {
    withCangGan[k] = Math.round(withCangGan[k] * 10) / 10
  }

  // 五行缺：天干不透+地支本气不显（余气藏干微弱的不算真正的有）
  const missing: string[] = []
  const WX_TO_GAN: Record<string, string[]> = {
    '木':['甲','乙'], '火':['丙','丁'], '土':['戊','己'], '金':['庚','辛'], '水':['壬','癸']
  }
  for (const [wx, count] of Object.entries(surface)) {
    if (count > 0) continue
    // 检查地支本气（藏干第一个字）是否含此五行
    let hasInBenQi = false
    for (const p of keys) {
      const zhi = pillars[p]?.zhi || ''
      const benQi = (HIDDEN_GAN[zhi] || '')[0]
      if (benQi && WX_MAP[benQi] === wx) { hasInBenQi = true; break }
    }
    if (!hasInBenQi) missing.push(wx)
  }
  const strongest: string[] = []
  let maxCount = 0
  for (const [wx, count] of Object.entries(withCangGan)) {
    if (count > maxCount) { maxCount = count; strongest.length = 0; strongest.push(wx) }
    else if (count === maxCount) strongest.push(wx)
  }

  // Build shiShenGroups
  const ssCounts: Record<string, any> = {}
  for (const wx of ['木','火','土','金','水']) {
    const count = withCangGan[wx]
    if (count > 0) {
      // Map 五行 to 十神类 based on dayMaster
      const dmWx = WX_MAP[dayMaster]
      const keWo: Record<string,string> = { '木':'土','火':'金','土':'水','金':'木','水':'火' } // 我克
      const woKe: Record<string,string> = { '木':'金','火':'水','土':'火','金':'土','水':'木' } // 克我
      const shengWo: Record<string,string> = { '木':'水','火':'木','土':'火','金':'土','水':'金' } // 生我
      const woSheng: Record<string,string> = { '木':'火','火':'土','土':'金','金':'水','水':'木' } // 我生

      let group = '比劫'
      if (wx === keWo[dmWx]) group = '财'
      else if (wx === woKe[dmWx]) group = '官杀'
      else if (wx === shengWo[dmWx]) group = '印'
      else if (wx === woSheng[dmWx]) group = '食伤'

      ssCounts[wx] = group
    }
  }

  return {
    surface,
    withCangGan,
    missing,
    strongest,
    shiShenGroups: Object.fromEntries(
      ['木','火','土','金','水'].filter(wx => withCangGan[wx] > 0).map(wx => [
        wx, { 十神类: ssCounts[wx] || '', 实例数: withCangGan[wx] }
      ])
    )
  }
}

// ====== 十二长生 ======
const ZHANG_SHENG: Record<string, Record<string, string>> = {
  '甲': { '寅':'临官','卯':'帝旺','辰':'衰','巳':'病','午':'死','未':'墓','申':'绝','酉':'胎','戌':'养','亥':'长生','子':'沐浴','丑':'冠带' },
  '乙': { '寅':'帝旺','卯':'临官','辰':'冠带','巳':'长生','午':'沐浴','未':'冠带','申':'官带','酉':'临官','戌':'衰','亥':'病','子':'死','丑':'墓' },
  '丙': { '寅':'长生','卯':'沐浴','辰':'冠带','巳':'临官','午':'帝旺','未':'衰','申':'病','酉':'死','戌':'墓','亥':'绝','子':'胎','丑':'养' },
  '丁': { '寅':'死','卯':'病','辰':'衰','巳':'帝旺','午':'临官','未':'冠带','申':'沐浴','酉':'长生','戌':'养','亥':'胎','子':'绝','丑':'墓' },
  '戊': { '寅':'长生','卯':'沐浴','辰':'冠带','巳':'临官','午':'帝旺','未':'衰','申':'病','酉':'死','戌':'墓','亥':'绝','子':'胎','丑':'养' },
  '己': { '寅':'死','卯':'病','辰':'衰','巳':'帝旺','午':'临官','未':'冠带','申':'沐浴','酉':'长生','戌':'养','亥':'胎','子':'绝','丑':'墓' },
  '庚': { '寅':'绝','卯':'胎','辰':'养','巳':'长生','午':'沐浴','未':'冠带','申':'临官','酉':'帝旺','戌':'衰','亥':'病','子':'死','丑':'墓' },
  '辛': { '寅':'胎','卯':'绝','辰':'墓','巳':'死','午':'病','未':'衰','申':'帝旺','酉':'临官','戌':'冠带','亥':'沐浴','子':'长生','丑':'养' },
  '壬': { '寅':'病','卯':'死','辰':'墓','巳':'绝','午':'胎','未':'养','申':'长生','酉':'沐浴','戌':'冠带','亥':'临官','子':'帝旺','丑':'衰' },
  '癸': { '寅':'沐浴','卯':'长生','辰':'养','巳':'胎','午':'绝','未':'墓','申':'死','酉':'病','戌':'衰','亥':'帝旺','子':'临官','丑':'冠带' },
}

// ====== 地支关系（刑冲合害） ======
interface ZhiRelation {
  type: string
  zhi: string[]
  pillars: string[]
  detail?: string
}

export function detectZhiRelations(pillars: Record<string, string>): ZhiRelation[] {
  const results: ZhiRelation[] = []
  const names = ['年', '月', '日', '时']
  const zhiArr = names.map(n => ({ name: n, zhi: pillars[n] }))

  // 六冲
  const LIU_CHONG: Record<string, string> = { '子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥' }
  for (let i = 0; i < zhiArr.length; i++) {
    for (let j = i + 1; j < zhiArr.length; j++) {
      if (LIU_CHONG[zhiArr[i].zhi] === zhiArr[j].zhi) {
        results.push({ type: '六冲', zhi: [zhiArr[i].zhi, zhiArr[j].zhi], pillars: [zhiArr[i].name, zhiArr[j].name] })
      }
    }
  }

  // 三合 (简化为检测是否存在半合)
  const SAN_HE_MAP: Record<string, string> = { '申':'子辰','子':'申辰','辰':'申子','寅':'午戌','午':'寅戌','戌':'寅午','巳':'酉丑','酉':'巳丑','丑':'巳酉','亥':'卯未','卯':'亥未','未':'亥卯' }
  // 六合
  const LIU_HE: Record<string, string> = { '子':'丑','寅':'亥','卯':'戌','辰':'酉','巳':'申','午':'未' }
  for (let i = 0; i < zhiArr.length; i++) {
    for (let j = i + 1; j < zhiArr.length; j++) {
      if (LIU_HE[zhiArr[i].zhi] === zhiArr[j].zhi) {
        const heName = `${zhiArr[i].zhi}${zhiArr[j].zhi}`
        let detail = ''
        const heMap: Record<string, string> = {
          '子丑':'合土','寅亥':'合木','卯戌':'合火','辰酉':'合金','巳申':'合水','午未':'合土'
        }
        detail = heMap[heName] || ''
        results.push({ type: '六合', zhi: [zhiArr[i].zhi, zhiArr[j].zhi], pillars: [zhiArr[i].name, zhiArr[j].name], detail })
      }
    }
  }

  // 三刑
  const SAN_XING: Record<string, { type: string; partners: string[] }> = {
    '寅': { type: '无礼之刑', partners: ['巳'] },
    '巳': { type: '无礼之刑', partners: ['寅', '申'] },
    '申': { type: '无礼之刑', partners: ['巳'] },
    '丑': { type: '无恩之刑', partners: ['未', '戌'] },
    '未': { type: '无恩之刑', partners: ['丑', '戌'] },
    '戌': { type: '无恩之刑', partners: ['丑', '未'] },
  }
  for (let i = 0; i < zhiArr.length; i++) {
    for (let j = i + 1; j < zhiArr.length; j++) {
      const xing = SAN_XING[zhiArr[i].zhi]
      if (xing && xing.partners.includes(zhiArr[j].zhi)) {
        results.push({ type: `相刑`, zhi: [zhiArr[i].zhi, zhiArr[j].zhi], pillars: [zhiArr[i].name, zhiArr[j].name], detail: xing.type })
      }
    }
  }

  // 自刑
  for (let i = 0; i < zhiArr.length; i++) {
    for (let j = i + 1; j < zhiArr.length; j++) {
      if (zhiArr[i].zhi === zhiArr[j].zhi && ['辰','午','酉','亥'].includes(zhiArr[i].zhi)) {
        results.push({ type: '自刑', zhi: [zhiArr[i].zhi, zhiArr[j].zhi], pillars: [zhiArr[i].name, zhiArr[j].name] })
      }
    }
  }

  // 六害
  const LIU_HAI: Record<string, string> = { '子':'未','丑':'午','寅':'巳','卯':'辰','申':'亥','酉':'戌' }
  for (let i = 0; i < zhiArr.length; i++) {
    for (let j = i + 1; j < zhiArr.length; j++) {
      if (LIU_HAI[zhiArr[i].zhi] === zhiArr[j].zhi) {
        results.push({ type: '六害', zhi: [zhiArr[i].zhi, zhiArr[j].zhi], pillars: [zhiArr[i].name, zhiArr[j].name] })
      }
    }
  }

  return results
}

// ====== 天干关系（合克） ======
interface GanRelation {
  type: string
  gan: string[]
  pillars: string[]
  detail?: string
}

export function detectGanRelations(pillars: Record<string, string>): GanRelation[] {
  const results: GanRelation[] = []
  const names = ['年', '月', '日', '时']
  const ganArr = names.map(n => ({ name: n, gan: pillars[n] }))

  // 天干五合
  const WU_HE: Record<string, string> = { '甲':'己','乙':'庚','丙':'辛','丁':'壬','戊':'癸' }
  for (let i = 0; i < ganArr.length; i++) {
    for (let j = i + 1; j < ganArr.length; j++) {
      if (WU_HE[ganArr[i].gan] === ganArr[j].gan) {
        const heResult: Record<string, string> = { '甲己':'化土','乙庚':'化金','丙辛':'化水','丁壬':'化木','戊癸':'化火' }
        results.push({ type: '天干五合', gan: [ganArr[i].gan, ganArr[j].gan], pillars: [ganArr[i].name, ganArr[j].name], detail: heResult[`${ganArr[i].gan}${ganArr[j].gan}`] || '' })
      }
    }
  }

  // 天干相克
  const KE: Record<string, string[]> = { '甲':['戊','己'],'乙':['戊','己'],'丙':['庚','辛'],'丁':['庚','辛'],'戊':['壬','癸'],'己':['壬','癸'],'庚':['甲','乙'],'辛':['甲','乙'],'壬':['丙','丁'],'癸':['丙','丁'] }
  for (let i = 0; i < ganArr.length; i++) {
    for (let j = i + 1; j < ganArr.length; j++) {
      if ((KE[ganArr[i].gan] || []).includes(ganArr[j].gan)) {
        results.push({ type: '天干相克', gan: [ganArr[i].gan, ganArr[j].gan], pillars: [ganArr[i].name, ganArr[j].name], detail: `${ganArr[i].gan}克${ganArr[j].gan}` })
      }
    }
  }

  return results
}

// ====== 整柱判定（盖头/截脚） ======
export function judgePillars(pillars: Record<string, { gan: string; zhi: string }>): { pillar: string; gan: string; zhi: string; verdict: string }[] {
  const results: { pillar: string; gan: string; zhi: string; verdict: string }[] = []
  const keys = ['年', '月', '日', '时']
  for (const p of keys) {
    const pData = pillars[p]
    if (!pData) continue
    const wxG = WX_MAP[pData.gan]
    const wxZ = WX_MAP[pData.zhi]
    let verdict = ''
    if (wxG === wxZ) verdict = '天地同气'
    else if ((wxG === '木' && (wxZ === '土' || wxZ === '金')) ||
             (wxG === '火' && (wxZ === '水' || wxZ === '金')) ||
             (wxG === '土' && wxZ === '木') ||
             (wxG === '金' && wxZ === '火') ||
             (wxG === '水' && wxZ === '土')) verdict = '截脚'
    else if ((wxZ === '木' && (wxG === '土' || wxG === '金')) ||
             (wxZ === '火' && (wxG === '水' || wxG === '金')) ||
             (wxZ === '土' && wxG === '木') ||
             (wxZ === '金' && wxG === '火') ||
             (wxZ === '水' && wxG === '土')) verdict = '盖头'
    else verdict = `${wxZ}生${wxG}` === `${wxZ}生${wxG}` ? '地支生天干' : '天干生地支'
    results.push({ pillar: p, gan: pData.gan, zhi: pData.zhi, verdict })
  }
  return results
}

// ====== 调候用神 ======
const TIAO_HOU: Record<string, Record<string, string[]>> = {
  '甲': { '寅':['丙','癸'],'卯':['庚','丙','丁'],'辰':['庚','丁','壬'],'巳':['庚','壬','癸'],'午':['癸','庚','壬'],'未':['癸','庚','丁'],'申':['庚','丁','壬'],'酉':['辛','丁','丙'],'戌':['辛','庚','丁'],'亥':['庚','丙','戊'],'子':['丁','丙'],'丑':['丁','丙'] },
  '乙': { '寅':['丙','癸'],'卯':['丙','癸'],'辰':['癸','丙','戊'],'巳':['癸','壬'],'午':['癸','丙'],'未':['癸','丙'],'申':['癸','丙','丁'],'酉':['癸','丙','丁'],'戌':['辛','丙','癸'],'亥':['丙','戊','乙'],'子':['丙'],'丑':['丙'] },
  '丙': { '寅':['壬','庚'],'卯':['壬','庚'],'辰':['壬','庚'],'巳':['壬','庚'],'午':['壬','庚'],'未':['壬','庚'],'申':['壬','庚'],'酉':['壬','庚'],'戌':['甲','壬'],'亥':['甲','壬','庚'],'子':['甲','壬','庚'],'丑':['甲','壬','庚'] },
  '丁': { '寅':['甲','庚','丙'],'卯':['甲','庚','丙'],'辰':['甲','庚'],'巳':['甲','庚'],'午':['壬','甲','庚'],'未':['甲','壬','庚'],'申':['甲','庚','丙'],'酉':['甲','庚','丙'],'戌':['甲','庚'],'亥':['甲','庚'],'子':['甲','庚'],'丑':['甲','庚'] },
  '戊': { '寅':['丙','甲','癸'],'卯':['丙','甲','癸'],'辰':['甲','丙','癸'],'巳':['甲','丙','癸'],'午':['壬','甲','丙'],'未':['癸','丙','甲'],'申':['癸','丙','甲'],'酉':['丙','癸'],'戌':['甲','丙','癸'],'亥':['甲','丙'],'子':['丙','甲'],'丑':['丙','甲'] },
  '己': { '寅':['丙','癸'],'卯':['丙','癸'],'辰':['丙','癸','甲'],'巳':['癸','丙'],'午':['癸','丙'],'未':['癸','丙'],'申':['癸','丙'],'酉':['癸','丙'],'戌':['丙','甲','癸'],'亥':['丙','甲'],'子':['丙','甲'],'丑':['丙','甲'] },
  '庚': { '寅':['丁','甲','丙'],'卯':['丁','甲','丙'],'辰':['甲','丁','壬'],'巳':['壬','丁','甲'],'午':['壬','丁','甲'],'未':['丁','甲','壬'],'申':['丁','甲','壬'],'酉':['丁','甲','丙'],'戌':['甲','丁','壬'],'亥':['丁','丙','甲'],'子':['丁','甲','丙'],'丑':['丁','甲','丙'] },
  '辛': { '寅':['壬','甲'],'卯':['壬','甲'],'辰':['壬','甲'],'巳':['壬','甲'],'午':['壬','己'],'未':['壬','甲','癸'],'申':['壬','甲'],'酉':['壬','甲'],'戌':['壬','甲'],'亥':['壬','丙'],'子':['丙','壬'],'丑':['丙','壬'] },
  '壬': { '寅':['庚','丙','戊'],'卯':['戊','庚','辛'],'辰':['甲','庚'],'巳':['壬','辛','庚'],'午':['癸','辛','庚'],'未':['辛','甲','癸'],'申':['戊','丁','庚'],'酉':['丁','戊','庚'],'戌':['甲','庚'],'亥':['庚','戊','丁'],'子':['戊','庚','丁'],'丑':['丙','丁','甲'] },
  '癸': { '寅':['辛','丙'],'卯':['丙','辛'],'辰':['甲','丙','戊'],'巳':['辛','甲'],'午':['庚','壬','辛'],'未':['庚','辛','壬'],'申':['丁','甲','庚'],'酉':['辛','丙','丁'],'戌':['辛','甲','壬'],'亥':['庚','戊','丁'],'子':['丙','丁','戊'],'丑':['丙','丁'] },
}

export function getTiaoHou(dayMaster: string, monthZhi: string): string[] {
  return TIAO_HOU[dayMaster]?.[monthZhi] || []
}

// ====== 格局 ======
interface GeJuResult {
  primary: string
  basis: string
  confidence: string
  notes: string[]
}

export function judgeGeJu(pillars: Record<string, { gan: string; zhi: string }>): GeJuResult {
  const monthGan = pillars['月']?.gan || ''
  const monthZhi = pillars['月']?.zhi || ''
  const dayGan = pillars['日']?.gan || ''
  const yearGan = pillars['年']?.gan || ''
  const hourGan = pillars['时']?.gan || ''

  // 月支藏干
  const hidden = HIDDEN_GAN[monthZhi] || ''
  const benQi = hidden[0] || ''
  const zhongQi = hidden[1] || ''
  const yuQi = hidden[2] || ''

  // 月令主气对应的十神
  const benQiSS = SS_MAP[dayGan]?.[benQi] || ''
  const zhongQiSS = zhongQi ? (SS_MAP[dayGan]?.[zhongQi] || '') : ''
  const yuQiSS = yuQi ? (SS_MAP[dayGan]?.[yuQi] || '') : ''

  // 透干检查
  const topGans = [yearGan, monthGan, hourGan]
  const touGan: string[] = []

  // 透干属于格局支的藏干
  if (topGans.includes(benQi)) touGan.push(benQi)
  if (zhongQi && topGans.includes(zhongQi)) touGan.push(zhongQi)
  if (yuQi && topGans.includes(yuQi)) touGan.push(yuQi)

  // 判断月令格局
  let primary = ''
  let basis = ''
  let notes: string[] = []

  if (benQiSS) {
    primary = `${benQiSS}格`
    basis = `月支${monthZhi}本气${benQi}(${benQiSS}) — ${hidden.length === 1 ? '纯气月支直接立格' : '以本气立格'}`
    if (touGan.length > 0) {
      basis += `，透干: ${touGan.join('、')}`
    }
  }

  // 特殊格局检测
  const allGans = [yearGan, monthGan, dayGan, hourGan]
  const allWuXing = allGans.map(g => WX_MAP[g])

  // 专旺格
  const wxCount: Record<string, number> = {}
  for (const wx of allWuXing) { wxCount[wx] = (wxCount[wx] || 0) + 1 }
  const dmWx = WX_MAP[dayGan]
  if (wxCount[dmWx] === 4) {
    const names: Record<string, string> = { '木':'曲直仁寿格','火':'炎上格','土':'稼穑格','金':'从革格','水':'润下格' }
    primary = names[dmWx] || primary
    basis = `四柱天干皆为${dmWx}，${primary}成立`
    notes.push('入专旺格，喜顺势，忌克破')
  }

  // 从格
  const monthWx = WX_MAP[monthZhi]
  const isAllKe = Object.values(wxCount).every((c, i) => i === 0 || c === 0) // simplified

  return { primary, basis, confidence: primary ? '高' : '中', notes }
}

// ====== 旺衰 ======
interface WangShuaiResult {
  score: number
  verdict: string
  breakdown: { 得令: number; 长生: number; 得地: number; 得势: number; details: string[] }
}

export function judgeWangShuai(pillars: Record<string, { gan: string; zhi: string }>): WangShuaiResult {
  const dayGan = pillars['日']?.gan || ''
  const monthZhi = pillars['月']?.zhi || ''

  // 得令 — 五行旺相休囚死得分系统
  // 旺=10(当令), 相=6(月令所生), 休=3(生月令者), 囚=1(克月令者), 死=0(月令所克)
  // 寅卯=木旺, 巳午=火旺, 申酉=金旺, 亥子=水旺, 辰戌丑未=土旺
  //
  //      寅(木) 卯(木) 巳(火) 午(火) 申(金) 酉(金) 亥(水) 子(水) 辰(土) 戌(土) 丑(土) 未(土)
  const lingMap: Record<string, Record<string, number>> = {
    '甲': { '寅':10,'卯':10,'巳': 6,'午': 6,'申': 1,'酉': 1,'亥': 3,'子': 3,'辰': 0,'戌': 0,'丑': 0,'未': 0 },
    '乙': { '寅':10,'卯':10,'巳': 6,'午': 6,'申': 1,'酉': 1,'亥': 3,'子': 3,'辰': 0,'戌': 0,'丑': 0,'未': 0 },
    '丙': { '寅': 6,'卯': 6,'巳':10,'午':10,'申': 0,'酉': 0,'亥': 0,'子': 0,'辰': 3,'戌': 3,'丑': 3,'未': 3 },
    '丁': { '寅': 6,'卯': 6,'巳':10,'午':10,'申': 0,'酉': 0,'亥': 0,'子': 0,'辰': 3,'戌': 3,'丑': 3,'未': 3 },
    '戊': { '寅': 0,'卯': 0,'巳': 3,'午': 3,'申': 6,'酉': 6,'亥': 1,'子': 1,'辰':10,'戌':10,'丑':10,'未':10 },
    '己': { '寅': 0,'卯': 0,'巳': 3,'午': 3,'申': 6,'酉': 6,'亥': 1,'子': 1,'辰':10,'戌':10,'丑':10,'未':10 },
    '庚': { '寅': 1,'卯': 1,'巳': 0,'午': 0,'申':10,'酉':10,'亥': 6,'子': 6,'辰': 6,'戌': 6,'丑': 6,'未': 6 },
    '辛': { '寅': 1,'卯': 1,'巳': 0,'午': 0,'申':10,'酉':10,'亥': 6,'子': 6,'辰': 6,'戌': 6,'丑': 6,'未': 6 },
    '壬': { '寅': 3,'卯': 3,'巳': 1,'午': 1,'申': 6,'酉': 6,'亥':10,'子':10,'辰': 0,'戌': 0,'丑': 0,'未': 0 },
    '癸': { '寅': 3,'卯': 3,'巳': 1,'午': 1,'申': 6,'酉': 6,'亥':10,'子':10,'辰': 0,'戌': 0,'丑': 0,'未': 0 },
  }

  const deLing = lingMap[dayGan]?.[monthZhi] || 0

  // 长生
  const zsPillar = ZHANG_SHENG[dayGan]?.[pillars['月']?.zhi || ''] || ''
  const zsScore = ['长生','冠带','临官','帝旺'].includes(zsPillar) ? 6 : (['沐浴','衰','养'].includes(zsPillar) ? 3 : 0)

  // 得地 (simplified - 日支+时支 strength)
  let deDi = 0
  const diDetails: string[] = []
  for (const p of ['日', '时']) {
    const zhi = pillars[p]?.zhi || ''
    const zs = ZHANG_SHENG[dayGan]?.[zhi] || ''
    if (['临官','帝旺'].includes(zs)) { deDi += 2; diDetails.push(`${p}支${zhi}=${zs} +2`) }
    else if (['长生','冠带'].includes(zs)) { deDi += 1.2; diDetails.push(`${p}支${zhi}=${zs} +1.2`) }
    else if (['衰','墓','养'].includes(zs)) { deDi += 0.6; diDetails.push(`${p}支${zhi}=${zs} +0.6`) }
    // 藏干加分
    const hidden = HIDDEN_GAN[zhi] || ''
    for (const g of hidden) {
      if (WX_MAP[g] === WX_MAP[dayGan]) { deDi += 0.8; diDetails.push(`${p}支藏${g}(同五行) +0.8`); break }
    }
  }

  // 得势
  let deShi = 0
  const shiDetails: string[] = []
  const allGans = [pillars['年']?.gan || '', pillars['月']?.gan || '', pillars['日']?.gan || '', pillars['时']?.gan || '']
  for (const g of allGans) {
    if (g === dayGan) { deShi += 1; shiDetails.push(`${g}(比肩) +1`) }
    else if (WX_MAP[g] === WX_MAP[dayGan]) { deShi += 0.7; shiDetails.push(`${g}(同五行) +0.7`) }
  }

  const total = deLing + zsScore + deDi + deShi
  let verdict = ''
  if (total >= 20) verdict = '身强'
  else if (total >= 14) verdict = '偏强'
  else if (total >= 8) verdict = '中和'
  else if (total >= 3) verdict = '偏弱'
  else verdict = '身弱'

  return {
    score: total,
    verdict,
    breakdown: { 得令: deLing, 长生: zsScore, 得地: deDi, 得势: deShi, details: [...diDetails, ...shiDetails] }
  }
}

// ====== 主入口 ======
export interface SiZhuItem { gan: string; zhi: string }
export type SiZhuInput = Record<string, SiZhuItem>  // { '年':{gan,zhi}, '月':{gan,zhi}, '日':{gan,zhi}, '时':{gan,zhi} }

export interface EnrichResult {
  自坐: Record<string, string>
  五行旺相: Record<string, string>
  五行统计: WuXingStats
  调候用神: string[]
  格局: GeJuResult
  旺衰: WangShuaiResult
  天干关系: GanRelation[]
  地支关系: ZhiRelation[]
  整柱: { pillar: string; gan: string; zhi: string; verdict: string }[]
}

export function enrichBazi(siZhu: SiZhuInput): EnrichResult {
  const dm = siZhu['日'].gan
  const monthZhi = siZhu['月'].zhi

  // 自坐
  const ziZuo: Record<string, string> = {}
  for (const p of ['年', '月', '日', '时']) {
    ziZuo[p] = ZHANG_SHENG[siZhu[p].gan]?.[siZhu[p].zhi] || ''
  }

  return {
    自坐: ziZuo,
    五行旺相: wuXingMonthStatus(monthZhi),
    五行统计: countWuXing(siZhu, dm),
    调候用神: getTiaoHou(dm, monthZhi),
    格局: judgeGeJu(siZhu),
    旺衰: judgeWangShuai(siZhu),
    天干关系: detectGanRelations({ 年: siZhu['年'].gan, 月: siZhu['月'].gan, 日: siZhu['日'].gan, 时: siZhu['时'].gan }),
    地支关系: detectZhiRelations({ 年: siZhu['年'].zhi, 月: siZhu['月'].zhi, 日: siZhu['日'].zhi, 时: siZhu['时'].zhi }),
    整柱: judgePillars(siZhu),
  }
}

// ====== 测试 ======
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = enrichBazi({
    '年': { gan: '己', zhi: '卯' },
    '月': { gan: '丙', zhi: '子' },
    '日': { gan: '戊', zhi: '午' },
    '时': { gan: '戊', zhi: '午' },
  })
  console.log(JSON.stringify(test, null, 2))
}
