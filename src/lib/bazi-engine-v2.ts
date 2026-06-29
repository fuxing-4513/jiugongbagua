/**
 * bazi-engine-v2.ts — 八字实战推理引擎 v2
 *
 * 基于九宫八字体系 29 条核心规则 + 6步推理法
 * ================================================
 *
 * 六步推理循环：
 *   1. 确定太极点 → 2. 找到关系链 → 3. 评估控制权
 *   → 4. 两象定一象 → 5. 换太极点 → 6. 还原人和事
 *
 * 整合模块：
 *   - 根双维度评估器
 *   - 关系链引擎（BFS多跳）
 *   - 控制权评估器
 *   - 两象定一象
 * 
 *   - 人事还原（十神→场景）
 *   - 大运评估四步法
 *   - 换象引擎
 */

import { isBloodJiaZi, getBenKu } from './bazi-ku'

// ============================================================
// 第〇部分：基础类型定义
// ============================================================

/** 柱结构 */
export interface Pillar {
  gan: string
  zhi: string
}

/** 四柱 */
export interface SiZhu {
  [key: string]: Pillar
  '年': Pillar
  '月': Pillar
  '日': Pillar
  '时': Pillar
}

/** 推理分析结果 */
export interface BaziAnalysis {
  /** 日主 */
  dm: string
  /** 原局四柱 */
  siZhu: SiZhu
  /** 根评估 */
  rootEval: RootEvalResult
  /** 关系链分析 */
  chains: RelChainResult[]
  /** 控制权评估 */
  controls: ControlEval[]

  /** 换太极点分析 */
  taiJiPoints: TaiJiPointAnalysis[]
  /** 大运评估（如提供） */
  daYun: DaYunEval | null
  /** 流年/大运字 */
  currentYear?: string
  currentDaYun?: string
  /** 摘要 */
  summary: string[]
}

// ============================================================
// 第一部分：基础常量
// ============================================================

const GAN_WX: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
}

const ZHI_WX: Record<string, string> = {
  '寅': '木', '卯': '木', '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金', '亥': '水', '子': '水',
}

import { CANG_GAN as HIDDEN_GAN, DZ_LIUHE as LIU_HE, DZ_SANHE as SAN_HE, DZ_CHONG as LIU_CHONG, DZ_HAI as LIU_HAI } from './bazi-constants'

const GAN_LU: Record<string, string> = {
  '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午',
  '戊': '巳', '己': '午', '庚': '申', '辛': '酉',
  '壬': '亥', '癸': '子',
}

const WX_STRONG_ROOTS: Record<string, string[]> = {
  '水': ['亥', '子'], '火': ['巳', '午'], '金': ['申', '酉'],
  '木': ['寅', '卯'], '土': ['辰', '戌', '丑', '未'],
}

const KU_MAP: Record<string, string> = {
  '壬': '辰', '癸': '辰', '亥': '辰', '子': '辰',
  '丙': '戌', '丁': '戌', '巳': '戌', '午': '戌',
  '庚': '丑', '辛': '丑', '申': '丑', '酉': '丑',
  '甲': '未', '乙': '未', '寅': '未', '卯': '未',
  '戊': '戊', '己': '己',
  '辰': '辰', '戌': '戌', '丑': '丑', '未': '未',
}

const WX_SHENG: Record<string, string> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
}

const WX_KE: Record<string, string> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
}

// 三会
const SAN_HUI: Record<string, string[]> = {
  '亥': ['子', '丑'], '子': ['亥', '丑'], '丑': ['亥', '子'],
  '寅': ['卯', '辰'], '卯': ['寅', '辰'], '辰': ['寅', '卯'],
  '巳': ['午', '未'], '午': ['巳', '未'], '未': ['巳', '午'],
  '申': ['酉', '戌'], '酉': ['申', '戌'], '戌': ['申', '酉'],
}

// 刑
const XING_PAIRS: [string, string][] = [
  ['丑', '戌'], ['戌', '丑'], ['寅', '巳'], ['巳', '寅'],
  ['子', '卯'], ['卯', '子'], ['辰', '辰'], ['午', '午'],
  ['酉', '酉'], ['亥', '亥'],
]

// 天干五合
const WU_HE: Record<string, string> = {
  '甲': '己', '己': '甲', '乙': '庚', '庚': '乙',
  '丙': '辛', '辛': '丙', '丁': '壬', '壬': '丁',
  '戊': '癸', '癸': '戊',
}

// 九组自合
const ZI_HE: Record<string, boolean> = {
  '辛巳': true, '癸巳': true, '甲午': true, '己亥': true,
  '壬午': true, '戊子': true, '丙戌': true, '壬戌': true,
  '丁亥': true,
}

// ============================================================
// 第二部分：根的双维度评估（R8, R9, R26）
// ============================================================

type GenLevel = '禄' | '本库' | '藏干本气' | '藏干中气' | '藏干余气' | '同源余气'
type KuShiShen = '印库' | '食伤库' | '比劫库' | '财库' | '官杀库'

const GEN_POWER: Record<GenLevel, number> = {
  '禄': 1.0, '本库': 0.8, '藏干本气': 0.6,
  '藏干中气': 0.4, '藏干余气': 0.3, '同源余气': 0.2,
}

const PILLAR_WEIGHT: Record<string, number> = {
  '月': 1.0, '时': 0.85, '年': 0.6, '日': 0.5,
}

// 各五行日主的最佳库十神类型
const KU_SHI_SHEN: Record<string, Record<string, KuShiShen>> = {
  '木': { '辰': '印库', '未': '比劫库', '丑': '财库', '戌': '官杀库' },
  '火': { '未': '印库', '戌': '比劫库', '辰': '官杀库', '丑': '食伤库' },
  '土': { '戌': '印库', '辰': '官杀库', '未': '官杀库', '丑': '财库' },
  '金': { '丑': '印库', '戌': '印库', '辰': '印库', '未': '财库' },
  '水': { '丑': '印库', '辰': '官杀库', '戌': '官杀库', '未': '官杀库' },
}

function getPalaceScore(gong: string): number {
  switch (gong) { case '年': return 3; case '月': return 2; case '时': return 1; case '日': return 0; default: return 0 }
}

interface RootEval {
  zhi: string; gong: string; level: GenLevel; power: number
  shiShenQuality: number; palaceScore: number; isHome: boolean
  kuType: KuShiShen | null; compositeScore: number
  describe: string
}

export interface RootEvalResult {
  all: RootEval[]; best: RootEval | null
  bestAtHome: RootEval | null; bestOutside: RootEval | null
  hasLuAtHome: boolean; hasLuOutside: boolean
  hasKuAtHome: boolean; hasKuOutside: boolean
  summary: string
}

