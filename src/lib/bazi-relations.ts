// bazi-relations.ts — 四柱关系引擎（四柱视角）
// 供首页直排(src/app/app/AppClient.tsx)与八字板块(src/app/bazi/BaziClient.tsx)共用
// 包含：天干五合/地支六合/三合局/六冲/三刑/六害/相破/同柱关系/相邻生克/
//       五行分布(藏干本气中气余气)/五行流通/命宫身宫胎元/十神力量计数/六亲映射/人生阶段

export interface PillarLike {
  gz: string; gan: string; zhi: string; ny: string; hd: string;
  hdSS: { gan: string; ss: string }[];
  ssG: string; ssZ: string;
}

// ── 五行 ──
export const WX_OF: Record<string, string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}
export const WX_SHENG: Record<string, string> = {木:'火',火:'土',土:'金',金:'水',水:'木'} // 木生火…
export const WX_KE: Record<string, string> = {木:'土',火:'金',土:'水',金:'木',水:'火'} // 木克土…
export const WX_CYCLE = ['木','火','土','金','水']

// ── 关系查表 ──
// 天干五合（合化）
export const GAN_WUHE: Record<string, string> = {甲己:'化土',乙庚:'化金',丙辛:'化水',丁壬:'化木',戊癸:'化火'}
export const GAN_WUHE_PAIR: Record<string, string> = {甲:'己',乙:'庚',丙:'辛',丁:'壬',戊:'癸',己:'甲',庚:'乙',辛:'丙',壬:'丁',癸:'戊'}
// 地支六合（合化）
export const ZHI_LIUHE: Record<string, string> = {子丑:'合土',寅亥:'合木',卯戌:'合火',辰酉:'合金',巳申:'合水',午未:'合土'}
export const ZHI_LIUHE_PAIR: Record<string, string> = {子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'}
// 三合局
export const SANHE_JU: Record<string, string> = {申子辰:'水局',寅午戌:'火局',巳酉丑:'金局',亥卯未:'木局'}
// 六冲
export const LIU_CHONG: Record<string, string> = {子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'}
// 三刑（寅巳申=无恩之刑，丑戌未=恃势之刑，子卯=无礼之刑，辰午酉亥=自刑）
export const SAN_XING_GROUPS: { type: string; zhis: string[] }[] = [
  { type: '无恩之刑', zhis: ['寅','巳','申'] },
  { type: '恃势之刑', zhis: ['丑','戌','未'] },
  { type: '无礼之刑', zhis: ['子','卯'] },
]
// 自刑
export const ZI_XING = ['辰','午','酉','亥']
// 六害
export const LIU_HAI: Record<string, string> = {子:'未',未:'子',丑:'午',午:'丑',寅:'巳',巳:'寅',卯:'辰',辰:'卯',申:'亥',亥:'申',酉:'戌',戌:'酉'}
// 相破
export const XIANG_PO: Record<string, string> = {子:'酉',酉:'子',卯:'午',午:'卯',辰:'丑',丑:'辰',未:'戌',戌:'未',寅:'亥',亥:'寅',巳:'申',申:'巳'}

// 关系类型 → 展示颜色（暗色主题下）
export const REL_COLOR: Record<string, string> = {
  '同柱': '#60a5fa',      // 蓝
  '相邻生克': '#94a3b8',  // 灰
  '天干五合': '#fbbf24',  // 金
  '地支六合': '#4ade80',  // 绿
  '三合局': '#22d3ee',    // 青
  '六冲': '#f87171',      // 红
  '三刑': '#fb923c',      // 橙
  '六害': '#c084fc',      // 紫
  '相破': '#f472b6',      // 粉
}

export interface BaziRelation {
  id: string
  type: string            // 同柱/相邻生克/天干五合/地支六合/三合局/六冲/三刑/六害/相破/自刑
  sub: string             // 具体描述：如 丙辛合化水 / 申子辰水局 / 恃势之刑
  a: string               // 节点 id：g0-g3（天干）或 z0-z3（地支）
  b: string
  pillars: string         // 涉及柱：如 "年-月"
  note?: string           // 恃势/隔位等补充
}

export const NODE_PILLAR = ['年柱','月柱','日柱','时柱']

// 同柱关系：支生干/干生支/自坐同气/盖头/截脚
export function samePillarRelation(gan: string, zhi: string): { type: string; sub: string } {
  const wg = WX_OF[gan], wz = WX_OF[zhi]
  if (wg === wz) return { type: '同柱', sub: '自坐同气' }
  if (WX_SHENG[wg] === wz) return { type: '同柱', sub: `天干${wg}生地支${wz}` }
  if (WX_SHENG[wz] === wg) return { type: '同柱', sub: `地支${wz}生天干${wg}` }
  if (WX_KE[wg] === wz) return { type: '同柱', sub: `盖头（天干${wg}克地支${wz}）` }
  return { type: '同柱', sub: `截脚（地支${wz}克天干${wg}）` }
}

// 两字五行生克关系（用于相邻柱）
export function wxRelation(ga: string, gb: string): string {
  const wa = WX_OF[ga], wb = WX_OF[gb]
  if (wa === wb) return '比和'
  if (WX_SHENG[wa] === wb) return `${wa}生${wb}`
  if (WX_SHENG[wb] === wa) return `${wb}生${wa}`
  if (WX_KE[wa] === wb) return `${wa}克${wb}`
  return `${wb}克${wa}`
}

// 干支带五行描述（如「甲木克己土」）
export function wxPairDesc(a: string, b: string): string {
  const wa = WX_OF[a], wb = WX_OF[b]
  if (wa === wb) return `${a}${wa}与${b}${wb}比和`
  if (WX_SHENG[wa] === wb) return `${a}${wa}生${b}${wb}`
  if (WX_SHENG[wb] === wa) return `${b}${wb}生${a}${wa}`
  if (WX_KE[wa] === wb) return `${a}${wa}克${b}${wb}`
  return `${b}${wb}克${a}${wa}`
}

// ── 全量关系计算 ──
export function computeAllRelations(pills: PillarLike[]): { relations: BaziRelation[]; byNode: Record<string, BaziRelation[]> } {
  const relations: BaziRelation[] = []
  let rid = 0
  const push = (r: Omit<BaziRelation, 'id'>) => { relations.push({ ...r, id: 'r' + (rid++) }) }
  const pairPillars = (i: number, j: number) => `${NODE_PILLAR[i]}-${NODE_PILLAR[j]}`

  // 1. 同柱（4 条纵向）
  for (let i = 0; i < 4; i++) {
    const r = samePillarRelation(pills[i].gan, pills[i].zhi)
    push({ type: r.type, sub: r.sub, a: `g${i}`, b: `z${i}`, pillars: NODE_PILLAR[i] })
  }

  // 2. 相邻柱生克（天干-天干、地支-地支，横向）
  for (let i = 0; i < 3; i++) {
    const j = i + 1
    push({ type: '相邻生克', sub: `天干：${wxPairDesc(pills[i].gan, pills[j].gan)}`, a: `g${i}`, b: `g${j}`, pillars: pairPillars(i, j) })
    push({ type: '相邻生克', sub: `地支：${wxPairDesc(pills[i].zhi, pills[j].zhi)}`, a: `z${i}`, b: `z${j}`, pillars: pairPillars(i, j) })
  }

  // 3. 天干五合（任意两柱）
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const key = pills[i].gan + pills[j].gan
    if (GAN_WUHE[key] || GAN_WUHE[pills[j].gan + pills[i].gan]) {
      const hua = GAN_WUHE[key] || GAN_WUHE[pills[j].gan + pills[i].gan]
      push({ type: '天干五合', sub: `${pills[i].gan}${pills[j].gan}合${hua}`, a: `g${i}`, b: `g${j}`, pillars: pairPillars(i, j) })
    }
  }

  // 4. 地支关系（任意两柱）
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const za = pills[i].zhi, zb = pills[j].zhi
    const isAdjacent = j === i + 1
    // 六合
    const he = ZHI_LIUHE[za + zb] || ZHI_LIUHE[zb + za]
    if (he) push({ type: '地支六合', sub: `${za}${zb}${he}`, a: `z${i}`, b: `z${j}`, pillars: pairPillars(i, j) })
    // 六冲
    if (LIU_CHONG[za] === zb) push({ type: '六冲', sub: `${za}${zb}相冲`, a: `z${i}`, b: `z${j}`, pillars: pairPillars(i, j), note: isAdjacent ? '紧邻相冲，力量最显' : '隔位相冲，力量递减' })
    // 六害
    if (LIU_HAI[za] === zb) push({ type: '六害', sub: `${za}${zb}相害`, a: `z${i}`, b: `z${j}`, pillars: pairPillars(i, j), note: isAdjacent ? '' : '隔位相害，影响减弱' })
    // 相破
    if (XIANG_PO[za] === zb) push({ type: '相破', sub: `${za}${zb}相破`, a: `z${i}`, b: `z${j}`, pillars: pairPillars(i, j) })
    // 三刑
    for (const g of SAN_XING_GROUPS) {
      if (g.zhis.includes(za) && g.zhis.includes(zb) && za !== zb) {
        push({ type: '三刑', sub: `${za}${zb}相刑（${g.type}）`, a: `z${i}`, b: `z${j}`, pillars: pairPillars(i, j), note: g.type })
      }
    }
    // 自刑
    if (za === zb && ZI_XING.includes(za)) push({ type: '三刑', sub: `${za}${za}自刑`, a: `z${i}`, b: `z${j}`, pillars: pairPillars(i, j), note: '自刑' })
  }

  // 5. 三合局（三字成局）
  for (const [group, name] of Object.entries(SANHE_JU)) {
    const parts = group.split('')
    const idx: number[] = []
    for (const z of parts) { const k = pills.findIndex(p => p.zhi === z); if (k >= 0 && !idx.includes(k)) idx.push(k) }
    if (idx.length === 3) {
      for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) {
        push({ type: '三合局', sub: `${group.split('').join('')}${name}（${parts.join('')}）`, a: `z${idx[a]}`, b: `z${idx[b]}`, pillars: `${NODE_PILLAR[idx[a]]}-${NODE_PILLAR[idx[b]]}`, note: `三合${name}` })
      }
    }
  }

  // 按节点索引
  const byNode: Record<string, BaziRelation[]> = {}
  for (const r of relations) {
    if (!byNode[r.a]) byNode[r.a] = []
    byNode[r.a].push(r)
    if (!byNode[r.b]) byNode[r.b] = []
    byNode[r.b].push(r)
  }
  return { relations, byNode }
}

