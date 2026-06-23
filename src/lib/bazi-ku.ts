/**
 * bazi-ku.ts — 库与同源判定
 *
 * 九宫高度分析体系核心基石：
 *
 * 四个土的本质：
 *   辰 = 水库     — 水(壬/癸/亥/子)的源头和归宿
 *   戌 = 火库     — 火(丙/丁/巳/午)的源头和归宿
 *   丑 = 金库     — 金(庚/辛/申/酉)的源头和归宿
 *   未 = 木库     — 木(甲/乙/寅/卯)的源头和归宿
 *
 * ========================================
 * 🔥 核心原则1：同源判定
 * ========================================
 * 亲密度从亲到疏：
 *   1. 同源 = 同一个库出来 — 亥见辰(水库) = 回家，最亲 (9/10)
 *   2. 同宫出 = 同一地支上的天干 — 同坐一宫的兄弟 (8/10)
 *   3. 血亲生 = 60甲子配对的支生干 — 先天血缘 (7/10)
 *   4. 合   = 不同源但有六合/五合 — 外部合作 (6/10)
 *   5. 跨柱生 = 非60甲子的支生干 — 帮助关系 (4/10)
 *   6. 同五行但不同源 — 老乡 (2/10)
 *   7. 无关系 — 陌生人 (0/10)
 *
 * ========================================
 * 🔥 核心原则2：60甲子与血亲判定
 * ========================================
 * 60甲子中只有12对是"支生干"（地支生命天干），这些代表血缘关系：
 *   甲子(子生甲)、丙寅(寅生丙)、丁卯(卯生丁)、己巳(巳生己)
 *   辛未(未生辛)、壬申(申生壬)、癸酉(酉生癸)、乙亥(亥生乙)
 *   庚辰(辰生庚)、辛丑(丑生辛)、庚戌(戌生庚)、戊午(午生戊)
 *
 * 关键：
 *   - 辛未一柱才说明"未土生辛金是血亲"
 *   - 庚辰一柱才说明"辰土生庚金是血亲"
 *   - 只有"天干坐某个地支"在60甲子中存在，才是血缘关系
 *   - 跨柱的生（如年支生月干）只是合作关系
 *     （60甲子里只有辛未，没有辛辰；只有庚辰，没有庚未）
 */

// ===== 类型定义 =====

/** 库类型 */
export type KuType = '水库' | '火库' | '金库' | '木库' | '土本身' | '无'

/** 亲密类型 */
export type QinmiType = '同源' | '同宫出' | '血亲生' | '合' | '跨柱生' | '同五行' | '陌生人'

/** 亲密度等级 */
export type QinmiLevel =
  | '一家亲'       // 同源 — 同一个库出来，如亥见辰
  | '亲兄弟'       // 同宫出 — 同一个地支坐的天干
  | '血亲'         // 血亲生 — 60甲子支生干，先天血缘（如辛未、庚辰）
  | '本家人'       // 合 — 不同源但合了，合作亲密
  | '亲戚'         // 跨柱生 — 非60甲子的帮助关系
  | '老乡'         // 同五行 — 碰巧一样但出处不同
  | '陌生人'       // 没关系

/** 亲密度评分 */
export interface QinmiScore {
  level: QinmiLevel        // 等级标签
  score: number            // 0-10 量化分
  type: QinmiType          // 亲密类型
  ku: string               // 本库（如'辰'）
  description: string      // 文字描述
  canDirectParticipate: boolean  // 能否直接参与
  priority: number         // 择食优先级（1=最高，5=最低）
}

// ===== 常量 =====

/**
 * 天地五行 → 本库映射
 *
 * 每个五行（及对应的天干地支）的"老家"是哪个库
 */
export const KU_MAP: Record<string, string> = {
  // 水 → 辰（水库）
  '壬': '辰', '癸': '辰',
  '亥': '辰', '子': '辰',
  // 火 → 戌（火库）
  '丙': '戌', '丁': '戌',
  '巳': '戌', '午': '戌',
  // 金 → 丑（金库）
  '庚': '丑', '辛': '丑',
  '申': '丑', '酉': '丑',
  // 木 → 未（木库）
  '甲': '未', '乙': '未',
  '寅': '未', '卯': '未',
  // 土 → 本身（各有所属）
  '戊': '戊', '己': '己',
  '辰': '辰', '戌': '戌', '丑': '丑', '未': '未',
}

// ===== 60甲子血亲配对 =====

/**
 * 60甲子中"支生干"（地支生天干）的配对
 * 只有这些配对才是血亲关系，跨柱的生只是合作
 *
 * 庚→辰,戌  | 辛→未,丑  | 其他天干各有一个血亲地支
 */