function getGenV2(gan: string, zhi: string, gong: string): RootEval | null {
  const hidden = HIDDEN_GAN[zhi] || ''
  const wx = GAN_WX[gan]
  if (!wx) return null
  const strongRoots = WX_STRONG_ROOTS[wx]
  const benKu = KU_MAP[gan]
  const isKu = ['辰','戌','丑','未'].includes(zhi)

  // 🔥 修正：先查十干禄（尤其是戊己土）
  const ganLu = GAN_LU[gan]  // 戊→巳, 己→午
  const isLuByGanLu = zhi === ganLu
  // 再查五行旺地根
  const isLuByWx = strongRoots ? strongRoots.includes(zhi) : false
  const isLu = isLuByGanLu || isLuByWx

  let level: GenLevel | null = null
  if (isLu) level = '禄'
  else if (isKu && benKu === zhi) level = '本库'
  else if (hidden.includes(gan)) {
    if (hidden[0] === gan) level = '藏干本气'
    else if (hidden[1] === gan) level = '藏干中气'
    else level = '藏干余气'
  } else if (isKu && benKu) {
    for (const h of hidden) {
      if (KU_MAP[h] === benKu) { level = '同源余气'; break }
    }
  }
  if (!level) return null

  const power = GEN_POWER[level]
  const dmWx = GAN_WX[gan]
  const kuType = isKu && dmWx ? (KU_SHI_SHEN[dmWx]?.[zhi] ?? null) : null

  // 十神质量分：印库=3, 食伤库=2, 比劫库=1, 禄(root as 借)=0, 藏干=-1
  let quality = kuType === '印库' ? 3 : kuType === '食伤库' ? 2 : kuType === '比劫库' ? 1 : 0
  if (level !== '禄' && level !== '本库') quality = -1

  const palace = getPalaceScore(gong)
  const pw = PILLAR_WEIGHT[gong] || 0.5
  // 综合 = 力量 × (质量+3) × (宫位+1.5) × 柱权重
  const compositeScore = power * (quality + 3) * (palace + 1.5) * pw

  return {
    zhi, gong, level, power, shiShenQuality: quality, palaceScore: palace,
    isHome: ['日', '时'].includes(gong), kuType,
    describe: `${gan}在${gong}支${zhi}为${level}${kuType ? `(${kuType})` : ''} 综=${compositeScore.toFixed(2)}`,
    compositeScore,
  }
}

function evaluateAllRoots(dm: string, siZhu: SiZhu): RootEvalResult {
  const all: RootEval[] = []
  for (const g of ['年', '月', '日', '时']) {
    const p = siZhu[g]
    const r = getGenV2(dm, p.zhi, g)
    if (r) all.push(r)
  }
  all.sort((a, b) => b.compositeScore - a.compositeScore)

  const best = all[0] ?? null
  const bestAtHome = all.filter(r => r.isHome).sort((a, b) => b.compositeScore - a.compositeScore)[0] ?? null
  const bestOutside = all.filter(r => !r.isHome).sort((a, b) => b.compositeScore - a.compositeScore)[0] ?? null
  const hasLuAtHome = all.some(r => r.isHome && r.level === '禄')
  const hasLuOutside = all.some(r => !r.isHome && r.level === '禄')
  const hasKuAtHome = all.some(r => r.isHome && r.level === '本库')
  const hasKuOutside = all.some(r => !r.isHome && r.level === '本库')

  const lines = all.map(r => `  ${r.describe}`)
  let summary = `【${dm}日主根评】\n` + lines.join('\n')
  if (best) summary += `\n→ 最佳: ${best.zhi}(${best.gong}) 综=${best.compositeScore.toFixed(2)}`
  if (hasLuAtHome && hasLuOutside) summary += '\n⚠ 双线根（家里家外都有禄）'
  else if (!hasLuAtHome && hasLuOutside) summary += '\n⚠ 借根家外'
  else if (!hasLuAtHome && !hasLuOutside && hasKuAtHome) summary += '\n📦 靠本库在家'
  else if (!hasLuAtHome && !hasLuOutside && hasKuOutside) summary += '\n📦 靠本库在家外'

  return { all, best, bestAtHome, bestOutside, hasLuAtHome, hasLuOutside, hasKuAtHome, hasKuOutside, summary }
}

// ============================================================
// 第四部分：关系链引擎（R1, R2, R5, R6, R7）
// ============================================================

type RelType = '会局' | '三合' | '六合' | '五合' | '同源' | '血亲' | '生' | '制' | '冲' | '害' | '刑' | '穿' | '同柱'

/** 关系描述 */
interface Relation {
  type: RelType
  strength: number
  describe: string
}

/** 关系链路径 */
interface RelChain {
  path: string[]
  relations: Relation[]
  strength: number
  describe: string
}

interface RelChainResult {
  from: string
  to: string
  direct: Relation | null
  allChains: RelChain[]
  best: RelChain | null
  summary: string
}

/** 两个地支之间的直接关系（优先级排序：会局>三合>同源>六合>冲>害>刑>穿) */
function getZhiRelation(a: string, b: string): Relation | null {
  if (a === b) return null
  // 同源
  const kuA = KU_MAP[a] || '', kuB = KU_MAP[b] || ''
  if (kuA && kuB && kuA === kuB && ['辰', '戌', '丑', '未'].includes(kuA)) {
    return { type: '同源', strength: 10, describe: `${a}和${b}同出于${kuA}` }
  }
  // 三会（优先级最高）
  if (SAN_HUI[a]?.includes(b)) return { type: '会局', strength: 9, describe: `${a}${b}三会` }
  // 三合
  if (SAN_HE[a]?.includes(b)) return { type: '三合', strength: 8, describe: `${a}${b}三合` }
  // 六合
  if (LIU_HE[a] === b) return { type: '六合', strength: 7, describe: `${a}${b}六合` }
  // 刑（丑戌刑、寅巳刑等）
  if (XING_PAIRS.some(([x, y]) => x === a && y === b)) return { type: '刑', strength: 4, describe: `${a}${b}刑` }
  // 冲
  if (LIU_CHONG[a] === b) return { type: '冲', strength: 5, describe: `${a}${b}六冲` }
  // 害
  if (LIU_HAI[a] === b) return { type: '害', strength: 3, describe: `${a}${b}六害` }
  // 五行生克
  const wxA = ZHI_WX[a], wxB = ZHI_WX[b]
  if (wxA && wxB) {
    if (WX_SHENG[wxA] === wxB) return { type: '生', strength: 6, describe: `${a}(${wxA})生${b}(${wxB})` }
    if (WX_KE[wxA] === wxB) return { type: '制', strength: 5, describe: `${a}(${wxA})克${b}(${wxB})` }
  }
  return null
}

/** 两字之间的直接关系 */
function getDirectRelation(a: string, b: string): Relation | null {
  if (a === b) return null
  // 地支-地支
  if (ZHI_WX[a] && ZHI_WX[b]) return getZhiRelation(a, b)
  // 天干-天干
  if (GAN_WX[a] && GAN_WX[b]) {
    if (WU_HE[a] === b) return { type: '五合', strength: 7, describe: `${a}${b}五合` }
    const kuA = KU_MAP[a], kuB = KU_MAP[b]
    if (kuA && kuB && kuA === kuB && ['辰','戌','丑','未'].includes(kuA)) {
      return { type: '同源', strength: 10, describe: `${a}和${b}同出于${kuA}` }
    }
    const wxA = GAN_WX[a], wxB = GAN_WX[b]
    if (wxA && wxB) {
      if (WX_SHENG[wxA] === wxB) return { type: '生', strength: 6, describe: `${a}(${wxA})生${b}(${wxB})` }
      if (WX_KE[wxA] === wxB) return { type: '制', strength: 5, describe: `${a}(${wxA})克${b}(${wxB})` }
    }
    return null
  }
  // 天干-地支：血亲检查（60甲子支生干）
  const gan = GAN_WX[a] ? a : b
  const zhi = ZHI_WX[a] ? a : b
  if (gan && zhi) {
    if (isBloodJiaZi(gan, zhi)) return { type: '血亲', strength: 8, describe: `${gan}${zhi}血亲（60甲子支生干）` }
    // 天干通根于地支
    const hidden = HIDDEN_GAN[zhi] || ''
    if (hidden.includes(gan)) {
      let strength = 0
      if (hidden[0] === gan) strength = 6
      else if (hidden[1] === gan) strength = 4
      else strength = 3
      return { type: '同柱', strength, describe: `${gan}通根${zhi}(${hidden.indexOf(gan) === 0 ? '本气' : hidden.indexOf(gan) === 1 ? '中气' : '余气'})` }
    }
    // 五行生克
    const wxG = GAN_WX[gan], wxZ = ZHI_WX[zhi]
    if (wxG && wxZ) {
      if (WX_SHENG[wxG] === wxZ) return { type: '生', strength: 5, describe: `${gan}(${wxG})生${zhi}(${wxZ})` }
      if (WX_KE[wxG] === wxZ) return { type: '制', strength: 4, describe: `${gan}(${wxG})克${zhi}(${wxZ})` }
      if (WX_SHENG[wxZ] === wxG) return { type: '生', strength: 5, describe: `${zhi}(${wxZ})生${gan}(${wxG})` }
      if (WX_KE[wxZ] === wxG) return { type: '制', strength: 4, describe: `${zhi}(${wxZ})克${gan}(${wxG})` }
    }
  }
  return null
}