// ── 命宫/身宫/胎元（与 BaziClient 同算法） ──
const _GAN = ['', '甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const _MONTH_ZHI = ['', '寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑']
const _ZHI = ['', '子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

export function calcMingGong(yearGan: string, monthZhi: string, timeZhi: string): string {
  const mzi = _MONTH_ZHI.indexOf(monthZhi)
  const tzi = _MONTH_ZHI.indexOf(timeZhi)
  let offset = mzi + tzi
  offset = (offset >= 14 ? 26 : 14) - offset
  const ygi = _GAN.indexOf(yearGan) - 1
  let ganIdx = (ygi + 1) * 2 + offset
  while (ganIdx > 10) ganIdx -= 10
  return _GAN[ganIdx] + _MONTH_ZHI[offset]
}
export function calcShenGong(yearGan: string, monthZhi: string, timeZhi: string): string {
  const mzi = _MONTH_ZHI.indexOf(monthZhi)
  const tzi = _ZHI.indexOf(timeZhi)
  let offset = mzi + tzi
  if (offset > 12) offset -= 12
  const ygi = _GAN.indexOf(yearGan) - 1
  let ganIdx = (ygi + 1) * 2 + offset
  while (ganIdx > 10) ganIdx -= 10
  return _GAN[ganIdx] + _MONTH_ZHI[offset]
}
export function calcTaiYuan(monthGan: string, monthZhi: string): string {
  const gi = _GAN.indexOf(monthGan)
  const zi = _MONTH_ZHI.indexOf(monthZhi)
  const tyg = _GAN[gi + 1 > 10 ? gi + 1 - 10 : gi + 1]
  const tyz = _MONTH_ZHI[zi + 3 > 12 ? zi + 3 - 12 : zi + 3]
  return tyg + tyz
}

// ── 五行分布（天干 + 藏干本气/中气/余气） ──
export interface WxDetail { count: number; gan: number; ben: number; zhong: number; yu: number }
export function wuxingDetail(pills: PillarLike[]): Record<string, WxDetail> {
  const res: Record<string, WxDetail> = {}
  for (const w of WX_CYCLE) res[w] = { count: 0, gan: 0, ben: 0, zhong: 0, yu: 0 }
  for (const p of pills) {
    res[WX_OF[p.gan]].count++; res[WX_OF[p.gan]].gan++
    const hd = p.hdSS
    if (hd[0]) { res[WX_OF[hd[0].gan]].count++; res[WX_OF[hd[0].gan]].ben++ }
    if (hd[1]) { res[WX_OF[hd[1].gan]].count++; res[WX_OF[hd[1].gan]].zhong++ }
    if (hd[2]) { res[WX_OF[hd[2].gan]].count++; res[WX_OF[hd[2].gan]].yu++ }
  }
  return res
}

// ── 五行流通（生克环） ──
export function wuxingFlow(wx: Record<string, WxDetail>): { sheng: { from: string; to: string; active: boolean }[]; ke: { from: string; to: string; active: boolean }[] } {
  const sheng = [], ke = []
  for (const w of WX_CYCLE) {
    const to = WX_SHENG[w]
    sheng.push({ from: w, to, active: wx[w].count > 0 && wx[to].count > 0 })
  }
  for (const w of WX_CYCLE) {
    const to = WX_KE[w]
    ke.push({ from: w, to, active: wx[w].count > 0 && wx[to].count > 0 })
  }
  return { sheng, ke }
}

// ── 十神力量计数（天干1 + 藏干本气0.6/中气0.4/余气0.2） ──
export const SS_GROUP: Record<string, string> = {比肩:'比劫',劫财:'比劫',食神:'食伤',伤官:'食伤',正财:'财星',偏财:'财星',正官:'官杀',七杀:'官杀',正印:'印星',偏印:'印星'}
export function shenshaPower(pills: PillarLike[]): { group: string; power: number; detail: string[] }[] {
  const power: Record<string, number> = { 比劫: 0, 食伤: 0, 财星: 0, 官杀: 0, 印星: 0 }
  const detail: Record<string, string[]> = { 比劫: [], 食伤: [], 财星: [], 官杀: [], 印星: [] }
  const weights = [1, 0.6, 0.4, 0.2] // 天干、本气、中气、余气
  for (const p of pills) {
    const w = (ss: string, tag: string) => {
      if (!ss) return
      const g = SS_GROUP[ss]
      if (g) { power[g] += weights[tag === '天干' ? 0 : tag === '本气' ? 1 : tag === '中气' ? 2 : 3]; detail[g].push(`${p.gz}${tag === '天干' ? '干' : '藏'}${ss}`) }
    }
    w(p.ssG, '天干')
    p.hdSS.forEach((h, i) => w(h.ss, i === 0 ? '本气' : i === 1 ? '中气' : '余气'))
  }
  return Object.entries(power).map(([group, p]) => ({ group, power: Math.round(p * 10) / 10, detail: detail[group] })).sort((a, b) => b.power - a.power)
}

// ── 六亲映射 ──
export function liuqinOf(ss: string, gender: '男' | '女'): string[] {
  const out: string[] = []
  const add = (s: string) => { if (!out.includes(s)) out.push(s) }
  switch (ss) {
    case '比肩': case '劫财': add('兄弟'); if (gender === '男') add('姐妹'); else add('姐妹'); break
    case '偏财': add('父亲'); break
    case '正财': add(gender === '男' ? '妻子' : '父亲'); break
    case '正印': add('母亲'); break
    case '偏印': add(gender === '男' ? '继母/祖父' : '继母/祖父'); break
    case '正官': add(gender === '女' ? '丈夫' : '女儿'); break
    case '七杀': add(gender === '女' ? '丈夫/情人' : '儿子'); break
    case '食神': add(gender === '女' ? '女儿' : '子女'); break
    case '伤官': add(gender === '女' ? '儿子' : '子女'); break
  }
  return out
}

// ── 柱间配对一览 ──
export interface PillarPairInfo { pair: string; i: number; j: number; adjacent: boolean; relations: BaziRelation[] }
export function pillarPairs(pills: PillarLike[]): PillarPairInfo[] {
  const { relations } = computeAllRelations(pills)
  const out: PillarPairInfo[] = []
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const rels = relations.filter(r => {
      const na = parseInt(r.a.slice(1)), nb = parseInt(r.b.slice(1))
      return (na === i && nb === j) || (na === j && nb === i)
    })
    out.push({ pair: `${NODE_PILLAR[i]}·${NODE_PILLAR[j]}`, i, j, adjacent: j === i + 1, relations: rels })
  }
  return out
}

// ── 人生阶段 ──
export const STAGE_INFO = [
  { idx: 0, stage: '少年', range: '0-15岁', gongwei: '祖业 · 长辈 · 根基', role: '看祖荫与早年家境' },
  { idx: 1, stage: '青年', range: '16-30岁', gongwei: '父母 · 兄弟 · 同侪', role: '看学业事业起步与社交' },
  { idx: 2, stage: '中年', range: '31-45岁', gongwei: '自身 · 配偶（日支=夫妻宫）', role: '看婚姻与事业巅峰' },
  { idx: 3, stage: '晚年', range: '46岁以后', gongwei: '子女 · 归宿 · 晚景', role: '看子女缘与晚年福荫' },
]

export interface StageDetail {
  idx: number; stage: string; range: string; gongwei: string; role: string
  pill: PillarLike; dayun: { gz: string; age: number }[]; brief: string
}

export function lifeStages(pills: PillarLike[], dayun: { gz: string; age: number; startYear: number }[]): StageDetail[] {
  return STAGE_INFO.map(s => {
    const ranges = [ [0, 15], [16, 30], [31, 45], [46, 120] ]
    const [rs, re] = ranges[s.idx]
    const dy = dayun.filter(d => d.age <= re && d.age + 9 >= rs).map(d => ({ gz: d.gz, age: d.age }))
    const p = pills[s.idx]
    const briefs: string[] = []
    if (s.idx === 0) {
      if (p.ssG === '七杀' || p.ssG === '正官') briefs.push('祖上或有功名，家风严谨')
      if (p.ssG === '偏财') briefs.push('祖辈善于经营')
      if (p.ssG === '正印') briefs.push('得长辈荫庇，早年学业顺')
    } else if (s.idx === 1) {
      if (p.ssG === '正财' || p.ssG === '偏财') briefs.push('父母有财缘，家中经济宽裕')
      if (p.ssG === '比肩' || p.ssG === '劫财') briefs.push('兄弟同侪缘分重，宜合伙亦防争财')
      if (p.ssG === '正印' || p.ssG === '偏印') briefs.push('学业有成，靠知识立身')
    } else if (s.idx === 2) {
      if (p.ssZ === '正财' || p.ssZ === '偏财') briefs.push('配偶贤惠能干，婚姻助力大')
      if (p.ssZ === '正官' || p.ssZ === '七杀') briefs.push('配偶有主见，婚姻需多沟通')
      if (p.ssG === '食神' || p.ssG === '伤官') briefs.push('中年才华施展，事业渐入佳境')
    } else {
      if (p.ssG === '食神' || p.ssG === '伤官') briefs.push('子女有才华，晚年享清福')
      if (p.ssG === '正官' || p.ssG === '七杀') briefs.push('子女有出息，晚景有依靠')
      if (p.ssG === '比肩' || p.ssG === '劫财') briefs.push('晚年宜守成，防财帛外耗')
    }
    return { idx: s.idx, stage: s.stage, range: s.range, gongwei: s.gongwei, role: s.role, pill: p, dayun: dy, brief: briefs.join('；') || '此柱十神平和，该阶段运势平稳' }
  })
}