export const BLOOD_JIAZI_PAIRS: Record<string, string[]> = {
  '甲': ['子'],
  '乙': ['亥'],
  '丙': ['寅'],
  '丁': ['卯'],
  '戊': ['午'],
  '己': ['巳'],
  '庚': ['辰', '戌'],
  '辛': ['未', '丑'],
  '壬': ['申'],
  '癸': ['酉'],
}

/** 反查：某个地支是哪些天干的血亲地支 */
export const BLOOD_ZHI_MAP: Record<string, string[]> = {}
for (const [gan, zhis] of Object.entries(BLOOD_JIAZI_PAIRS)) {
  for (const z of zhis) {
    if (!BLOOD_ZHI_MAP[z]) BLOOD_ZHI_MAP[z] = []
    BLOOD_ZHI_MAP[z].push(gan)
  }
}

/**
 * 判断天干坐这个地支是否是60甲子血亲关系
 * 即：这个干支配对在60甲子中，且地支生天干
 * 
 * 例如：辛+未 → true（辛未，未土生辛金血亲）
 *      辛+辰 → false（辛辰不在60甲子中）
 *      庚+辰 → true（庚辰，辰土生庚金血亲）
 */
export function isBloodJiaZi(gan: string, zhi: string): boolean {
  const bloodZhis = BLOOD_JIAZI_PAIRS[gan]
  if (!bloodZhis) return false
  return bloodZhis.includes(zhi)
}

/** 获取某个天干的血亲地支列表 */
export function getBloodZhi(gan: string): string[] {
  return BLOOD_JIAZI_PAIRS[gan] || []
}

/** 库类型描述 */
export function getKuType(zhi: string): KuType {
  switch (zhi) {
    case '辰': return '水库'
    case '戌': return '火库'
    case '丑': return '金库'
    case '未': return '木库'
    default:
      // 非库地支
      if (['戊', '己'].includes(zhi)) return '土本身'
      return '无'
  }
}

/** 五行对应的库类型说明 */
export function getKuDescription(ganOrZhi: string): string {
  const ku = KU_MAP[ganOrZhi]
  if (!ku) return '无'
  const kuType = getKuType(ku)
  return `${ganOrZhi} → 本库为${ku}（${kuType}）`
}

/** 获取某个字的本库 */
export function getBenKu(ganOrZhi: string): string {
  return KU_MAP[ganOrZhi] || ''
}

/** 判断两个地支是否为同一库 */
export function isSameKu(a: string, b: string): boolean {
  const kuA = getBenKu(a)
  const kuB = getBenKu(b)
  return kuA !== '' && kuA === kuB
}

/** 判断一个字是否属于某个库（即该库是不是它的本库） */
export function belongsToKu(ganOrZhi: string, kuZhi: string): boolean {
  return getBenKu(ganOrZhi) === kuZhi
}

/**
 * 判断地支的藏干中，哪些和某个字同源
 *
 * 核心：一个地支的藏干中，可能既有和这个字同源的，也有不同源的。
 * 比如辰土藏干戊乙癸：
 *   - 对亥水（水）：癸水同源（同为水库）
 *   - 对卯木（木）：乙木不同源（卯木本库是未）
 *   - 对午火（火）：无同源
 *
 * 这决定了亲密度——该字和这个地支的亲密度有多高。
 */
export function findSameSourceInZhi(ganOrZhi: string, zhi: string): string[] {
  const hiddenStems: Record<string, string> = {
    '子': '癸', '丑': '己癸辛', '寅': '甲丙戊', '卯': '乙',
    '辰': '戊乙癸', '巳': '丙庚戊', '午': '丁己', '未': '己丁乙',
    '申': '庚壬戊', '酉': '辛', '戌': '戊辛丁', '亥': '壬甲',
  }

  const ku = getBenKu(ganOrZhi)
  if (!ku) return []

  const hidden = hiddenStems[zhi] || ''
  const result: string[] = []

  for (const h of hidden) {
    if (getBenKu(h) === ku) {
      result.push(h)
    }
  }

  return result
}

// ===== 亲密度判定 =====

