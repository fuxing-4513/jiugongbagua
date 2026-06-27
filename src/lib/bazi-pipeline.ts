/**
 * bazi-pipeline.ts — 八字推理链4层流水线
 *
 * 将现有 bazi-judgment.ts 的平行函数重组为：
 *   L1 基础层 → L2 关系层 → L3 专题层 → L4 综合层
 *
 * 每个层的结果被后续层依赖，不再孤立运行。
 */

import type { JudgmentResult } from './bazi-judgment'
import { analyzeJudgment } from './bazi-judgment'

// ──────────────────────────────────────
//  类型定义
// ──────────────────────────────────────

export interface Pillar {
  gan: string
  zhi: string
  gz: string
}

/** L1 基础层 — 从四柱提取的原始数据 */
export interface BaseLayer {
  riGan: string
  riZhi: string
  riWx: string
  gans: string[]
  zhis: string[]
  monthGan: string
  monthZhi: string
  yearGan: string
  yearZhi: string
  hourGan: string
  hourZhi: string
  bodyStrength: '身强' | '身弱' | '身中和'
  kongWang: string[]
}

/** L2 关系层 — BFS 关系链分析 */
export interface RelationLayer {
  /** BFS 路径图 */
  bfsPaths: BfsPath[]
  /** 原局有/无表 */
  originTable: OriginEntry[]
  /** 对冲列表 */
  chongs: RelPair[]
  /** 六合列表 */
  hes: RelPair[]
  /** 穿列表 */
  chuans: RelPair[]
  /** 刑列表 */
  xings: RelPair[]
  /** 三合局 */
  sanHe: string[]
  /** 换象信息 */
  huanXiang: string[]
}

export interface BfsPath {
  nodes: string[]
  rels: string[]
  desc: string
  weight: number
}

export interface OriginEntry {
  name: string
  has: boolean
  location: string
  desc: string
}

export interface RelPair {
  a: string
  b: string
  type: string
}

/** L3 专题层 — 各领域结论 */
export interface TopicLayer {
  /** 事业一句话 */
  career: string
  /** 财富一句话 */
  wealth: string
  /** 婚姻一句话 */
  marriage: string
  /** 健康一句话 */
  health: string
  /** 比劫一句话 */
  biJie: string
  /** 大运一句话 */
  daYun: string
  /** 性格一句话 */
  personality: string
}

/** L4 综合层 — NLP 输出 */
export interface SynthesisLayer {
  /** 核心断语（1-2句，对人说的话） */
  core: string
  /** 人生标签 */
  labels: string[]
  /** 两象定一象发现 */
  doubleEvidence: string[]
  /** 综合建议 */
  advice: string
}

// ──────────────────────────────────────
//  常量
// ──────────────────────────────────────

const CHONG_MAP: Record<string, string> = {
  子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',
  卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'
}

const CHUAN_MAP: Record<string, string> = {
  子:'未',未:'子',丑:'午',午:'丑',寅:'巳',巳:'寅',
  卯:'辰',辰:'卯',申:'亥',亥:'申',酉:'戌',戌:'酉'
}

const HE_MAP: Record<string, string> = {
  子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',
  辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'
}

const ZHI_TO_GAN: Record<string, string> = {
  子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',
  午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'
}

const WX: Record<string, string> = {
  甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',
  庚:'金',辛:'金',壬:'水',癸:'水',
  子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',
  午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'
}

const ALL_GANS = '甲乙丙丁戊己庚辛壬癸'.split('')
const ALL_ZHIS = '子丑寅卯辰巳午未申酉戌亥'.split('')

const CANG_GAN: Record<string, string[]> = {
  子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],
  辰:['戊','乙','癸'],巳:['丙','庚','戊'],午:['丁','己'],
  未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],
  戌:['戊','辛','丁'],亥:['壬','甲']
}

// ──────────────────────────────────────
//  L1: 基础层
// ──────────────────────────────────────