/** 获取一个字的邻居节点（用于BFS）—— 优化版：只生成直接关系，不穷举五行 */
function getNeighbors(node: string): { neighbor: string; relation: Relation }[] {
  const result: { neighbor: string; relation: Relation }[] = []
  const add = (n: string, rel: Relation) => { result.push({ neighbor: n, relation: rel }) }

  if (ZHI_WX[node]) {
    // 六合
    if (LIU_HE[node]) add(LIU_HE[node], { type: '六合', strength: 7, describe: `${node}${LIU_HE[node]}六合` })
    // 三合
    const sanHe = SAN_HE[node]
    if (sanHe) for (const p of sanHe) add(p, { type: '三合', strength: 8, describe: `${node}${p}三合` })
    // 三会
    const sanHui = SAN_HUI[node]
    if (sanHui) for (const p of sanHui) add(p, { type: '会局', strength: 9, describe: `${node}${p}三会` })
    // 冲
    if (LIU_CHONG[node]) add(LIU_CHONG[node], { type: '冲', strength: 5, describe: `${node}${LIU_CHONG[node]}六冲` })
    // 害
    if (LIU_HAI[node]) add(LIU_HAI[node], { type: '害', strength: 3, describe: `${node}${LIU_HAI[node]}六害` })
    // 刑
    for (const [x, y] of XING_PAIRS) { if (x === node) add(y, { type: '刑', strength: 4, describe: `${x}${y}刑` }) }
    // 同源
    const ku = KU_MAP[node]
    if (ku && ['辰','戌','丑','未'].includes(ku)) {
      for (const [k, v] of Object.entries(KU_MAP)) {
        if (v === ku && k !== node && !['戊','己'].includes(k)) add(k, { type: '同源', strength: 10, describe: `${node}和${k}同出于${ku}` })
      }
    }
    // 藏干
    const hidden = HIDDEN_GAN[node] || ''
    for (const h of hidden) add(h, { type: '同柱', strength: 6, describe: `${node}藏${h}` })
    // 五行生：只和辰戌丑未这种库的关联 (去掉全遍历)
    const wx = ZHI_WX[node]
    if (wx) {
      // 生我者
      for (const [z, zwx] of Object.entries(ZHI_WX)) {
        if (z === node) continue
        if (WX_SHENG[zwx] === wx) add(z, { type: '生', strength: 5, describe: `${z}(${zwx})生${node}(${wx})` })
        if (WX_SHENG[wx] === zwx) add(z, { type: '生', strength: 5, describe: `${node}(${wx})生${z}(${zwx})` })
        if (WX_KE[zwx] === wx) add(z, { type: '制', strength: 4, describe: `${z}(${zwx})克${node}(${wx})` })
      }
    }
  }

  if (GAN_WX[node]) {
    const wx = GAN_WX[node]
    // 五合
    if (WU_HE[node]) add(WU_HE[node], { type: '五合', strength: 7, describe: `${node}${WU_HE[node]}五合` })
    // 同源
    const ku = KU_MAP[node]
    if (ku && ['辰','戌','丑','未'].includes(ku)) {
      for (const [k, v] of Object.entries(KU_MAP)) {
        if (v === ku && k !== node && !['戊','己'].includes(k)) add(k, { type: '同源', strength: 10, describe: `${node}和${k}同出于${ku}` })
      }
    }
    // 禄
    const luZhi = GAN_LU[node]
    if (luZhi) add(luZhi, { type: '同柱', strength: 7, describe: `${node}禄在${luZhi}` })
    // 与所有天干的生克合
    for (const [g, gwx] of Object.entries(GAN_WX)) {
      if (g === node) continue
      if (WU_HE[g] === node && WU_HE[node] !== g) {} // already handled above
      if (WX_SHENG[wx] === gwx) add(g, { type: '生', strength: 5, describe: `${node}(${wx})生${g}(${gwx})` })
      if (WX_KE[wx] === gwx) add(g, { type: '制', strength: 4, describe: `${node}(${wx})克${g}(${gwx})` })
    }
  }

  // 去重
  const seen = new Set<string>()
  return result.filter(r => { if (seen.has(r.neighbor)) return false; seen.add(r.neighbor); return true })
}

/** BFS找关系链 */
function findChains(start: string, end: string, maxHops = 3): RelChain[] {
  if (start === end) return []

  const results: RelChain[] = []
  const queue: { node: string; path: string[]; rels: Relation[]; visited: Set<string> }[] = [
    { node: start, path: [start], rels: [], visited: new Set([start]) },
  ]

  while (queue.length > 0) {
    const { node, path, rels, visited } = queue.shift()!
    if (path.length - 1 >= maxHops) continue

    // 检查当前节点到终点
    if (node !== start) {
      const direct = getDirectRelation(node, end)
      if (direct) {
        results.push({
          path: [...path, end],
          relations: [...rels, direct],
          strength: Math.min(...[...rels, direct].map(r => r.strength)),
          describe: [...rels, direct].map(r => r.describe).join(' → '),
        })
      }
    }

    if (path.length - 1 >= maxHops) continue

    // 扩展
    for (const { neighbor, relation } of getNeighbors(node)) {
      if (visited.has(neighbor)) continue
      const newVisited = new Set(visited)
      newVisited.add(neighbor)
      queue.push({
        node: neighbor,
        path: [...path, neighbor],
        rels: [...rels, relation],
        visited: newVisited,
      })
    }
  }

  results.sort((a, b) => b.strength - a.strength)
  return results.slice(0, 5) // 最多返回5条路径
}

/** 关系链分析 */
function analyzeRelationChain(from: string, to: string): RelChainResult {
  const direct = getDirectRelation(from, to)
  const allChains = findChains(from, to)
  const best = allChains.length > 0 ? allChains[0] : null
  const parts: string[] = []
  if (direct) parts.push(`直接: ${direct.describe}`)
  if (best) parts.push(`最佳路径: ${best.describe}`)
  return {
    from, to, direct, allChains, best,
    summary: parts.length > 0 ? parts.join('\n') : `${from}→${to}无直接关联`,
  }
}

/** 多跳关系链（方便调用） */
function findBridge(a: string, target: string): RelChain | null {
  const result = analyzeRelationChain(a, target)
  return result.best
}

// ============================================================
// 第4.5部分：路径完整度 + 藏干穿透 + 动静区分（新发现1,4,5）
// ============================================================