/**
 * 分析两个字（天干/地支）之间的亲密度
 *
 * 🔥 核心原则（2026-06-23教学更新）：
 *   1. 同源（同一个库）→ 一家亲 (9/10)
 *   2. 同宫出（同一地支）→ 亲兄弟 (8/10)
 *   3. 血亲生（60甲子支生干）→ 血亲 (7/10)  ← 新增
 *   4. 有合（地支六合/天干五合）→ 本家人 (6/10)
 *   5. 跨柱生（跨柱的生）→ 亲戚 (4/10)      ← 从普通生降级
 *   6. 同五行 → 老乡 (2/10)
 *   7. 无关系 → 陌生人 (0/10)
 *
 * 关键认知：
 *   - 60甲子配对中的"支生干"才是血缘关系
 *     （如辛未=未生辛金血亲，庚辰=辰生庚金血亲）
 *   - 跨柱的"生"只是合作关系，不是血缘
 *     （60甲子里只有辛未没有辛辰，只有庚辰没有庚未）
 *
 * @param a 天干或地支（如'辛'或'未'）
 * @param b 天干或地支
 * @param extra 额外信息（同宫、合、生、跨柱等）
 */
export function analyzeQinmi(
  a: string,
  b: string,
  extra?: {
    sameGong?: boolean     // 是否同宫出
    he?: boolean           // 是否有合
    sheng?: boolean        // 是否有生（五行相生）
    isCrossPillar?: boolean // 是否是跨柱关系（非同一柱天干通根）
  }
): QinmiScore {
  const kuA = getBenKu(a)
  const kuB = getBenKu(b)

  // 1. 🏆 同源检测（同一个库）
  if (kuA && kuB && kuA === kuB) {
    return {
      level: '一家亲',
      score: 9,
      type: '同源',
      ku: kuA,
      description: `${a}和${b}同源（本库${kuA}），一家人`,
      canDirectParticipate: true,
      priority: 1,
    }
  }

  // 2. 🥇 同宫出
  if (extra?.sameGong) {
    return {
      level: '亲兄弟',
      score: 8,
      type: '同宫出',
      ku: '',
      description: `${a}和${b}同宫出，亲兄弟`,
      canDirectParticipate: true,
      priority: 2,
    }
  }

  // 3. 🩸 血亲生：判断60甲子支生干（血亲关系）
  //    只有a是天干、b是地支，且a+b在60甲子中存在为支生干，才是血亲
  if (extra?.sheng && !extra?.isCrossPillar) {
    const isBlood = isBloodJiaZi(a, b)
    if (isBlood) {
      return {
        level: '血亲',
        score: 7,
        type: '血亲生',
        ku: '',
        description: `${a}${b}在60甲子中为支生干，${a}和${b}是血亲关系（${b}生${a}）`,
        canDirectParticipate: true,
        priority: 3,
      }
    }
  }

  // 4. 🤝 有合
  if (extra?.he) {
    return {
      level: '本家人',
      score: 6,
      type: '合',
      ku: '',
      description: `${a}和${b}不同源但有合，合作亲密`,
      canDirectParticipate: true,
      priority: 4,
    }
  }

  // 5. 🤲 跨柱生（非60甲子的普通生）
  if (extra?.sheng) {
    return {
      level: '亲戚',
      score: 4,
      type: '跨柱生',
      ku: '',
      description: `${a}和${b}跨柱相生，亲戚式帮助（非血亲）`,
      canDirectParticipate: false,
      priority: 5,
    }
  }

  // 6. 同五行（宽泛判断：本库类型相同）
  const kuTypeA = getKuType(kuA)
  const kuTypeB = getKuType(kuB)
  if (kuTypeA === kuTypeB && kuTypeA !== '无' && kuTypeA !== '土本身') {
    return {
      level: '老乡',
      score: 2,
      type: '同五行',
      ku: '',
      description: `${a}和${b}同五行但不同源，老乡关系`,
      canDirectParticipate: false,
      priority: 6,
    }
  }

  // 7. 陌生人
  return {
    level: '陌生人',
    score: 0,
    type: '陌生人',
    ku: '',
    description: `${a}和${b}无直接关系`,
    canDirectParticipate: false,
    priority: 7,
  }
}

/**
 * 择食分析 —— 多个选项中，日主优先选哪个？
 *
 * 人性选择原则（2026-06-23 更新）：
 *   1. 先选同源的（同一库）
 *   2. 再选同宫出的
 *   3. 再选血亲生的（60甲子支生干）
 *   4. 再选有合的
 *   5. 再选跨柱生的
 *   6. 最后选同五行的
 *
 * 如果都是同源的，选根气更强的
 *
 * 🔥 关键：择食时，血亲生的优先级比合高，
 *    但跨柱生（非60甲子）比合低
 */