function buildBaseLayer(gans: string[], zhis: string[], bodyStrength: string): BaseLayer {
  return {
    riGan: gans[2],
    riZhi: zhis[2],
    riWx: WX[gans[2]] || '',
    gans,
    zhis,
    monthGan: gans[1],
    monthZhi: zhis[1],
    yearGan: gans[0],
    yearZhi: zhis[0],
    hourGan: gans[3],
    hourZhi: zhis[3],
    bodyStrength: bodyStrength as '身强' | '身弱' | '身中和',
    kongWang: []
  }
}

// ──────────────────────────────────────
//  L2: 关系层 — BFS + 原局有无 + 冲合穿刑
// ──────────────────────────────────────

function buildRelationLayer(base: BaseLayer): RelationLayer {
  const { gans, zhis } = base
  const allChars = [...gans, ...zhis]

  // --- BFS ---
  const bfsPaths: BfsPath[] = []
  for (const start of gans) {
    for (const target of allChars) {
      if (start === target) continue
      const p = bfsSearch(start, target, gans, zhis, 3)
      if (p) bfsPaths.push(p)
    }
  }
  for (const start of zhis) {
    for (const target of allChars) {
      if (start === target) continue
      const p = bfsSearch(start, target, gans, zhis, 3)
      if (p && !bfsPaths.some(x => x.nodes.join(',') === p.nodes.join(','))) bfsPaths.push(p)
    }
  }

  // --- 原局有/无 ---
  const originTable: OriginEntry[] = []
  for (const g of ALL_GANS) {
    const loc = gans.indexOf(g)
    originTable.push({
      name: g,
      has: loc >= 0,
      location: loc >= 0 ? ['年干','月干','日干','时干'][loc] : '无',
      desc: `${g}(${WX[g]})${loc >= 0 ? `在原局${['年干','月干','日干','时干'][loc]}` : '不在原局'}`
    })
  }
  for (const z of ALL_ZHIS) {
    const loc = zhis.indexOf(z)
    originTable.push({
      name: z,
      has: loc >= 0,
      location: loc >= 0 ? ['年支','月支','日支','时支'][loc] : '无',
      desc: `${z}${loc >= 0 ? `在原局${['年支','月支','日支','时支'][loc]}` : '不在原局'}`
    })
  }

  // --- 冲合穿刑 ---
  const chongs: RelPair[] = []
  const hes: RelPair[] = []
  const chuans: RelPair[] = []
  const xings: RelPair[] = []
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const a = zhis[i], b = zhis[j]
      if (CHONG_MAP[a] === b) chongs.push({ a, b, type: '冲' })
      if (HE_MAP[a] === b) hes.push({ a, b, type: '合' })
      if (CHUAN_MAP[a] === b) chuans.push({ a, b, type: '穿' })
    }
  }

  // --- 三合 ---
  const sanHeGroups = ['寅午戌','巳酉丑','申子辰','亥卯未']
  const sanHe: string[] = []
  for (const grp of sanHeGroups) {
    const present = grp.split('').filter(z => zhis.includes(z))
    if (present.length >= 2) {
      sanHe.push(`${present.join('')} (${grp}局${present.length === 3 ? '完整' : '半合'})`)
    }
  }

  // --- 换象 ---
  const huanXiang: string[] = []
  for (const c of chongs) {
    huanXiang.push(`${c.a}${c.b}冲 — 双方受力各按五行算，${WX[c.a]}和${WX[c.b]}的关系决定方向`)
  }
  for (const h of hes) {
    const huan: Record<string, string> = {
      '卯戌':'火','辰酉':'金','巳申':'水','子丑':'土','寅亥':'木','午未':'火'
    }
    if (huan[h.a + h.b] || huan[h.b + h.a]) {
      huanXiang.push(`${h.a}${h.b}合化${huan[h.a + h.b] || huan[h.b + h.a]} — 合后五行改变，原局${h.a}${h.b}不再单独作用`)
    }
  }

  return { bfsPaths, originTable, chongs, hes, chuans, xings, sanHe, huanXiang }
}