/** 路径完整度 — 全程生+合=完整，包含冲/刑/穿=有损耗 */
export function evaluatePathQuality(path: RelChain): { quality: '完整' | '有损耗'; describe: string } {
  const lossTypes = ['冲', '刑', '害', '制', '穿']
  const losses = path.relations.filter(r => lossTypes.includes(r.type))
  if (losses.length === 0) return { quality: '完整', describe: '路径全程温和(生/合)，无损耗' }
  return { quality: '有损耗', describe: `路径含${losses.map(r => r.describe).join('、')}` }
}

/** 藏干穿透分析 — 穿/冲一个地支，穿透到藏干层面，确定具体影响了什么十神 */
export function penetrateHiddenKind(zhi: string): { gan: string; position: string; wx: string }[] {
  return (HIDDEN_GAN[zhi] || '').split('').map((h, i) => ({
    gan: h, wx: GAN_WX[h] || '?',
    position: i === 0 ? '本气' : i === 1 ? '中气' : '余气',
  }))
}

/** 此字是否处于活动状态（大运/流年的字=活动，原局的字=静态） */
export function isActive(s: string, currentYear?: string, currentDaYun?: string): boolean {
  if (currentYear && (currentYear[0] === s || currentYear[1] === s)) return true
  if (currentDaYun && (currentDaYun[0] === s || currentDaYun[1] === s)) return true
  return false
}

/** 流年天干和日主相同 = 共享同根（新发现2） */
export function detectSharedRoot(dm: string, currentYear?: string, siZhu?: SiZhu): string | null {
  if (!currentYear || currentYear[0] !== dm || !siZhu) return null
  // 日主和流年天干相同 → 流年甲木借日主的根
  // 找出日主的最佳根
  const roots = evaluateAllRoots(dm, siZhu)
  if (roots.best) return `流年${currentYear}天干与日主同为${dm}，共享根「${roots.best.zhi}(${roots.best.gong}柱)」`
  return `流年${currentYear}天干与日主同为${dm}`
}

type ControlLevel = '完全控制' | '温和得到' | '强力得到' | '有主动权' | '有参与权' | '被控制' | '无关系'

interface ControlEval {
  level: ControlLevel
  score: number
  describe: string
  source: string    // 控制依据
}

function evaluateControl(
  dm: string, targetGan: string, targetZhi: string, siZhu: SiZhu
): ControlEval {
  const dmWx = GAN_WX[dm]
  const targetWx = GAN_WX[targetGan] || ZHI_WX[targetZhi]
  const target = targetGan + targetZhi
  const roots = evaluateAllRoots(dm, siZhu)

  // 1. 我自己生的 → 100%控制（R3: 生的可以完全控制）
  if (dmWx && targetWx && WX_SHENG[dmWx] === targetWx) {
    return { level: '完全控制', score: 100, describe: `${dm}(${dmWx})生${targetGan+targetZhi}(${targetWx})，完全控制`, source: '生' }
  }

  // 2. 合 → 温和得到（合不看力量 R15）
  if (WU_HE[dm] === targetGan) {
    return { level: '温和得到', score: 90, describe: `${dm}合${targetGan}，温和得到`, source: '五合' }
  }
  for (const p of Object.values(siZhu)) {
    if (LIU_HE[targetZhi] === p.zhi) {
      return { level: '温和得到', score: 85, describe: `${p.zhi}合${targetZhi}，日主有参与`, source: '六合' }
    }
  }

  // 3. 能制吗？（R15: 制要看力量）
  if (dmWx && targetWx && WX_KE[dmWx] === targetWx) {
    if (roots.hasLuAtHome) {
      return { level: '强力得到', score: 80, describe: `${dm}(${dmWx})克${target}(${targetWx})，有根能制`, source: '制(强)' }
    } else {
      return { level: '强力得到', score: 55, describe: `${dm}(${dmWx})克${target}(${targetWx})，但根弱可能制不住`, source: '制(弱)' }
    }
  }

  // 4. 根在家里 （R14: 家里的字主动权）
  if (roots.hasLuAtHome) {
    return { level: '有主动权', score: 70, describe: '日主有禄根在家，有主动权', source: '家里禄' }
  }
  if (roots.hasKuAtHome) {
    return { level: '有参与权', score: 50, describe: '日主有本库在家，有参与权', source: '家里本库' }
  }

  // 5. 根在家外 → 被控制（R14: 家外被比劫看到）
  if (roots.hasLuOutside && !roots.hasLuAtHome) {
    return { level: '被控制', score: 20, describe: '日主根在家外，被比劫控制', source: '家外禄' }
  }

  return { level: '无关系', score: 0, describe: '日主和目标无直接关系', source: '无' }
}

// ============================================================
// 第六部分：两象定一象（R10, R13）
// ============================================================

interface Evidence {
  source: string; chain: string; conclusion: string; weight: number
}

interface TwoEvidenceResult {
  conclusion: string; evidence: Evidence[]; confidence: number; describe: string
}

function twoEvidenceConfirm(conclusion: string, evidences: Evidence[]): TwoEvidenceResult {
  const avgWeight = evidences.reduce((s, e) => s + e.weight, 0) / evidences.length
  let confidence = 0
  if (evidences.length >= 3) confidence = 0.95
  else if (evidences.length >= 2) confidence = 0.85
  else if (evidences.length >= 1) confidence = 0.5
  confidence = Math.min(confidence, avgWeight + 0.2)

  const lines = evidences.map(e => `  [${e.source}] ${e.chain} → ${e.conclusion}`)
  return {
    conclusion, evidence: evidences, confidence,
    describe: `两象定一象:「${conclusion}」\n${lines.join('\n')}\n信度: ${(confidence * 100).toFixed(0)}%`,
  }
}

// ============================================================
// 第七部分：换象引擎
// ============================================================

/** 巳酉→丙申换象 */
const HUAN_XIANG: Record<string, string[]> = {
  '巳酉': ['丙', '申'],
  '午酉': ['丁', '酉'],
  '戊辛': ['辛', '丑'],
  '巳申': ['丙', '申'],  // 巳申合→丙申
  '子丑': ['癸', '丑'],  // 子丑合→癸丑
  '卯戌': ['乙', '戌'],  // 卯戌合→乙戌
  '辰酉': ['辛', '酉'],  // 辰酉合→辛酉（但教材强调原局有时辰酉不是合...）
}

function getHuanXiang(a: string, b: string): { gan: string; zhi: string } | null {
  const key = [a, b].sort().join('')
  const result = HUAN_XIANG[key]
  if (result) return { gan: result[0], zhi: result[1] }
  return null
}

// ============================================================
// 第九部分：太极点转换（R11, R12）
// ============================================================

interface TaiJiPointAnalysis {
  originalPoint: string      // 原太极点（如日主）
  newPoint: string           // 新太极点（如子水=老公）
  target: string             // 要看谁（如丑土=婆婆）
  chain: RelChain | null     // 关系链
  conclusion: string[]       // 结论
  summary: string
}

function switchTaiJiPoint(
  originalPoint: string,
  newPoint: string,
  target: string,
  context: SiZhu
): TaiJiPointAnalysis {
  // 换到新太极点后，重新分析target
  const chain = analyzeRelationChain(newPoint, target)
  const conclusions: string[] = []

  if (chain.direct) {
    conclusions.push(`以${newPoint}为太极点看${target}: ${chain.direct.describe}`)
  }
  if (chain.best && chain.best.path.length > 2) {
    conclusions.push(`关系路径: ${chain.best.path.join('→')}`)
  }

  return {
    originalPoint, newPoint, target,
    chain: chain.best,
    conclusion: conclusions,
    summary: `换太极点: ${originalPoint}→${newPoint}看${target}\n${conclusions.join('\n')}`,
  }
}