export function zeShiPriority(
  dm: string,                   // 日主
  candidates: {
    zhi: string                 // 候选地支
    gong: string                // 宫位
    power: number               // 根气力量
    he: boolean                 // 与日主有合吗
    sheng: boolean              // 生日主吗（五行相生）
    sameGong: boolean           // 同宫出吗
    isCrossPillar?: boolean     // 是否是跨柱关系
  }[]
): {
  ranked: typeof candidates
  best: (typeof candidates)[0] | null
  reasons: string[]
} {
  const scored = candidates.map(c => {
    const qinmi = analyzeQinmi(dm, c.zhi, {
      sameGong: c.sameGong,
      he: c.he,
      sheng: c.sheng,
      isCrossPillar: c.isCrossPillar ?? false,
    })

    // 综合得分 = 亲密度分 + 根气修正 + 宫位修正
    let score = qinmi.score * 10  // 亲密度占大头
    score += c.power * 5          // 根气加成
    // 宫位修正：家里 > 家外
    if (['日', '时'].includes(c.gong)) score += 2
    if (c.gong === '月') score += 1

    return { ...c, _score: score, _qinmi: qinmi }
  })

  scored.sort((a, b) => b._score - a._score)

  const reasons: string[] = []
  for (const s of scored) {
    reasons.push(`${s.gong}支${s.zhi}: ${s._qinmi.description}（综合分${s._score.toFixed(1)}）`)
  }

  return {
    ranked: scored,
    best: scored.length > 0 ? scored[0] : null,
    reasons,
  }
}

// =================================================================
// 🔥 出处混分析（盲区4）
// =================================================================
//
// 核心概念：
// 1. 家里家外：日+时=家里，年+月=家外
// 2. 柱的力量：月>时>年>日
// 3. 真正强根 = 禄（本气），其次是本库，其次是藏干/余气
// 4. 出处在哪？真根在哪？家里有真根则独立，家外有真根则借根外人
// 5. 出处混 = 家里家外都有根，或真根与藏干混在，出处不纯

/** 根的类型 */
export type GenLevel = '真根' | '本库' | '藏干' | '余气'

/** 根的信息 */
export interface GenInfo {
  zhi: string           // 地支
  gong: string          // 宫位（年/月/日/时）
  level: GenLevel       // 根的类型
  power: number          // 根气力量 (0-1)
  isHome: boolean        // 是否在家里（日/时）
  pillarRank: number     // 柱的力量排名（1=月最大，4=日最小）
  description: string    // 文字描述
}

/** 出处混分析结果 */
export interface ChuChuHunResult {
  dm: string              // 日主
  allRoots: GenInfo[]     // 所有根
  luRootsAtHome: GenInfo[]        // 家里的禄根
  luRootsOutside: GenInfo[]       // 家外的禄根
  kuRootsAtHome: GenInfo[]        // 家里的本库
  kuRootsOutside: GenInfo[]       // 家外的本库
  hasLuAtHome: boolean            // 家里有禄？
  hasLuOutside: boolean           // 家外有禄？
  hasKu: boolean                  // 有本库？

  // 混局判断
  isHun: boolean                   // 是否出处混
  hunType: '纯净' | '家外借根' | '双线借根' | '出处混'
  borrowFrom: string              // 借根哪一柱
  description: string             // 完整描述
  analysis: string[]              // 逐条分析
}

/** 柱的力量排序（1=最大） */
const PILLAR_POWER: Record<string, number> = {
  '月': 1,
  '时': 2,
  '年': 3,
  '日': 4,
}

/** 天干五行 */
const GAN_WX: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
}

/** 天干的禄（本气根所在的地支） */
const GAN_LU: Record<string, string> = {
  '甲': '寅', '乙': '卯',
  '丙': '巳', '丁': '午',
  '戊': '巳', '己': '午',
  '庚': '申', '辛': '酉',
  '壬': '亥', '癸': '子',
}

/** 五行旺地（本气最旺的地支，不分阴阳）
 *  如火日主（不论丙丁），午和巳都是真根
 *  水日主（不论壬癸），亥和子都是真根
 */
const ELEMENT_STRONG_ROOTS: Record<string, string[]> = {
  '水': ['亥', '子'],
  '火': ['巳', '午'],
  '金': ['申', '酉'],
  '木': ['寅', '卯'],
  '土': ['辰', '戌', '丑', '未'],  // 土的特殊：库土本身
}

/** 地支藏干（本气-中气-余气） */
const HIDDEN_GAN: Record<string, string> = {
  '子': '癸', '丑': '己癸辛', '寅': '甲丙戊', '卯': '乙',
  '辰': '戊乙癸', '巳': '丙庚戊', '午': '丁己', '未': '己丁乙',
  '申': '庚壬戊', '酉': '辛', '戌': '戊辛丁', '亥': '壬甲',
}