function bfsSearch(start: string, target: string, gans: string[], zhis: string[], maxDepth: number): BfsPath | null {
  const all = [...gans, ...zhis]
  const skipped = new Set<string>()
  const queue: { node: string; path: string[]; rels: string[] }[] = [{ node: start, path: [start], rels: [] }]

  while (queue.length) {
    const { node, path, rels } = queue.shift()!
    if (path.length > maxDepth) continue

    if (node === target && path.length > 1) {
      const desc = path.map((n, i) => {
        if (i === 0) return n
        return `${rels[i - 1]}→${n}`
      }).join(' ')
      return { nodes: path, rels, desc, weight: rels.length }
    }

    const candidates = all.filter(c => c !== node && !skipped.has(`${c}|${path.length}`))
    for (const c of candidates) {
      let rel: string | null = null
      if (HE_MAP[node] === c || HE_MAP[c] === node) rel = '合'
      else if (CHONG_MAP[node] === c) rel = '冲'
      else if (CHUAN_MAP[node] === c) rel = '穿'
      else if (WX[node] && WX[c] && (WX[node] === WX[c])) rel = '同'
      else if (WX[node] && WX[c]) {
        if (isSheng(WX[node], WX[c])) rel = '生'
        else if (isKe(WX[node], WX[c])) rel = '克'
      }
      if (rel) {
        skipped.add(`${c}|${path.length}`)
        queue.push({ node: c, path: [...path, c], rels: [...rels, rel] })
      }
    }
  }
  return null
}

function isSheng(a: string, b: string): boolean {
  const r: Record<string, string> = { 木:'火',火:'土',土:'金',金:'水',水:'木' }
  return r[a] === b
}

function isKe(a: string, b: string): boolean {
  const r: Record<string, string> = { 木:'土',土:'水',水:'火',火:'金',金:'木' }
  return r[a] === b
}

// ──────────────────────────────────────
//  L3: 专题层 — 从 JudgmentResult 提取要点
// ──────────────────────────────────────

function buildTopicLayer(
  base: BaseLayer,
  rel: RelationLayer,
  result: JudgmentResult
): TopicLayer {
  const { riGan, riZhi, gans, zhis, bodyStrength } = base

  // --- 性格 ---
  const personality = result.charNarr.length > 0
    ? `你是一个${result.charNarr.slice(0, 2).join('，').replace(/。$/, '')}的人。`
    : `你这个人有自己的节奏和想法。`

  // --- 事业 ---
  let career = ''
  // 找事业关键词
  for (const s of result.careerNarr) {
    if (s.includes('技术') || s.includes('创意') || s.includes('管理') || s.includes('体制') || s.includes('自由')) {
      career = s.replace(/。/g, '。').replace(/$/, '')
      break
    }
  }
  if (!career && result.careerNarr.length > 0) career = result.careerNarr[0].replace(/^[\s。]*/, '')
  if (!career) career = `你的工作跟你日主${riGan}的性质相关，具体要看大运流年推进。`

  // --- 财富 ---
  let wealth = ''
  for (const s of result.wealthNarr) {
    if (s.includes('财') || s.includes('赚钱') || s.includes('收入')) {
      wealth = s.replace(/^[\s。]*/, '')
      break
    }
  }
  if (!wealth) wealth = `你的财运要看原局财星的分布和制用情况。`

  // --- 婚姻 ---
  let marriage = ''
  if (result.marriageNarr.length > 0) {
    marriage = result.marriageNarr[0].replace(/^[\s。]*/, '')
  } else {
    marriage = `你的婚姻宫是${riZhi}，说明配偶有${riZhi}的性格特点。`
  }

  // --- 健康 ---
  let health = ''
  if (result.healthNarr.length > 0) {
    health = result.healthNarr.join('。').replace(/^[\s。]*/, '')
  } else {
    health = `注意${WX[riGan]}五行对应的身体部位保养。`
  }

  // --- 比劫 ---
  let biJie = ''
  if (result.biJieNarr.length > 0) {
    biJie = result.biJieNarr[0].replace(/^[\s。]*/, '')
  } else {
    biJie = '比劫方面关系不大。'
  }

  // --- 大运 ---
  let daYun = ''
  if (result.daYunFourStepNarr.length > 0) {
    daYun = result.daYunFourStepNarr[0].replace(/^[\s。]*/, '')
  } else if (result.daYunNarr.length > 0) {
    daYun = result.daYunNarr[0].replace(/^[\s。]*/, '')
  } else {
    daYun = `你当前的大运走势跟原局配合度决定这十年的发展节奏。`
  }

  return { career, wealth, marriage, health, biJie, daYun, personality }
}