// ============================================================
// 第十部分：人事还原（十神→实际事件）
// ============================================================

function getShiShen(gan: string, dm: string): string {
  const wxGan = GAN_WX[gan]
  const wxDm = GAN_WX[dm]
  if (!wxGan || !wxDm) return '未知'
  if (wxGan === wxDm) return '比劫'
  if (WX_SHENG[wxDm] === wxGan) return '食伤'
  if (WX_KE[wxDm] === wxGan) return '财'
  if (WX_SHENG[wxGan] === wxDm) return '印'
  if (WX_KE[wxGan] === wxDm) return '官杀'
  return '未知'
}

// 十神→实际场景
const SHI_SHEN_SCENE: Record<string, string[]> = {
  '正财': ['收入', '稳定工作', '妻子', '资产', '不动产'],
  '偏财': ['投资', '偏门收入', '父亲', '情人', '风险资产'],
  '正官': ['上司', '稳定工作', '老公(女)', '约束', '名声'],
  '七杀': ['压力', '挑战', '官非', '小人', '创业'],
  '正印': ['文凭', '贵人', '长辈', '房子', '健康保障'],
  '偏印': ['技术', '特殊技能', '偏门学问', '宗教', '创意'],
  '比肩': ['兄弟姐妹', '朋友', '同行', '竞争者'],
  '劫财': ['损友', '合作伙伴', '争产者', '抢机会的'],
  '食神': ['才华', '口福', '享受', '表达', '设计'],
  '伤官': ['叛逆', '才华', '创新', '话多', '艺术'],
}

function mapShiShenToScene(shiShen: string): string[] {
  return SHI_SHEN_SCENE[shiShen] ?? [`${shiShen}相关事件`]
}

// ============================================================
// 第十一部分：大运评估四步法
// ============================================================

interface DaYunEval {
  step1: { bodyStrength: string; detail: string }
  step2: { origin: string; isFromYuanJu: boolean; isHome: boolean; detail: string }
  step3: ControlEval
  step4: { shengToSelf: string; shengToGoodHomeWord: string; detail: string }
  verdict: '吉' | '凶' | '平' | '需调整'
  advice: string[]
  summary: string
}

function evaluateDaYun(
  dm: string, dyGan: string, dyZhi: string, siZhu: SiZhu
): DaYunEval {
  // Step1: 身旺身弱
  const roots = evaluateAllRoots(dm, siZhu)
  const bodyStrength = roots.hasLuAtHome ? '旺' : roots.hasKuAtHome ? '中' : '弱'

  // Step2: 大运字出处
  let isFromYuanJu = false, isHome = false, origin = '外来'
  for (const [g, p] of Object.entries(siZhu)) {
    if (p.gan === dyGan || p.zhi === dyZhi) {
      isFromYuanJu = true; origin = `原局${g}柱`; isHome = ['日', '时'].includes(g); break
    }
  }
  if (!isFromYuanJu) {
    const ku = KU_MAP[dyZhi]
    if (ku && ['辰','戌','丑','未'].includes(ku)) {
      for (const p of Object.values(siZhu)) {
        if (KU_MAP[p.zhi] === ku || KU_MAP[p.gan] === ku) {
          origin = `原局某字同源(${ku})`; break
        }
      }
    }
  }

  // Step3: 控制权
  const control = evaluateControl(dm, dyGan, dyZhi, siZhu)

  // Step4: 生身
  const dmWx = GAN_WX[dm]
  const dyWx = GAN_WX[dyZhi] || ZHI_WX[dyZhi]
  let shengToSelf = '无直接生克'
  if (dmWx && dyWx) {
    if (WX_SHENG[dyWx] === dmWx) shengToSelf = `大运${dyZhi}(${dyWx})生日主(${dmWx}) ✓`
    else if (WX_KE[dyWx] === dmWx) shengToSelf = `大运${dyZhi}(${dyWx})克日主(${dmWx}) ⚠`
  }

  // 综合判断
  let verdict: DaYunEval['verdict'] = '平'
  const advice: string[] = []
  advice.push(`Step1: 日主身${bodyStrength}`)
  advice.push(`Step2: 大运字「${dyGan}${dyZhi}」${origin}`)
  advice.push(`Step3: ${control.describe}`)
  advice.push(`Step4: ${shengToSelf}`)

  if (control.level === '完全控制' || control.level === '温和得到') {
    verdict = '吉'; advice.push('✅ 可控制，应积极把握')
  } else if (control.level === '有主动权') {
    verdict = '吉'; advice.push('✅ 有主动权，需主动出击')
  } else if (control.level === '被控制') {
    verdict = '凶'; advice.push('⚠ 被比劫控制，需调整方式')
  } else if (control.level === '无关系') {
    verdict = '需调整'; advice.push('⚠ 需找桥梁建立关系')
  }

  return {
    step1: { bodyStrength, detail: `身${bodyStrength}` },
    step2: { origin, isFromYuanJu, isHome, detail: `出处: ${origin}` },
    step3: control,
    step4: { shengToSelf, shengToGoodHomeWord: '待扩展', detail: shengToSelf },
    verdict, advice,
    summary: `【大运】${dyGan}${dyZhi}运: 日主身${bodyStrength} · ${origin} · ${control.describe} · ${shengToSelf}`,
  }
}

// ============================================================
// 第十二A部分：增强分析函数（比劫同源+印库+全局同库+太极点转换）
// ============================================================

/** 各日主印库映射 */
const DM_YIN_KU: Record<string, string> = {
  '甲': '辰', '乙': '辰',
  '丙': '未', '丁': '未',
  '戊': '戌', '己': '戌',
  '庚': '丑', '辛': '丑',
  '壬': '丑', '癸': '丑',
}

/** 各日主最佳共根（印库优先）质量描述 */
const DM_BEST_GONG_GEN: string = '木->辰(印库)火->未(印库)土->戌(印库)金->丑(印库)水->丑(印库)'

/** 库的十神类型（对特定日主） */
function getKuShiShen(kuZhi: string, dm: string): string {
  const dmWx = GAN_WX[dm]
  if (!dmWx) return '未知'
  const hidden = HIDDEN_GAN[kuZhi] || ''
  const firstGan = hidden[0]
  const hiddenWx = GAN_WX[firstGan] || ''
  if (!hiddenWx || !dmWx) return '未知'
  if (hiddenWx === dmWx) return '比劫库'
  if (WX_SHENG[dmWx] === hiddenWx) return '食伤库'
  if (WX_KE[dmWx] === hiddenWx) return '财库'
  if (WX_SHENG[hiddenWx] === dmWx) return '印库'
  if (WX_KE[hiddenWx] === dmWx) return '官杀库'
  return '未知'
}

/**
 * 比劫同源分析：每个天干（除日主）是否和日主同库
 * 同库=安全，不同库=风险，印帽=帮助
 */
function summarizeBiJieTongYuan(dm: string, siZhu: SiZhu): string[] {
  const lines: string[] = []
  const dmKu = KU_MAP[dm] || ''
  let allSameKu = true
  let sameKuCount = 0
  let diffKuCount = 0

  for (const [g, p] of Object.entries(siZhu)) {
    if (g === '日') continue
    const gKu = KU_MAP[p.gan] || ''
    const sameKu = dmKu && gKu && dmKu === gKu
    if (!sameKu) allSameKu = false

    if (sameKu) {
      sameKuCount++
      lines.push('✅ ' + g + '干' + p.gan + '(' + gKu + ') → 与日主' + dm + '同库=安全')
    } else {
      diffKuCount++
      lines.push('⚠ ' + g + '干' + p.gan + '(' + gKu + ') → 与日主' + dm + '(' + dmKu + ')不同库=风险')
    }
  }

  if (allSameKu && sameKuCount > 0) {
    lines.push('')
    lines.push('✦ 全局同库！所有天干与日主同出【' + dmKu + '】——周围全是自己人，心齐但缺少差异化')
  } else {
    lines.push('')
    lines.push('同库' + sameKuCount + '个→安全，异库' + diffKuCount + '个→有风险')
  }

  return lines
}