/**
 * 获取某个天干在某个地支的根信息
 * 判定逻辑：
 *   1. 禄（本气）= 真根 (power 1.0)
 *   2. 本库 = 同源真根 (power 0.8)
 *   3. 藏干本气匹配 (power 0.6)
 *   4. 藏干中气匹配 (power 0.4)
 *   5. 藏干余气匹配 (power 0.3)
 *   6. 同源字在藏干中 (power 0.2-0.4)
 *
 * 注意：血亲（60甲子支生干）不是根判定，是亲密度判定
 */
function getGenLevel(gan: string, zhi: string): { level: GenLevel; power: number } | null {
  const ganLu = GAN_LU[gan]
  const hidden = HIDDEN_GAN[zhi] || ''

  // 1. 🔥 真根 = 五行旺地（本气最旺的地支，不分阴阳）
  //    火日主(不管丙丁)：午/巳都是真根
  //    水日主(不管壬癸)：亥/子都是真根
  const wx = GAN_WX[gan]  // 天干的五行
  const strongRoots = ELEMENT_STRONG_ROOTS[wx]
  if (strongRoots && strongRoots.includes(zhi)) {
    return { level: '真根', power: 1.0 }
  }

  // 2. 本库 = 同源真根（辰戌丑未中的本库）
  //    如壬水在辰(水库)，酉金在丑(金库)
  if (['辰','戌','丑','未'].includes(zhi) && getBenKu(gan) === zhi) {
    return { level: '本库', power: 0.8 }
  }

  // 3. 藏干匹配：这个天干直接出现在地支的藏干中
  if (hidden.includes(gan)) {
    if (hidden[0] === gan) return { level: '藏干', power: 0.6 }  // 本气
    if (hidden[1] === gan) return { level: '藏干', power: 0.4 }  // 中气
    if (hidden[2] === gan) return { level: '藏干', power: 0.3 }  // 余气
  }

  // 4. 同源检测（藏干中是否有同源的字）
  // 比如壬(水)在辰(水库)的藏干戊乙癸中找到癸(水)，同源
  const ganKu = getBenKu(gan)
  if (ganKu && ['辰','戌','丑','未'].includes(zhi)) {
    for (const h of hidden) {
      if (getBenKu(h) === ganKu && h !== gan) {
        let power = 0.3
        if (hidden[0] === h) power = 0.4   // 同源在本气位置
        else if (hidden[1] === h) power = 0.3  // 同源在中气位置
        else power = 0.2  // 同源在余气位置
        return { level: '余气', power }
      }
    }
  }

  return null
}

/**
 * 分析某个天干在四柱中的出处混情况
 *
 * @param dm 天干（通常是日主）
 * @param siZhu 四柱
 * @returns 出处混分析结果
 */