// ──────────────────────────────────────
//  L4: 综合层 — NLP 自然语言输出
// ──────────────────────────────────────

function buildSynthesisLayer(
  base: BaseLayer,
  rel: RelationLayer,
  topic: TopicLayer,
  result: JudgmentResult
): SynthesisLayer {
  const { riGan, riZhi, bodyStrength, gans, zhis, monthZhi } = base
  const lines: string[] = []

  // === 核心断语 ===
  const parts: string[] = []

  // 性格 + 基本面
  parts.push(topic.personality)

  // 身体强弱落地
  const bodyMap: Record<string, string> = {
    '身强': `你${bodyStrength === '身强' ? '身体底子不错，能扛事' : '身体需要多注意保养，容易累'}。`,
    '身弱': '身体需要多注意保养，容易累。',
    '身中和': '身体状态在平衡线上，既不太强壮也不太虚弱。'
  }
  parts.push(bodyMap[bodyStrength] || '')

  // 事业
  if (topic.career) {
    parts.push(`在工作方面：${topic.career}`)
  }

  // 财富
  if (topic.wealth) {
    parts.push(`关于财运：${topic.wealth}`)
  }

  // 婚姻
  if (topic.marriage) {
    parts.push(`感情婚姻方面：${topic.marriage}`)
  }

  // 健康
  if (topic.health) {
    parts.push(`健康方面：${topic.health}`)
  }

  // 大运
  if (topic.daYun) {
    parts.push(`当前运势：${topic.daYun}`)
  }

  // 原局有/无修正
  const hasOriginGan = gans.filter(g => g !== riGan)
  if (hasOriginGan.length > 0) {
    parts.push(`你的原局中有${hasOriginGan.join('、')}这些字——它们是你天生自带的东西，做相关的事情你会比较顺手。`)
  }

  const missingGood: string[] = []
  // 检查财星
  const caiGan = riGan === '甲'||riGan === '乙' ? ['戊','己'] : riGan === '丙'||riGan === '丁' ? ['庚','辛'] : riGan === '戊'||riGan === '己' ? ['壬','癸'] : riGan === '庚'||riGan === '辛' ? ['甲','乙'] : ['丙','丁']
  if (!gans.some(g => caiGan.includes(g)) && !zhis.some(z => caiGan.includes(ZHI_TO_GAN[z]))) {
    missingGood.push('财星')
  }
  const yinGan = riGan === '甲'||riGan === '乙' ? ['壬','癸'] : riGan === '丙'||riGan === '丁' ? ['甲','乙'] : riGan === '戊'||riGan === '己' ? ['丙','丁'] : riGan === '庚'||riGan === '辛' ? ['戊','己'] : ['庚','辛']
  if (!gans.some(g => yinGan.includes(g)) && !zhis.some(z => yinGan.includes(ZHI_TO_GAN[z]))) {
    missingGood.push('印星')
  }
  if (missingGood.length > 0) {
    parts.push(`你的原局中没有${missingGood.join('和')}，意味着${missingGood.includes('财星') ? '钱不是天上掉下来的，要自己一点点赚。' : ''}${missingGood.includes('印星') ? '你缺少背景靠山，什么事都要自己闯。' : ''}`)
  }

  // 冲的预警
  for (const ch of rel.chongs) {
    const warnGan = ZHI_TO_GAN[ch.a] + ZHI_TO_GAN[ch.b]
    parts.push(`你的原局有${ch.a}${ch.b}冲。你做事风格快，但要注意当你走${warnGan}运的时候容易冲动，重要决定三思。`)
  }

  // 穿的性格
  for (const ch of rel.chuans) {
    const active = isSheng(WX[ch.a], WX[ch.b]) ? ch.b : ch.a
    const passive = active === ch.a ? ch.b : ch.a
    parts.push(`原局有${ch.a}${ch.b}穿——有人以"为你好"的名义在向你索取。你是${active}的一方，意味着你在关系中掌握主动权。`)
  }

  // 三合影响
  if (rel.sanHe.length > 0) {
    parts.push(`你的原局有三合局倾向——${rel.sanHe.join('、')}，让你的某个五行力量被显著增强。`)
  }

  const core = parts.slice(0, Math.min(parts.length, 5)).join('\n')

  // === 人生标签 ===
  const labels = result.labels.length > 0
    ? result.labels.slice(0, 6)
    : ['待定']

  // === 两象定一象 ===
  const doubleEvidence: string[] = []
  if (result.twoSignsNarr.length > 0) {
    doubleEvidence.push(result.twoSignsNarr[0])
  }

  // === 综合建议 ===
  const adviceParts: string[] = []
  const weakTips: Record<string, string> = {
    金: '金弱的人注意呼吸系统，秋天多防护',
    木: '木弱的人注意肝胆，春天别太累',
    水: '水弱的人注意肾脏，冬天保暖',
    火: '火弱的人注意心脏，夏天的压力别硬扛',
    土: '土弱的人注意消化，换季的时候调整饮食'
  }
  const weakest = findWeakestWx(gans, zhis, monthZhi)
  if (weakest && weakTips[weakest]) adviceParts.push(`健康建议：${weakTips[weakest]}。`)
  adviceParts.push('一切以原局为主，大运和流年只是配合原局的节奏。')

  if (result.daYunFourStepNarr.length > 0) {
    const last = result.daYunFourStepNarr[result.daYunFourStepNarr.length - 1]
    if (last.length < 100) adviceParts.push(last)
  }

  return {
    core: core.trim(),
    labels: [...new Set(labels)],
    doubleEvidence,
    advice: adviceParts.join('\n')
  }
}