/**
 * 印库状态检测：印库是否在局？是否被合/冲/刑消耗？
 */
function summarizeYinKuState(dm: string, siZhu: SiZhu): string[] {
  const lines: string[] = []
  const yinKu = DM_YIN_KU[dm]
  if (!yinKu) { lines.push('未知印库'); return lines }

  lines.push(dm + '的最佳共根（印库）=' + yinKu + '(' + getKuShiShen(yinKu, dm) + ')')

  const yinKuInChart = Object.values(siZhu).some(p => p.zhi === yinKu)
  if (!yinKuInChart) {
    lines.push('❌ ' + yinKu + '不在原局——日主缺少印库支撑，拍板权弱')
    return lines
  }

  lines.push('✅ ' + yinKu + '在原局中')

  // 检测消耗
  const allZhi = Object.values(siZhu).map(p => p.zhi)
  let consumed = false
  for (const z of allZhi) {
    if (z === yinKu) continue
    // 六合
    if (LIU_HE[z] === yinKu) {
      consumed = true
      if (yinKu === '辰' && z === '酉') {
        // 辰酉合
        lines.push('⚠ 辰酉合消耗（六亲博弈）：')
        lines.push('  辰(戊乙癸)⇌酉(辛)')
        lines.push('  ①辰生酉(土生金=印库付出)')
        lines.push('  ②酉克乙(金克木=打压官杀/声望)')
        lines.push('  ③酉生癸(金生水=酉认为给了财)')
        lines.push('  ④酉理直气壮')
        lines.push('  → 印库被消耗，日主' + dm + '的拍板权受损')
      } else if (yinKu === '未' && z === '午') {
        lines.push('⚠ 午未合消耗：未土印库被午火合化→火，乙木(印)被消耗')
      } else {
        lines.push('⚠ ' + z + LIU_HE[z] + '合：' + yinKu + '印库被' + z + '合住消耗')
      }
    }
    // 六冲
    if (LIU_CHONG[z] === yinKu) {
      consumed = true
      lines.push('⚠ ' + z + '冲' + yinKu + '：印库被冲散，大幅消耗')
    }
    // 刑
    if (XING_PAIRS.some(([x, y]) => (x === z && y === yinKu) || (x === yinKu && y === z))) {
      consumed = true
      if ((yinKu === '丑' && z === '戌') || (yinKu === '戌' && z === '丑')) {
        lines.push('⚠ 丑戌刑：印库(丑/戌)被刑住，能量被内部消耗')
      } else {
        lines.push('⚠ ' + z + yinKu + '刑：印库被刑动，能量损耗')
      }
    }
  }

  if (!consumed) {
    lines.push('✅ 印库未被合/冲/刑消耗——日主的拍板权完整')
  }

  return lines
}

/**
 * 全局同库判定：检查所有天干的库是否一致
 */
function summarizeQuanJuTongKu(dm: string, siZhu: SiZhu): string[] {
  const lines: string[] = []
  const dmKu = KU_MAP[dm] || ''
  if (!dmKu) return lines

  let allSame = true
  for (const [g, p] of Object.entries(siZhu)) {
    const gKu = KU_MAP[p.gan] || ''
    if (gKu !== dmKu) { allSame = false; break }
  }

  if (allSame) {
    lines.push('✦ 四柱全部同库出【' + dmKu + '】——极纯八字')
    lines.push('  好处：心齐、路人都是自己人；坏处：缺少差异化竞争')
  } else {
    // 找最多人用的库
    const kuCount: Record<string, number> = {}
    for (const [g, p] of Object.entries(siZhu)) {
      const gKu = KU_MAP[p.gan] || ''
      kuCount[gKu] = (kuCount[gKu] || 0) + 1
    }
    const maxCount = Math.max(...Object.values(kuCount))
    const maxKu = Object.keys(kuCount).find(k => kuCount[k] === maxCount) || ''
    if (maxKu && maxKu !== dmKu) {
      lines.push('最多人用的库是【' + maxKu + '】(' + maxCount + '人)，日主自己的库是【' + dmKu + '】')
      lines.push('  其他人有自己的圈子，日主需注意区分')
    }
  }

  return lines
}

/**
 * 太极点转换：以目标柱的宫位（年/月/时）的天干为新日主，重新分析十神关系
 */
function switchTaiJiDian(siZhu: SiZhu, targetGong: string, targetGan: string, originalDm: string): string[] {
  const lines: string[] = []
  const newDm = targetGan

  if (newDm === originalDm) return lines

  // 以新日主重新算十神
  for (const [g, p] of Object.entries(siZhu)) {
    if (g === targetGong) continue // 自己不算自己
    const newShen = getShiShen(p.gan, newDm)
    const oldShen = getShiShen(p.gan, originalDm)
    // 只有十神变化时才输出
    if (newShen !== oldShen) {
      const gongName: Record<string, string> = { '年': '祖上', '月': '父母/市场', '日': '命主', '时': '子女' }
      lines.push(g + '柱' + p.gan + p.zhi + '：原为【' + oldShen + '】→换视角后为【' + newShen + '】(' + gongName[g] || g + ')')
    }
  }

  // 新日主和原日主的关系
  const dmRelation = getShiShen(originalDm, newDm)
  lines.push('原日主' + originalDm + '在新视角下是【' + dmRelation + '】')

  return lines
}

// ============================================================
// 第十二B部分：主分析引擎（六步推理法）
// ============================================================