export function analyzeChuChuHun(
  dm: string,
  siZhu: Record<string, { gan: string; zhi: string }>
): ChuChuHunResult {
  const gongNames = ['年', '月', '日', '时']
  const allRoots: GenInfo[] = []

  // 遍历四柱找根
  for (const g of gongNames) {
    const p = siZhu[g]
    if (!p) continue
    const info = getGenLevel(dm, p.zhi)
    if (info) {
      allRoots.push({
        zhi: p.zhi,
        gong: g,
        level: info.level,
        power: info.power,
        isHome: ['日', '时'].includes(g),
        pillarRank: PILLAR_POWER[g],
        description: `${dm}在${g}支${p.zhi}为${info.level}`,
      })
    }
  }

  // 综合力量排序 = 柱的权重 × 根的力量
  // 月柱权重最高，其次是时、年、日
  // 再叠加根的种类系数
  const PILLAR_WEIGHT: Record<string, number> = { '月': 1.0, '时': 0.85, '年': 0.6, '日': 0.5 }
  const GEN_WEIGHT: Record<GenLevel, number> = { '真根': 1.0, '本库': 0.85, '藏干': 0.6, '余气': 0.35 }
  allRoots.sort((a, b) => {
    const scoreA = PILLAR_WEIGHT[a.gong] * (a.power * GEN_WEIGHT[a.level])
    const scoreB = PILLAR_WEIGHT[b.gong] * (b.power * GEN_WEIGHT[b.level])
    return scoreB - scoreA
  })

  // 🔥 真正的强根 = 只有禄（本气），如午/巳对火，亥/子对水
  // 本库（辰戌丑未）是第二档，不是真正强根
  const luRootsAtHome = allRoots.filter(r => r.isHome && r.level === '真根')
  const luRootsOutside = allRoots.filter(r => !r.isHome && r.level === '真根')
  const kuRootsAtHome = allRoots.filter(r => r.isHome && r.level === '本库')
  const kuRootsOutside = allRoots.filter(r => !r.isHome && r.level === '本库')

  const hasLuAtHome = luRootsAtHome.length > 0
  const hasLuOutside = luRootsOutside.length > 0
  const hasKu = kuRootsAtHome.length > 0 || kuRootsOutside.length > 0

  // 判定出处混
  let isHun = false
  let hunType: ChuChuHunResult['hunType'] = '纯净'
  const analysis: string[] = []

  const genLabel = (level: GenLevel) => {
    const labels: Record<GenLevel, string> = { '真根': '禄', '本库': '本库', '藏干': '藏干', '余气': '余气' }
    return labels[level]
  }

  // 根的总览
  if (allRoots.length === 0) {
    analysis.push(`${dm}在原局中无任何根，完全无出处`)
    isHun = true
    hunType = '出处混'
  } else {
    for (const r of allRoots) {
      const loc = r.isHome ? '🏠家里' : '🌍家外'
      const tag = r.level === '真根' ? '✅' : r.level === '本库' ? '📦' : r.level === '藏干' ? '🔹' : '◽'
      analysis.push(`  ${tag} ${r.gong}柱${loc}的${r.zhi}：${genLabel(r.level)}（power=${r.power}）`)
    }
  }

  const bestRoot = allRoots[0]

  // 层次1：家里有禄（午/巳等本气）→ 独立自强
  if (hasLuAtHome) {
    const lu = luRootsAtHome[0]
    analysis.push(`✅ 家里有${lu.gong}柱的${lu.zhi}（禄），自强的根！`)
    if (luRootsOutside.length > 0) {
      analysis.push(`  家外还有禄（${luRootsOutside.map(r => r.gong + '支' + r.zhi).join('、')}），内外都有底气`)
    }
    if (kuRootsAtHome.length > 0 || kuRootsOutside.length > 0) {
      analysis.push(`  📦 另备本库（${[...kuRootsAtHome, ...kuRootsOutside].map(r => r.gong + '支' + r.zhi).join('、')}），不愁没地方待`)
    }
  }
  // 层次2：家里无禄，家外有禄 → 借根家外
  else if (!hasLuAtHome && hasLuOutside) {
    const lu = luRootsOutside[0]
    const homeRoots = allRoots.filter(r => r.isHome)
    if (homeRoots.length > 0) {
      analysis.push(`⚠️ 家里无禄（真根），只有${homeRoots.map(r => r.zhi + '(' + genLabel(r.level) + ')').join('、')}`)
      analysis.push(`  家里这些做不了真正的根`)
    } else {
      analysis.push(`⚠️ 家里无任何根`)
    }
    analysis.push(`  禄在${lu.gong}柱${lu.zhi}（家外），真正借根在此`)
    isHun = true
    hunType = '家外借根'
  }
  // 层次3：有本库但无禄 → 退而求其次
  else if (!hasLuAtHome && !hasLuOutside && hasKu) {
    const bestKu = [...kuRootsAtHome, ...kuRootsOutside][0]
    analysis.push(`⚠️ 原局无禄（无午/巳等本气真正的根）`)
    analysis.push(`  退而求其次，靠本库（${bestKu.gong}柱${bestKu.zhi}）做根`)
    if (bestKu.isHome) {
      analysis.push(`  📦 本库在家，虽非禄根但也有底气`)
    } else {
      analysis.push(`  🌍 本库在家外，借库藏身`)
    }
    isHun = true
    hunType = '家外借根'
  }
  // 层次4：只有藏干/余气 → 更弱
  else {
    analysis.push(`⚠️ 原局中无真正强根，只能靠藏干/余气凑合做根`)
    isHun = true
    hunType = '出处混'
  }
  
  // 家中已有禄根，家外本库/藏干只是资源补充，不构成混

  // 主力根描述
  const bestDesc = bestRoot
    ? `主力根：${bestRoot.gong}柱${bestRoot.zhi}（${genLabel(bestRoot.level)}，power=${bestRoot.power}）${bestRoot.isHome ? '🏠家中' : '🌍家外'}`
    : '无根'

  analysis.push('')
  analysis.push(bestDesc)

  // 借根来源描述
  let borrowFrom = ''
  if (hunType === '家外借根' && luRootsOutside.length > 0) {
    borrowFrom = luRootsOutside[0].gong
  } else if (hunType === '家外借根' && kuRootsOutside.length > 0 && luRootsOutside.length === 0) {
    borrowFrom = kuRootsOutside[0].gong
  }

  return {
    dm,
    allRoots,
    luRootsAtHome,
    luRootsOutside,
    kuRootsAtHome,
    kuRootsOutside,
    hasLuAtHome,
    hasLuOutside,
    hasKu,
    isHun,
    hunType,
    borrowFrom,
    description: analysis.join('\n'),
    analysis,
  }
}