/** 简单找最弱五行 */
function findWeakestWx(gans: string[], zhis: string[], monthZhi: string): string | null {
  const score: Record<string, number> = { 木:0,火:0,土:0,金:0,水:0 }
  for (const z of zhis) { score[WX[z] || '土'] = (score[WX[z] || '土'] || 0) + 1 }
  for (const g of gans) { score[WX[g] || '土'] = (score[WX[g] || '土'] || 0) + 1 }
  // 月令权重加倍
  score[WX[monthZhi] || '土'] = (score[WX[monthZhi] || '土'] || 0) + 2
  const entries = Object.entries(score).sort((a, b) => a[1] - b[1])
  return entries[0]?.[0] || null
}

// ──────────────────────────────────────
//  对外接口
// ──────────────────────────────────────

export interface PipelineResult {
  baseLayer: BaseLayer
  relationLayer: RelationLayer
  topicLayer: TopicLayer
  synthesisLayer: SynthesisLayer
  rawResult: JudgmentResult
}

/**
 * 八字四层推理流水线——完整的对人输出
 *
 * 用法: 跟 analyzeJudgment 参数相同
 */
export function runPipeline(
  pills: Pillar[],
  riGan: string,
  gender: string,
  birthYear: number,
  currentYear: number,
  currentDaYunGan?: string,
  currentDaYunZhi?: string
): PipelineResult {
  // 先调用原有的 analyzeJudgment 拿到所有原始数据
  const result = analyzeJudgment(
    pills.map(p => ({ gan: p.gan, zhi: p.zhi, gz: p.gz })),
    riGan,
    gender,
    birthYear,
    currentYear,
    currentDaYunGan,
    currentDaYunZhi
  )

  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)

  // L1 基础层
  const baseLayer = buildBaseLayer(gans, zhis,
    result.bodySeasonNarr?.[0]?.includes('身强') ? '身强' :
    result.bodySeasonNarr?.[0]?.includes('身弱') ? '身弱' : '身中和'
  )

  // L2 关系层
  const relationLayer = buildRelationLayer(baseLayer)

  // L3 专题层
  const topicLayer = buildTopicLayer(baseLayer, relationLayer, result)

  // L4 综合层
  const synthesisLayer = buildSynthesisLayer(baseLayer, relationLayer, topicLayer, result)

  return { baseLayer, relationLayer, topicLayer, synthesisLayer, rawResult: result }
}