export function analyzeBaZi(siZhu: SiZhu, currentYear?: string, currentDaYun?: string): BaziAnalysis {
  const dm = siZhu['日'].gan
  const yueZhi = siZhu['月'].zhi
  const summary: string[] = []
  const allChains: RelChainResult[] = []
  const allControls: ControlEval[] = []
  const taiJiPoints: TaiJiPointAnalysis[] = []

  summary.push(`\n${'='.repeat(70)}`)
  summary.push(`八字分析: ${Object.values(siZhu).map(p => p.gan + p.zhi).join(' ')}`)
  summary.push(`日主: ${dm}`)
  if (currentYear) summary.push(`流年: ${currentYear}`)
  if (currentDaYun) summary.push(`大运: ${currentDaYun}`)
  summary.push(`${'='.repeat(70)}`)


  // Step 0: 根评估
  summary.push('\n🌳 【根评估】')
  const rootEval = evaluateAllRoots(dm, siZhu)
  summary.push(rootEval.summary)
  summary.push(`  ${rootEval.hasLuAtHome ? '✅家里有禄' : '❌家里无禄'}`)
  summary.push(`  ${rootEval.hasLuOutside ? '⚠家外有禄(借根家外)' : '✅家外无禄'}`)
  summary.push(`  ${rootEval.hasKuAtHome ? '📦家里有本库' : '❌家里无本库'}`)

  // 最佳根评估
  if (rootEval.best) {
    const b = rootEval.best
    summary.push(`  → 最佳根: ${b.zhi}(${b.gong}柱) 综合=${b.compositeScore.toFixed(2)}`)
  }

  // 新发现2: 共享根检测
  const sharedRoot = detectSharedRoot(dm, currentYear, siZhu)
  if (sharedRoot) summary.push(`
  📍 【共享根】${sharedRoot}`)

  // Step 2: 关系链（圈出关键关系）
  summary.push('\n🔗 【关键关系链】')
  // 收集四柱中所有天干地支
  const allChars: string[] = []
  for (const p of Object.values(siZhu)) {
    if (!allChars.includes(p.gan)) allChars.push(p.gan)
    if (!allChars.includes(p.zhi)) allChars.push(p.zhi)
  }
  if (currentYear) {
    if (!allChars.includes(currentYear[0])) allChars.push(currentYear[0])
    if (!allChars.includes(currentYear[1])) allChars.push(currentYear[1])
  }
  if (currentDaYun) {
    if (!allChars.includes(currentDaYun[0])) allChars.push(currentDaYun[0])
    if (!allChars.includes(currentDaYun[1])) allChars.push(currentDaYun[1])
  }

  // 日主和各柱的根关系
  for (const [g, p] of Object.entries(siZhu)) {
    const rc = analyzeRelationChain(dm, p.zhi)
    if (rc.direct || rc.best) {
      allChains.push(rc)
      summary.push(`  ${dm}→${g}支${p.zhi}: ${rc.direct ? rc.direct.describe : rc.best?.describe || '无'}`)
    }
    // 天干之间的关系
    if (p.gan !== dm) {
      const rc2 = analyzeRelationChain(dm, p.gan)
      if (rc2.direct) summary.push(`  ${dm}→${g}干${p.gan}: ${rc2.direct.describe}`)
    }
  }

  // 流年/大运的关系
  if (currentYear) {
    summary.push(`\n  📅 流年${currentYear}的关系:`)
    const yrc = analyzeRelationChain(dm, currentYear[0])
    if (yrc.direct || yrc.best) summary.push(`  ${dm}→${currentYear[0]}: ${yrc.direct?.describe || yrc.best?.describe || '无'}`)
    const zrc = analyzeRelationChain(dm, currentYear[1])
    if (zrc.direct || zrc.best) summary.push(`  ${dm}→${currentYear[1]}: ${zrc.direct?.describe || zrc.best?.describe || '无'}`)
  }

  // 新发现5: 穿/冲→藏干穿透分析
  summary.push('\n🔬 【藏干穿透分析(穿/冲)】')
  for (const [g, p] of Object.entries(siZhu)) {
    for (const [g2, p2] of Object.entries(siZhu)) {
      if (g >= g2) continue
      const rel = getDirectRelation(p.zhi, p2.zhi)
      if (rel && (rel.type === '冲' || rel.type === '害' || rel.type === '刑')) {
        const hiddenA = penetrateHiddenKind(p.zhi)
        const hiddenB = penetrateHiddenKind(p2.zhi)
        const shenA = getShiShen(hiddenA[0].gan, dm)
        const shenB = getShiShen(hiddenB[0].gan, dm)
        summary.push(`${p.zhi}${rel.type}${p2.zhi} → 影响${p.zhi}藏干${hiddenA[0].gan}(${shenA}) / ${p2.zhi}藏干${hiddenB[0].gan}(${shenB})`)
      }
    }
  }

  // Step 4: 控制权评估
  summary.push('\n⚡ 【控制权评估】')
  for (const [g, p] of Object.entries(siZhu)) {
    if (g === '日') continue  // 日主不评估自己
    const ctrl = evaluateControl(dm, p.gan, p.zhi, siZhu)
    if (ctrl.score > 30) {
      allControls.push(ctrl)
      summary.push(`  对${g}柱${p.gan}${p.zhi}: ${ctrl.describe}`)
    }
  }
  if (currentYear) {
    const ctrlY = evaluateControl(dm, currentYear[0], currentYear[1], siZhu)
    allControls.push(ctrlY)
    summary.push(`  对流年${currentYear}: ${ctrlY.describe}`)
  }

  // Step 5: 大运评估（如有）
  let daYun: DaYunEval | null = null
  if (currentDaYun) {
    summary.push('\n🚀 【大运评估(四步法)】')
    daYun = evaluateDaYun(dm, currentDaYun[0], currentDaYun[1], siZhu)
    summary.push(daYun.summary)
  }

  // Step 6: 两象定一象（关键结论）
  summary.push('\n🎯 【两象定一象 — 关键结论】')
  // 根据典型的宫位+十神组合得出结论
  for (const [g, p] of Object.entries(siZhu)) {
    const shiShen = getShiShen(p.gan, dm)
    const gongMap: Record<string, string> = { '年': '家外', '月': '比劫宫', '日': '自己', '时': '子女宫' }
    const gongName = gongMap[g] || g
    // 两象：十神 + 宫位
    const evidence: Evidence[] = [
      { source: `十神: ${p.gan}是${shiShen}`, chain: `对日主${dm}来说`, conclusion: `${p.gan}代表${shiShen}相关`, weight: 0.7 },
      { source: `宫位: ${g}柱${gongName}`, chain: `${gongName}的象征`, conclusion: `涉及到${gongName}的事`, weight: 0.7 },
    ]
    const result = twoEvidenceConfirm(`${p.gan}${p.zhi}: ${shiShen}+${gongName}`, evidence)
    summary.push(`  ${result.describe.split('\n')[0]}`)
  }

  summary.push(`\n${'='.repeat(70)}`)
  summary.push('分析完成')

  // ====== 新增强模块：比劫同源分析 ======
  summary.push('\n👥 【比劫同源分析】')
  const biJieLines = summarizeBiJieTongYuan(dm, siZhu)
  for (const l of biJieLines) summary.push('  ' + l)

  // ====== 新增强模块：印库消耗检测 ======
  summary.push('\n📦 【印库状态】')
  const yinKuLines = summarizeYinKuState(dm, siZhu)
  for (const l of yinKuLines) summary.push('  ' + l)

  // ====== 新增强模块：全局同库检测 ======
  const tongKuLines = summarizeQuanJuTongKu(dm, siZhu)
  if (tongKuLines.length > 0) {
    summary.push('\n🔗 【全局同库判定】')
    for (const l of tongKuLines) summary.push('  ' + l)
  }

  // ====== 新增模块：太极点转换 ======
  summary.push('\n🔄 【太极点转换 - 换宫位视角】')
  const gongMap2: Record<string, string> = { '年': '祖上/国家', '月': '父母/市场', '时': '子女/晚辈' }
  for (const [g, p] of Object.entries(siZhu)) {
    if (g === '日') continue
    const tjdLines = switchTaiJiDian(siZhu, g, p.gan, dm)
    if (tjdLines.length > 0) {
      summary.push('  ' + '-'.repeat(50))
      summary.push('  以【' + g + '柱' + p.gan + p.zhi + '】为新太极点——看' + (gongMap2[g] || g) + '视角：')
      for (const l of tjdLines) summary.push('  ' + l)
    }
  }

  return {
    dm, siZhu,
    rootEval, chains: allChains, controls: allControls,
    taiJiPoints,
    daYun, currentYear, currentDaYun,
    summary,
  }
}