// ===== 测试 =====

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('='.repeat(60))
  console.log('库亲密度测试')
  console.log('='.repeat(60))
  console.log('')

  // 1. 测试本库映射
  console.log('【本库映射】')
  for (const g of ['亥', '子', '壬', '癸', '巳', '午', '丙', '丁', '申', '酉', '庚', '辛', '寅', '卯', '甲', '乙', '辰', '戌', '丑', '未']) {
    console.log(`  ${g} → 本库${getBenKu(g) || '无'} (${getKuType(getBenKu(g))})`)
  }
  console.log('')

  // 2. 测试同源判定
  console.log('【同源判定】')
  console.log(`  亥 vs 辰: ${analyzeQinmi('亥', '辰').description} [${analyzeQinmi('亥', '辰').score}/10]`)
  console.log(`  亥 vs 戌: ${analyzeQinmi('亥', '戌', { he: true }).description} [${analyzeQinmi('亥', '戌', { he: true }).score}/10]`)
  console.log(`  午 vs 戌: ${analyzeQinmi('午', '戌').description} [${analyzeQinmi('午', '戌').score}/10]`)
  console.log(`  酉 vs 丑: ${analyzeQinmi('酉', '丑').description} [${analyzeQinmi('酉', '丑').score}/10]`)
  console.log(`  卯 vs 未: ${analyzeQinmi('卯', '未').description} [${analyzeQinmi('卯', '未').score}/10]`)
  console.log(`  辰 vs 酉: ${analyzeQinmi('辰', '酉', { sheng: true, isCrossPillar: true }).description} [${analyzeQinmi('辰', '酉', { sheng: true, isCrossPillar: true }).score}/10]`)
  console.log(`  辰 vs 亥: ${analyzeQinmi('辰', '亥').description} [${analyzeQinmi('辰', '亥').score}/10]`)
  console.log('')

  // 3. 测试60甲子血亲生
  console.log('【60甲子血亲生判定】')
  console.log(`  辛 vs 未: ${analyzeQinmi('辛', '未', { sheng: true }).description} [${analyzeQinmi('辛', '未', { sheng: true }).score}/10] ← 血缘`)
  console.log(`  辛 vs 辰: ${analyzeQinmi('辛', '辰', { sheng: true }).description} [${analyzeQinmi('辛', '辰', { sheng: true }).score}/10] ← 跨柱，非血缘`)
  console.log(`  庚 vs 辰: ${analyzeQinmi('庚', '辰', { sheng: true }).description} [${analyzeQinmi('庚', '辰', { sheng: true }).score}/10] ← 血缘`)
  console.log(`  庚 vs 未: ${analyzeQinmi('庚', '未', { sheng: true }).description} [${analyzeQinmi('庚', '未', { sheng: true }).score}/10] ← 跨柱，非血缘`)
  console.log(`  甲 vs 子: ${analyzeQinmi('甲', '子', { sheng: true }).description} [${analyzeQinmi('甲', '子', { sheng: true }).score}/10] ← 血缘`)
  console.log(`  乙 vs 亥: ${analyzeQinmi('乙', '亥', { sheng: true }).description} [${analyzeQinmi('乙', '亥', { sheng: true }).score}/10] ← 血缘`)
  console.log(`  壬 vs 申: ${analyzeQinmi('壬', '申', { sheng: true }).description} [${analyzeQinmi('壬', '申', { sheng: true }).score}/10] ← 血缘`)
  console.log(`  壬 vs 辰: ${analyzeQinmi('壬', '辰', { sheng: true }).description} [${analyzeQinmi('壬', '辰', { sheng: true }).score}/10] ← 同源优先于生！`)
  console.log('')

  // 4. 测试择食优先级（含血亲生）
  console.log('【择食优先级（亥日主）】')
  const testDm = '亥'
  const testCandidates = [
    { zhi: '辰', gong: '年', power: 0.8, he: false, sheng: false, sameGong: false },
    { zhi: '子', gong: '日', power: 1.0, he: false, sheng: false, sameGong: false },
    { zhi: '戌', gong: '月', power: 0.5, he: true, sheng: false, sameGong: false },
  ]
  const priority = zeShiPriority(testDm, testCandidates)
  console.log(`日主：亥`)
  for (const r of priority.reasons) {
    console.log(`  ${r}`)
  }
  console.log(`→ 首选: ${priority.best ? priority.best.gong + '支' + priority.best.zhi : '无'}`)
  console.log('')

  // 5. 测试血亲生 vs 跨柱生择食
  console.log('【血亲生 vs 跨柱生择食（辛日主）】')
  const testBlood = zeShiPriority('辛', [
    { zhi: '未', gong: '年', power: 0.8, he: false, sheng: true, sameGong: false, isCrossPillar: false },
    { zhi: '辰', gong: '月', power: 0.6, he: false, sheng: true, sameGong: false, isCrossPillar: true },
    { zhi: '丑', gong: '日', power: 0.8, he: false, sheng: true, sameGong: false, isCrossPillar: false },
  ])
  console.log(`日主：辛`)
  for (const r of testBlood.reasons) {
    console.log(`  ${r}`)
  }
  console.log(`→ 首选: ${testBlood.best ? testBlood.best.gong + '支' + testBlood.best.zhi : '无'}`)
  console.log('')

  // 6. 测试原局案例：坤 壬申 庚戌 壬戌 甲辰
  console.log('【案例：坤 壬申 庚戌 壬戌 甲辰】')
  console.log('日主：壬')
  console.log(`  壬 vs 年支申: ${analyzeQinmi('壬', '申', { sheng: true }).description} ← 壬申血亲`)
  console.log(`  壬 vs 月支戌: ${analyzeQinmi('壬', '戌').description}`)
  console.log(`  壬 vs 日支戌: ${analyzeQinmi('壬', '戌').description}`)
  console.log(`  壬 vs 时支辰: ${analyzeQinmi('壬', '辰').description} ← 本库`)
  console.log('')
  console.log('择食分析（壬的根选项）：')
  const case1 = zeShiPriority('壬', [
    { zhi: '申', gong: '年', power: 1.0, he: false, sheng: true, sameGong: true, isCrossPillar: false },
    { zhi: '戌', gong: '月', power: 0.3, he: false, sheng: false, sameGong: false },
    { zhi: '戌', gong: '日', power: 0.3, he: false, sheng: false, sameGong: false },
    { zhi: '辰', gong: '时', power: 0.8, he: false, sheng: false, sameGong: false },
  ])
  for (const r of case1.reasons) {
    console.log(`  ${r}`)
  }
  console.log(`→ 首选: ${case1.best ? case1.best.gong + '支' + case1.best.zhi : '无'}`)
  console.log('')

  // 7. 🔥 出处混测试
  console.log('='.repeat(60))
  console.log('出处混分析')
  console.log('='.repeat(60))
  console.log('')

  const siZhu1 = {
    '年': { gan: '壬', zhi: '申' },
    '月': { gan: '庚', zhi: '戌' },
    '日': { gan: '壬', zhi: '戌' },
    '时': { gan: '甲', zhi: '辰' },
  }
  console.log('【案例1：坤 壬申 庚戌 壬戌 甲辰 — 壬日主】')
  const hun1 = analyzeChuChuHun('壬', siZhu1)
  console.log(`类型：${hun1.hunType}`)
  console.log(hun1.description)
  console.log('')

  // 火日主案例
  const siZhu2 = {
    '年': { gan: '甲', zhi: '午' },
    '月': { gan: '丙', zhi: '寅' },
    '日': { gan: '丙', zhi: '戌' },
    '时': { gan: '戊', zhi: '未' },
  }
  console.log('【案例2：乾 甲午 丙寅 丙戌 戊未 — 丙日主（家里无真根）】')
  const hun2 = analyzeChuChuHun('丙', siZhu2)
  console.log(`类型：${hun2.hunType}`)
  console.log(hun2.description)
  console.log('')

  // 庚日主案例
  const siZhu3 = {
    '年': { gan: '庚', zhi: '申' },
    '月': { gan: '庚', zhi: '辰' },
    '日': { gan: '庚', zhi: '戌' },
    '时': { gan: '辛', zhi: '丑' },
  }
  console.log('【案例3：乾 庚申 庚辰 庚戌 辛丑 — 庚日主（到处都是根）】')
  const hun3 = analyzeChuChuHun('庚', siZhu3)
  console.log(`类型：${hun3.hunType}`)
  console.log(hun3.description)
  console.log('')

  // 无根案例
  const siZhu4 = {
    '年': { gan: '戊', zhi: '辰' },
    '月': { gan: '己', zhi: '未' },
    '日': { gan: '乙', zhi: '酉' },
    '时': { gan: '庚', zhi: '寅' },
  }
  console.log('【案例4：坤 戊辰 己未 乙酉 庚寅 — 乙日主（无根）】')
  const hun4 = analyzeChuChuHun('乙', siZhu4)
  console.log(`类型：${hun4.hunType}`)
  console.log(hun4.description)
  console.log('')

  console.log('=== 测试完成 ===')
}