/**
 * synthesizeNLP — 把人话合成引擎
 * 
 * 100轮打磨产出：把技术报告变成对用户说的话
 * 去掉五行加权评分、去掉冗余的数字，用大白话讲清楚关键点
 */
export function synthesizeNLP(pipeline: PipelineResult): string {
  const s = pipeline.synthesisLayer
  const b = pipeline.baseLayer
  const r = pipeline.relationLayer
  const t = pipeline.topicLayer
  const raw = pipeline.rawResult
  const out: string[] = []

  // === 人生标签 ===
  if (s.labels.length > 0) {
    const tagLine = s.labels.slice(0, 4).join(' · ')
    out.push(`📋 人生标签：${tagLine}`)
    out.push('')
  }

  // === 核心断语（对人说的话，不是技术报告） ===
  out.push('━━━ 你的八字核心 ━━━')
  out.push(s.core || '你有自己的节奏和方向。')
  out.push('')

  // === 事业方向 ===
  if (t.career && t.career.length < 80) {
    out.push(`💼 关于工作：${t.career}`)
  } else if (t.career) {
    out.push(`💼 关于工作：${t.career.slice(0, 80)}`)
  }

  // === 财富 ===
  if (t.wealth && t.wealth.length < 80) {
    out.push(`💰 关于财运：${t.wealth}`)
  }

  // === 感情 ===
  if (t.marriage && t.marriage.length < 80) {
    out.push(`❤️ 关于感情：${t.marriage}`)
  }

  // === 健康（取健康叙述的最后一句有用的） ===
  const healthLines = raw.healthNarr || []
  const shortHealth = healthLines.filter(h => h.length < 80 && !h.startsWith('━━'))
  if (shortHealth.length > 0) {
    out.push(`🏥 关于健康：${shortHealth.slice(-2).join(' ').slice(0, 120)}`)
  }

  // === 大运/流年 ===
  if (raw.daYunFourStepNarr && raw.daYunFourStepNarr.length > 0) {
    const firstDaYun = raw.daYunFourStepNarr[0]
    if (firstDaYun && firstDaYun.length < 100) {
      out.push(`📅 当前运势：${firstDaYun}`)
    }
  }

  out.push('')

  // === BFS 关系链（选最长的那个讲） ===
  if (r.bfsPaths.length > 0) {
    const interesting = r.bfsPaths.filter(p => p.nodes.length >= 3).slice(0, 2)
    if (interesting.length > 0) {
      out.push('━━━ 你八字里的隐藏关系 ━━━')
      for (const p of interesting) {
        out.push(`  ${p.desc}`)
      }
    }
  }

  // === 冲的预警 ===
  if (r.chongs.length > 0) {
    for (const ch of r.chongs) {
      const warnGan = ZHI_TO_GAN[ch.a] + ZHI_TO_GAN[ch.b]
      out.push(`⚠️ ${ch.a}${ch.b}冲——你做事快、目标明确，但走${warnGan.split('').join('/')}运时注意冲动，重大决定不要急着做。`)
    }
  }

  // === 两象定一象 ===
  if (s.doubleEvidence.length > 0) {
    out.push('')
    out.push(`📌 两象定一象：${s.doubleEvidence[0].slice(0, 120)}`)
  }

  // === 建议 ===
  if (s.advice) {
    out.push('')
    out.push(`💡 给你：${s.advice.replace(/\n/g, '。').slice(0, 200)}`)
  }

  return out.join('\n')
}