// ============================================================
// 第十三部分：测试 — 逐个案例验证
// ============================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('='.repeat(70))
  console.log('八字推理引擎 v2 — 全案例测试')
  console.log('='.repeat(70))
  console.log('')

  // ===== Case 1: 乾壬申甲辰辛酉癸巳 =====
  console.log('【案例1】乾壬申甲辰辛酉癸巳 — 未土运')
  const case1: SiZhu = {
    '年': { gan: '壬', zhi: '申' },
    '月': { gan: '甲', zhi: '辰' },
    '日': { gan: '辛', zhi: '酉' },
    '时': { gan: '癸', zhi: '巳' },
  }
  const result1 = analyzeBaZi(case1, undefined, '未')
  console.log(result1.summary.join('\n'))
  console.log('')

  // ===== Case 2: 坤乙丑己丑甲子辛未 =====
  console.log('【案例2】坤乙丑己丑甲子辛未 — 全方位')
  const case2: SiZhu = {
    '年': { gan: '乙', zhi: '丑' },
    '月': { gan: '己', zhi: '丑' },
    '日': { gan: '甲', zhi: '子' },
    '时': { gan: '辛', zhi: '未' },
  }
  const result2 = analyzeBaZi(case2, '甲辰')
  console.log(result2.summary.join('\n'))
  console.log('')

  // ===== Case 3: 乾甲子己巳戊午辛酉 =====
  console.log('【案例3】乾甲子己巳戊午辛酉 — 酉金运')
  const case3: SiZhu = {
    '年': { gan: '甲', zhi: '子' },
    '月': { gan: '己', zhi: '巳' },
    '日': { gan: '戊', zhi: '午' },
    '时': { gan: '辛', zhi: '酉' },
  }
  const result3 = analyzeBaZi(case3, undefined, '辛酉')
  console.log(result3.summary.join('\n'))
  console.log('')

  // ===== Case 4: 乾壬戌戊申丁卯庚子 =====
  console.log('【案例4】乾壬戌戊申丁卯庚子')
  const case4: SiZhu = {
    '年': { gan: '壬', zhi: '戌' },
    '月': { gan: '戊', zhi: '申' },
    '日': { gan: '丁', zhi: '卯' },
    '时': { gan: '庚', zhi: '子' },
  }
  const result4 = analyzeBaZi(case4)
  console.log(result4.summary.join('\n'))
  console.log('')

  // ===== Case 5: 乾丙子乙未己未己巳 =====
  console.log('【案例5】乾丙子乙未己未己巳')
  const case5: SiZhu = {
    '年': { gan: '丙', zhi: '子' },
    '月': { gan: '乙', zhi: '未' },
    '日': { gan: '己', zhi: '未' },
    '时': { gan: '己', zhi: '巳' },
  }
  const result5 = analyzeBaZi(case5)
  console.log(result5.summary.join('\n'))
  console.log('')

  // ===== Case 6: 乾庚辰辛巳癸巳丙辰 =====
  console.log('【案例6】乾庚辰辛巳癸巳丙辰')
  const case6: SiZhu = {
    '年': { gan: '庚', zhi: '辰' },
    '月': { gan: '辛', zhi: '巳' },
    '日': { gan: '癸', zhi: '巳' },
    '时': { gan: '丙', zhi: '辰' },
  }
  const result6 = analyzeBaZi(case6)
  console.log(result6.summary.join('\n'))
  console.log('')

  // ===== Case 7: 乾癸酉乙卯己亥甲戌 =====
  console.log('【案例7】乾癸酉乙卯己亥甲戌')
  const case7: SiZhu = {
    '年': { gan: '癸', zhi: '酉' },
    '月': { gan: '乙', zhi: '卯' },
    '日': { gan: '己', zhi: '亥' },
    '时': { gan: '甲', zhi: '戌' },
  }
  const result7 = analyzeBaZi(case7)
  console.log(result7.summary.join('\n'))
  console.log('')

  // ===== Case 8: 坤壬午壬寅己巳丙寅 =====
  console.log('【案例8】坤壬午壬寅己巳丙寅')
  const case8: SiZhu = {
    '年': { gan: '壬', zhi: '午' },
    '月': { gan: '壬', zhi: '寅' },
    '日': { gan: '己', zhi: '巳' },
    '时': { gan: '丙', zhi: '寅' },
  }
  const result8 = analyzeBaZi(case8)
  console.log(result8.summary.join('\n'))
  console.log('')

  // ===== Case 9: 坤戊申辛酉癸巳丁巳 =====
  console.log('【案例9】坤戊申辛酉癸巳丁巳')
  const case9: SiZhu = {
    '年': { gan: '戊', zhi: '申' },
    '月': { gan: '辛', zhi: '酉' },
    '日': { gan: '癸', zhi: '巳' },
    '时': { gan: '丁', zhi: '巳' },
  }
  const result9 = analyzeBaZi(case9)
  console.log(result9.summary.join('\n'))
  console.log('')

  // ===== Case 10: 乾丙寅庚寅庚子甲申 =====
  console.log('【案例10】乾丙寅庚寅庚子甲申 — 甲午运')
  const case10: SiZhu = {
    '年': { gan: '丙', zhi: '寅' },
    '月': { gan: '庚', zhi: '寅' },
    '日': { gan: '庚', zhi: '子' },
    '时': { gan: '甲', zhi: '申' },
  }
  const result10 = analyzeBaZi(case10, undefined, '甲午')
  console.log(result10.summary.join('\n'))
  console.log('')

  // ===== 株洲4案 — 完整反推验证 =====
  console.log('')
  console.log('='.repeat(70))
  console.log('株洲4案 — 完整反推验证')
  console.log('='.repeat(70))
  console.log('')

  // ===== 株洲Case 1: 坤 壬申 庚戌 壬戌 甲辰 =====
  console.log('【株洲1】坤壬申庚戌壬戌甲辰')
  const zCase1: SiZhu = {
    '年': { gan: '壬', zhi: '申' },
    '月': { gan: '庚', zhi: '戌' },
    '日': { gan: '壬', zhi: '戌' },
    '时': { gan: '甲', zhi: '辰' },
  }
  const zR1 = analyzeBaZi(zCase1)
  console.log(zR1.summary.join('\n'))
  console.log('')

  // ===== 株洲Case 2: 乾 甲午 丙寅 丙戌 戊未 =====
  console.log('【株洲2】乾甲午丙寅丙戌戊未')
  const zCase2: SiZhu = {
    '年': { gan: '甲', zhi: '午' },
    '月': { gan: '丙', zhi: '寅' },
    '日': { gan: '丙', zhi: '戌' },
    '时': { gan: '戊', zhi: '未' },
  }
  const zR2 = analyzeBaZi(zCase2)
  console.log(zR2.summary.join('\n'))
  console.log('')

  // ===== 株洲Case 3: 乾 庚申 庚辰 庚戌 辛丑 =====
  console.log('【株洲3】乾庚申庚辰庚戌辛丑')
  const zCase3: SiZhu = {
    '年': { gan: '庚', zhi: '申' },
    '月': { gan: '庚', zhi: '辰' },
    '日': { gan: '庚', zhi: '戌' },
    '时': { gan: '辛', zhi: '丑' },
  }
  const zR3 = analyzeBaZi(zCase3)
  console.log(zR3.summary.join('\n'))
  console.log('')

  // ===== 株洲Case 4: 坤 戊辰 己未 乙酉 庚寅 =====
  console.log('【株洲4】坤戊辰己未乙酉庚寅')
  const zCase4: SiZhu = {
    '年': { gan: '戊', zhi: '辰' },
    '月': { gan: '己', zhi: '未' },
    '日': { gan: '乙', zhi: '酉' },
    '时': { gan: '庚', zhi: '寅' },
  }
  const zR4 = analyzeBaZi(zCase4)
  console.log(zR4.summary.join('\n'))
  console.log('')

  console.log('='.repeat(70))
  console.log('所有案例测试完成')
}
