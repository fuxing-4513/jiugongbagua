/**
 * bazi-yifan.ts — 易凡老师八字命理推理引擎
 *
 * 基于《甲辰杭州基础班》①② 全套知识体系重构
 * 涵盖：六穿/六冲/三刑/暗合/破/自合/三合深度/六合人性/
 *       出处共根借根/旺相休囚死/干支虚实/旺点/换象/断事
 *
 * 用法：
 *   import { yifanAnalysis } from '@/lib/bazi-yifan'
 *   const result = yifanAnalysis(siZhu, birthYear, gender)
 */

import type { PillarInfo, BaziChartResult } from './bazi-engine'
import { wxM, ssM, hA, hG } from './bazi-engine'

// ── 类型定义 ──

export interface YifanAnalysis {
  /** 日主心性 (来自日柱+周围关系) */
  riZhuXinXing: string[]
  /** 地支关系详解 */
  diZhiGuanXi: string[]
  /** 六穿分析 */
  liuChuan: string[]
  /** 六冲分析 */
  liuChong: string[]
  /** 三合六合分析 */
  sanHeLiuHe: string[]
  /** 三刑/暗合/破/自合 */
  xingPoAnHe: string[]
  /** 出处共根借根 */
  chuChuGongGen: string[]
  /** 旺相休囚死 + 干支虚实 */
  wangXiangXuShi: string[]
  /** 旺点分析 */
  wangDian: string[]
  /** 十神组合解读 */
  shiShen: string[]
  /** 综合断事 */
  zongHe: string[]
  /** 八字性格总评 */
  summary: string
}

// ── 地支常量 ──

const DIZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

// 地支藏干
const CANG_GAN: Record<string, string[]> = {
  '子':['癸'],'丑':['己','癸','辛'],'寅':['甲','丙','戊'],'卯':['乙'],
  '辰':['戊','乙','癸'],'巳':['丙','庚','戊'],'午':['丁','己'],'未':['己','丁','乙'],
  '申':['庚','壬','戊'],'酉':['辛'],'戌':['戊','辛','丁'],'亥':['壬','甲']
}

// ── 六穿表 ──
const LIU_CHUAN: Record<string, {active:string; desc:string; hide:boolean; same:boolean}> = {
  '卯辰': {active:'卯木', desc:'卯木穿辰土 — 公关能力极强，目标明确，注重承诺。卯木投辰土所好，擅长成交订单。', hide:true, same:true},
  '辰卯': {active:'辰土', desc:'辰土被卯木穿 — 做决定不快，常被挑毛病。会被画饼。需要别人认可才行动。', hide:true, same:true},
  '寅巳': {active:'寅木', desc:'寅巳穿 — 能发现别人的问题但发现不了自己的。有共同点所以能共情说服人。寅木会扯开话题，要求巳火给具体方案。', hide:true, same:true},
  '巳寅': {active:'巳火', desc:'巳火被寅木穿 — 会给寅木规划未来方向，提多种方案（海陆空全方位）。非常迫切想要结果，希望快速执行。', hide:true, same:true},
  '丑午': {active:'午火', desc:'丑午穿 — 用自己的标准衡量别人，做试探，会掩饰真实目的。给时间限定。比寅巳穿更犀利。', hide:true, same:true},
  '午丑': {active:'丑土', desc:'丑土被午火穿 — 做每件事都找午火分析建议。必须100%以上才做决定。需要大量数据论证。内心敏感谨慎。', hide:true, same:true},
  '子未': {active:'未土', desc:'子未穿 — 唯一没有相同五行的穿，直截了当不隐藏。以结果为导向才认可。点子多适合做策划但执行力不够。', hide:false, same:false},
  '未子': {active:'子水', desc:'子水被未土穿 — 不会隐藏自己，有话直说。讲出自己认为的，不考虑对方要不要。喜欢分享成果。', hide:false, same:false},
  '酉戌': {active:'戌土', desc:'酉戌穿 — 戌土一见酉金就停不下来聊天，一见如故。戌土认为领导太了解自己，士为知己者死。容易因嘴得罪人。', hide:true, same:true},
  '戌酉': {active:'酉金', desc:'酉金被戌土穿 — 需要戌土经常汇报具体事项。戌土说话要有底气，没底气遇见酉金就哆嗦。隐藏自己真正想要的。', hide:true, same:true},
  '申亥': {active:'申金', desc:'申亥穿 — 申金必须说服亥水无条件听自己的。双方都不服，找合伙人难。申金不会委婉。', hide:true, same:true},
  '亥申': {active:'亥水', desc:'亥水被申金穿 — 有自己的想法难被说服。找合伙人必须认可自己的价值观。亥水有甲木认为自己的想法是对的。', hide:true, same:true},
}

// ── 六冲表 ──
const LIU_CHONG: Record<string, {active:string; desc:string}> = {
  '子午': {active:'子水', desc:'子午冲 — 直接光明磊落，要么行要么不行。想做事情不会藏着。做任何事不能直接做，直接做就败。一定要有准备和时间差。不喜天干走地支的字。'},
  '午子': {active:'午火', desc:'午子冲 — 同上。冲是双方参与的，一方不参与就冲不起来。表面冲动其实背后已经做了很多准备。'},
  '卯酉': {active:'卯木', desc:'卯酉冲 — 社恐，深思熟虑不会突然决定。慢热型有选择性交朋友。听众型跟朋友在一起永远是听众。想要自由没有太多约束的工作环境。'},
  '酉卯': {active:'酉金', desc:'酉卯冲 — 禄被官杀冲。希望身边的人有原则有规矩。对自己要求高。'},
  '寅申': {active:'寅木', desc:'寅申冲 — 也是听众但说话会多一些，会交流。聊的话题有一致性，最终必须聊出一个结果才散。'},
  '申寅': {active:'申金', desc:'申寅冲 — 印和食伤冲。极度自律，对吃、漂亮东西、人的心理有研究。在外自律在家放松。'},
  '辰戌': {active:'辰土', desc:'辰戌冲 — 表面是土冲在心里不明显。禄和财的组合，要有足够钱才有安全感。追求持续不断的技术收入。'},
  '戌辰': {active:'戌土', desc:'戌辰冲 — 觉得学的东西不够，继续学。逢戌土年份有变化。需要足够安全感。'},
  '巳亥': {active:'巳火', desc:'巳亥冲 — 价值观驱动，只认定自己价值观的事情才有动力。不认可就不干。要搞定对方就让对方认可自己的价值观。'},
  '亥巳': {active:'亥水', desc:'亥巳冲 — 考虑客户需要什么能给予什么。认清自己，放下旧的执念。'},
  '丑未': {active:'丑土', desc:'丑未冲 — 没有忧患意识，赚一点就享受。有钱多花没钱少花。对心情和爱好有要求。'},
  '未丑': {active:'未土', desc:'未丑冲 — 对享受的标准不随意。与辰戌冲的区别是没有忧患意识。'},
}

// ── 六合表 ──
const LIU_HE: Record<string, {desc:string; yin:boolean; cangGanHe:string[]}> = {
  '子丑': {desc:'子丑合 — 克的关系（丑土克子水），有一定同频（丑中有子水根）。双方认为对方应该帮自己。丑土想让子水听话给面子。', yin:false, cangGanHe:['戊癸']},
  '丑子': {desc:'子丑合 — 子水想得到事业，不想被管。子丑合=培训员工的生财之道。丑土在旺点会用爱之名管子水。', yin:false, cangGanHe:['戊癸']},
  '寅亥': {desc:'寅亥合 — 生的关系（亥水生寅木），同频度较高。相互拉扯，谁也不认可谁。暗藏壬丙冲，说话做事直接。', yin:true, cangGanHe:['丁壬']},
  '亥寅': {desc:'寅亥合 — 亥水想控制寅木的自由。会嘘寒问暖事事操心。自己旺时想控制，不旺时关心照顾。若亥水在比劫宫代表财要小心。', yin:true, cangGanHe:['丁壬']},
  '卯戌': {desc:'卯戌合 — 藏干生（卯木生戌土火），最难同频。各自有各自想法，很难达成一致。卯木控制欲强只在意自己感受。', yin:false, cangGanHe:['丙辛']},
  '戌卯': {desc:'卯戌合 — 戌土让卯木先做到再要求自己。很难相信认可卯木。要求卯木以结果为导向。开局很大越做越小。', yin:false, cangGanHe:['丙辛']},
  '辰酉': {desc:'辰酉合 — 生的关系（辰土生酉金），很难同频。辰土想教育酉金挑毛病。不要要求同频，各自完成各自目标。', yin:true, cangGanHe:['乙庚']},
  '酉辰': {desc:'辰酉合 — 酉金认为辰土的一切是自己给的。辰土夸赞认可酉金就开心。希望辰土体谅自己帮自己。', yin:true, cangGanHe:['乙庚']},
  '巳申': {desc:'巳申合 — 克的关系（巳火克申金），部分同频。壬丙冲谁也不服谁。最终相互妥协。巳火最吃软。', yin:false, cangGanHe:['丙辛']},
  '申巳': {desc:'巳申合 — 申金希望巳火不要变来变去又希望会变通。总认为巳火不如自己。会先诉苦。受伤时自我安慰。', yin:false, cangGanHe:['丙辛']},
  '午未': {desc:'午未合 — 唯一相互生的六合，最容易达成共识，好相处。午火自来熟容易和比劫打成一片。喜欢帮助奉献没有私心。', yin:true, cangGanHe:['甲己','丁壬']},
  '未午': {desc:'午未合 — 未土认为午火帮自己是理所应当。不分家里家外。想改造午火变成自己。会翻旧账。', yin:true, cangGanHe:['甲己','丁壬']},
}

// ── 三合特性 ──
const SAN_HE: Record<string, {desc:string; elements:string[]}> = {
  '申子辰': {desc:'申子辰三合水局 — 都藏有水有相同目标血缘。子水想得到辰土（事业），会认申金为大哥让其引荐。申子最亲近（印的关系），申辰有目的性。最厉害公关：水日主月令辰土年上申金。', elements:['申','子','辰']},
  '寅午戌': {desc:'寅午戌三合火局 — 最舒服的合，大家一起成就戌土。寅木是唯一又生又克的隅神，想管是因为想让戌土认可。午火在坐下戌土在年上为最佳配置。戌土认为寅木是人才。', elements:['寅','午','戌']},
  '巳酉丑': {desc:'巳酉丑三合金局 — 唯一隅神克中神的三合（巳火克酉金）。巳火以结果为导向，注重别人评判。巳火极度想控制酉金但永远不知道酉金想要什么。', elements:['巳','酉','丑']},
  '亥卯未': {desc:'亥卯未三合木局 — 卯木中神最不容易——有问题会内耗。卯木克未土是唯一隅神克库的三合。卯木必须见到结果才行动，永远不会做第一批人。', elements:['亥','卯','未']},
}

// ── 自合柱 ──
const ZI_HE: Record<string, string> = {
  '甲午':'甲己合（合财）','丙戌':'丙辛合（合财/官杀）','丁亥':'丁壬合（合官杀/财）',
  '戊子':'戊癸合（合财）','己亥':'甲己合（合官杀/财）','辛巳':'丙辛合（合官杀/财）',
  '壬午':'丁壬合（合财/官杀）','壬戌':'丁壬合（合财）','癸巳':'戊癸合（合官杀）',
  '庚辰':'乙庚合（合印/财）','乙巳':'乙庚合（合财/官杀）',
}

// ── 暗合 ──
const AN_HE: Record<string, string> = {
  '子巳':'戊癸合（巳火制癸水）','巳子':'戊癸合（巳火制癸水）',
  '寅丑':'甲己合+丙辛合+戊癸合','丑寅':'甲己合+丙辛合+戊癸合',
  '卯申':'乙庚合','申卯':'乙庚合',
  '午亥':'丁壬合+甲己合','亥午':'丁壬合+甲己合',
}

// ── 破 ──
const PO: Record<string, string> = {
  '子卯':'子水推翻卯木原有想法，否定结果/想法/认知。不破不立，推倒重来。必须听我的从头再来。',
  '卯子':'卯木被子水破，比劫总否定自己。感到痛苦怀疑自己怀疑人生。',
}

// ── 三刑 ──
const SAN_XING: Record<string, string> = {
  '丑未戌':'丑未戌三刑 — 学习效仿。看到别人的好东西就想学。思考多、想的多、多方权衡利弊。包容。坐下库的人想的特别多喜欢自己琢磨。',
  '寅巳申':'寅巳申三刑 — 体系复杂，很难达到一致性。巳火双面角色，一边说寅木好一边说申金好。谁出来了谁就主动。', 
}

// ── 旺相休囚死 ──
const WANG_XIANG: Record<string, Record<string, string>> = {
  '春': {'木':'旺','火':'相','土':'死','金':'囚','水':'休'},
  '夏': {'木':'休','火':'旺','土':'相','金':'死','水':'囚'},
  '秋': {'木':'死','火':'囚','土':'休','金':'旺','水':'相'},
  '冬': {'木':'相','火':'死','土':'囚','金':'休','水':'旺'},
  '四季': {'木':'囚','火':'休','土':'旺','金':'相','水':'死'},
}

const MONTH_SEASON: Record<string, string> = {
  '寅':'春','卯':'春','辰':'春',
  '巳':'夏','午':'夏','未':'夏',
  '申':'秋','酉':'秋','戌':'秋',
  '亥':'冬','子':'冬','丑':'冬',
}

// ── 出处（各五行出处） ──
const CHU_CHU: Record<string, string[]> = {
  '火':['戌土','未土'], '水':['辰土','丑土'], '土':['辰土','戌土','丑土','未土'],
  '木':['辰土','未土'], '金':['戌土','丑土'],
}

// ── 最佳共根 ──
const BEST_GONG_GEN: Record<string, string> = {
  '甲':'辰土','乙':'辰土','丙':'未土','丁':'未土','戊':'戌土','己':'戌土',
  '庚':'丑土','辛':'丑土','壬':'丑土','癸':'丑土',
}

// ── 日主特性 ──
const RI_ZHU_WUXING: Record<string, string> = {
  '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水',
}

// ── 坐下地支共性 ──
const ZUO_XIA: Record<string, string[]> = {
  '寅':['喜欢管比劫操心','有征服感希望被认可','没有压力动不了','修自己很困难都是无意识的'],
  '巳':['以结果为导向','注重别人评判看法','决定了九头牛拉不回','选择了就不后悔','需要认可赞美'],
  '卯':['内耗型人格必须说服自己','隐藏想法套不出来','认定的事很难改','专一爱干净有规律','必须见结果才行动'],
  '亥':['会筛选身边的人','喜欢分享喜悦','不轻易做承诺','不喜欢别人不守时拖拉','觉得赞美是虚的'],
  '未':['以结果为导向','搞钱执行力很强','快速变现','要在吃喝中聊事业','希望身边人言而有信'],
  '子':['不喜欢约束','喜欢自由自在','学习要一帮比劫生食伤'],
  '辰':['拖拉不给自己压力','自我安慰能力极强','永远留有余粮'],
  '酉':['中神专一对喜欢的事全身心','笑点高不轻易承诺','经常内耗自己','说服容易认可难'],
  '戌':['想法多顾虑多','需足够安全感','学无止境'],
  '申':['自律在外放松在家','对吃和研究有热情','有研究精神'],
  '丑':['内心敏感谨慎','做决定慢必须100%以上','需要大量数据论证'],
  '午':['直接光明磊落','一定要有准备才能做','信心十足易冲动'],
}

// ── 辅助函数 ──

function getGanWx(g: string): string { return wxM[g]||'' }
function getZhiWx(z: string): string { return wxM[z]||'' }

function getSeason(monthZhi: string): string { return MONTH_SEASON[monthZhi] || '四季' }

function hasZhi(pills: PillarInfo[], zhi: string): boolean {
  return pills.some(p => p.zhi === zhi)
}

function findZhiPairs(pills: PillarInfo[], pairMap: Record<string, string>): string[] {
  const result: string[] = []
  const zhis = pills.map(p => p.zhi)
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const key = zhis[i] + zhis[j]
      const rev = zhis[j] + zhis[i]
      if (pairMap[key]) result.push(key + '=' + pairMap[key])
      else if (pairMap[rev]) result.push(rev + '=' + pairMap[rev])
    }
  }
  return result
}

function findTriplet(pills: PillarInfo[], triplet: string[]): boolean {
  const zhis = pills.map(p => p.zhi)
  return triplet.every(t => zhis.includes(t))
}

function hasHe(pills: PillarInfo[]): string[] {
  return findZhiPairs(pills, (() => {
    const m: Record<string, string> = {}
    Object.entries(LIU_HE).forEach(([k, v]) => { m[k] = v.desc })
    return m
  })())
}

// ── 六穿分析 ──
export function analyzeLiuChuan(pills: PillarInfo[]): string[] {
  const zhis = pills.map(p => p.zhi)
  const result: string[] = []
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const key = zhis[i] + zhis[j]
      const rev = zhis[j] + zhis[i]
      if (LIU_CHUAN[key]) result.push(`${zhis[i]}${zhis[j]}穿: ${LIU_CHUAN[key].desc}`)
      else if (LIU_CHUAN[rev]) result.push(`${zhis[j]}${zhis[i]}穿: ${LIU_CHUAN[rev].desc}`)
    }
  }
  return result
}

// ── 六冲分析 ──
export function analyzeLiuChong(pills: PillarInfo[]): string[] {
  const zhis = pills.map(p => p.zhi)
  const result: string[] = []
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const key = zhis[i] + zhis[j]
      const rev = zhis[j] + zhis[i]
      if (LIU_CHONG[key]) result.push(`${zhis[i]}${zhis[j]}冲: ${LIU_CHONG[key].desc}`)
      else if (LIU_CHONG[rev]) result.push(`${zhis[j]}${zhis[i]}冲: ${LIU_CHONG[rev].desc}`)
    }
  }
  return result
}

// ── 三合分析 ──
export function analyzeSanHe(pills: PillarInfo[]): string[] {
  const result: string[] = []
  for (const [key, info] of Object.entries(SAN_HE)) {
    if (findTriplet(pills, info.elements)) {
      const chars = info.elements
      result.push(`${chars[0]}${chars[1]}${chars[2]}三合: ${info.desc}`)
    }
  }
  return result
}

// ── 六合分析 ──
export function analyzeLiuHe(pills: PillarInfo[]): string[] {
  return hasHe(pills)
}

// ── 三刑分析 ──
export function analyzeSanXing(pills: PillarInfo[]): string[] {
  const result: string[] = []
  const zhis = pills.map(p => p.zhi)
  // 丑未戌三刑
  if (zhis.includes('丑') && zhis.includes('未') && zhis.includes('戌')) {
    result.push(SAN_XING['丑未戌'])
  }
  // 寅巳申三刑
  if (zhis.includes('寅') && zhis.includes('巳') && zhis.includes('申')) {
    result.push(SAN_XING['寅巳申'])
  }
  return result
}

// ── 暗合分析 ──
export function analyzeAnHe(pills: PillarInfo[]): string[] {
  const result = findZhiPairs(pills, AN_HE)
  return result.map(r => `暗合: ${r}`)
}

// ── 破分析 ──
export function analyzePo(pills: PillarInfo[]): string[] {
  const result = findZhiPairs(pills, PO)
  return result.map(r => `破: ${r}`)
}

// ── 自合分析 ──
export function analyzeZiHe(pills: PillarInfo[]): string[] {
  const result: string[] = []
  for (const p of pills) {
    if (ZI_HE[p.gz]) {
      result.push(`${p.gz}自合: ${ZI_HE[p.gz]}`)
    }
  }
  return result
}

// ── 日主心性分析 ──
export function analyzeRiZhuXinXing(pills: PillarInfo[], riZhu: string): string[] {
  const result: string[] = []
  const dayPillar = pills[2]
  const monthPillar = pills[1]
  const hourPillar = pills[3]
  const riGan = dayPillar.gan
  const riZhi = dayPillar.zhi
  const riWx = getGanWx(riGan)

  // 日主五行性格
  result.push(`日主${riGan}属${riWx}`)

  // 坐下特性
  if (ZUO_XIA[riZhi]) {
    const traits = ZUO_XIA[riZhi]
    result.push(`坐下${riZhi}: ${traits.join('、')}`)
  }

  // 自合判断
  if (ZI_HE[dayPillar.gz]) {
    const zh = ZI_HE[dayPillar.gz]
    result.push(`${dayPillar.gz}自合 — ${zh}。自合的人目标明确，内心渴望强烈，很难从外部改造，必须从内突破。`)
  }

  // 月令影响
  const monthZhi = monthPillar.zhi
  const monthGan = monthPillar.gan
  result.push(`月令${monthZhi}是全局力量最大的点，月干${monthGan}对日主影响直接。`)
  
  // 时支影响
  result.push(`时支${hourPillar.zhi}影响内心世界。`)

  return result
}

// ── 出处共根借根分析 ──
export function analyzeChuChu(pills: PillarInfo[], riGan: string): string[] {
  const result: string[] = []
  const riWx = getGanWx(riGan)
  const bestGen = BEST_GONG_GEN[riGan]
  
  result.push(`${riGan}日主的最佳共根（印库）是${bestGen}`)

  // 各五行的出处
  const chu = CHU_CHU[riWx]
  if (chu) {
    result.push(`${riWx}的出处: ${chu.join('、')}`)
  }

  // 检查是否有库在地支
  const zhis = pills.map(p => p.zhi)
  const kuMap: Record<string, string> = {'辰':'水库','戌':'火库','丑':'金库','未':'木库'}
  for (const z of zhis) {
    if (kuMap[z]) {
      if (chu && chu.includes(z + '土')) {
        result.push(`地支有${z}${kuMap[z]}，是${riWx}的出处。`)
      }
    }
  }

  // 共根宫位
  for (let i = 0; i < pills.length; i++) {
    if (bestGen && pills[i].zhi.includes(bestGen.replace('土',''))) {
      const pos = ['年','月','日','时'][i]
      const meanings: Record<string, string> = {
        '年':'共根在年上最好，能量强层次高',
        '月':'共根在月令能享受比劫帮助',
        '日':'共根在坐下一般',
        '时':'共根在时支晚年可享受儿女福',
      }
      if (meanings[pos]) result.push(`${pos}柱有${bestGen}: ${meanings[pos]}`)
    }
  }

  return result
}

// ── 旺相休囚死分析 ──
export function analyzeWangXiang(pills: PillarInfo[], monthZhi: string): string[] {
  const result: string[] = []
  const season = getSeason(monthZhi)
  const wxState = WANG_XIANG[season]
  if (!wxState) return result

  result.push(`生于${season}季，月令${monthZhi}当令。`)
  
  for (const [wx, state] of Object.entries(wxState)) {
    result.push(`${wx}的状态为「${state}」`)
  }

  // 日主状态
  const riGanWx = getGanWx(pills[2].gan)
  const riWxState = wxState[riGanWx]
  if (riWxState) {
    if (riWxState === '旺' || riWxState === '相') {
      result.push(`日主${riGanWx}处于「${riWxState}」状态，得时得令。`)
    } else if (riWxState === '死' || riWxState === '囚') {
      result.push(`日主${riGanWx}处于「${riWxState}」状态，需要大运流年来补足。`)
    } else {
      result.push(`日主${riGanWx}处于「${riWxState}」状态。`)
    }
  }

  // 最弱五行提示
  let weakest = ['死','囚','休']
  for (const [wx, state] of Object.entries(wxState)) {
    if (state === '死') {
      result.push(`${wx}为「死」的状态，是最薄弱环节——不宜在此领域激进。`)
    }
  }

  return result
}

// ── 旺点分析 ──
export function analyzeWangDian(pills: PillarInfo[], riGan: string): string[] {
  const result: string[] = []
  const monthPillar = pills[1]
  const hourPillar = pills[3]
  const monthGan = monthPillar.gan
  const monthZhi = monthPillar.zhi
  const hourGan = hourPillar.gan
  const hourZhi = hourPillar.zhi

  // 月令旺点的十神
  const monthSS = ssM[riGan]?.[monthGan] || ''
  const hourSS = ssM[riGan]?.[hourGan] || ''
  
  result.push(`月令${monthZhi}（${monthGan}→${monthSS}）和时支${hourZhi}（${hourGan}→${hourSS}）是全局力量最大的两个旺点。`)

  // 月令十神的意义
  const ssMeanings: Record<string, string> = {
    '正印':'对家有一个完美要求','偏印':'战略眼光',
    '食神':'追求自在开心','伤官':'创新与突破',
    '正财':'追求稳定的财','偏财':'追求投资机会',
    '正官':'追求事业稳定','七杀':'追求突破和成就',
    '比肩':'朋友多在意友情','劫财':'朋友多社交广',
  }
  if (ssMeanings[monthSS]) result.push(`月令为${monthSS}，代表${ssMeanings[monthSS]}。`)
  if (ssMeanings[hourSS]) result.push(`时上为${hourSS}，代表${ssMeanings[hourSS]}。`)

  // 月令时支与日柱的亲密度
  const riZhi = pills[2].zhi
  const relationships: string[] = []
  const pairs = [[monthZhi, riZhi], [hourZhi, riZhi]]
  const allCombs = [...Object.keys(LIU_CHUAN), ...Object.keys(LIU_CHONG), 
    ...Object.keys(LIU_HE), ...Object.keys(AN_HE)]

  for (const [a, b] of pairs) {
    if (allCombs.includes(a + b) || allCombs.includes(b + a)) {
      relationships.push(`${a}与${b}有特殊关系（影响大）`)
    } else {
      const ma = getZhiWx(a)
      const mb = getZhiWx(b)
      if (ma && mb) {
        if (ma === mb) relationships.push(`${a}与${b}五行相同`)
        else relationships.push(`${a}(${ma})与${b}(${mb})有生克关系`)
      }
    }
  }
  
  result.push(`日支${riZhi}受月令${monthZhi}和时支${hourZhi}的影响: ${relationships.join('；')}`)

  return result
}

// ── 干支虚实分析 ──
export function analyzeXuShi(pills: PillarInfo[]): string[] {
  const result: string[] = []
  const xuShiMap: Record<string, {shi:string[]; xu:string[]}> = {
    '甲':{shi:['寅','辰','子'], xu:['申','戌','午']},
    '乙':{shi:['亥','卯','未'], xu:['巳','酉','丑']},
    '丙':{shi:['寅','午','戌'], xu:['子','申','辰']},
    '丁':{shi:['巳','卯','未'], xu:['亥','丑','酉']},
    '戊':{shi:['戌','午','辰'], xu:['子','申','寅']},
    '己':{shi:['巳','未','丑'], xu:['亥','酉','卯']},
    '庚':{shi:['申','辰','戌'], xu:['子','午','寅']},
    '辛':{shi:['丑','酉'], xu:['巳','亥','未','卯']},
    '壬':{shi:['申','子','辰'], xu:['戌','午','寅']},
    '癸':{shi:['亥','酉','丑'], xu:['巳','未','卯']},
  }

  for (const p of pills) {
    const gan = p.gan
    const zhi = p.zhi
    const ruler = xuShiMap[gan]
    if (ruler) {
      const isShi = ruler.shi.includes(zhi)
      const isXu = ruler.xu.includes(zhi)
      if (isShi) {
        result.push(`${p.gz} — ${gan}坐${zhi}为坐实，根基坚实。`)
      } else if (isXu) {
        result.push(`${p.gz} — ${gan}坐${zhi}为虚透，代表想法和追求，需要大运补足。`)
      }
    }
  }

  return result
}

// ── 十神组合解读 ──
export function analyzeShiShen(pills: PillarInfo[], riGan: string): string[] {
  const result: string[] = []
  
  // 统计各十神出现次数
  const ssCount: Record<string, number> = {}
  for (const p of pills) {
    const s = ssM[riGan]?.[p.gan] || ''
    if (s) ssCount[s] = (ssCount[s] || 0) + 1
  }

  const topSS = Object.entries(ssCount).sort((a, b) => b[1] - a[1])
  for (const [ss, count] of topSS.slice(0, 3)) {
    result.push(`${ss}出现${count}次`)
  }

  // 十神组合判断
  const hasKill = ssCount['七杀'] && ssCount['七杀'] > 0
  const hasGuan = ssCount['正官'] && ssCount['正官'] > 0
  const hasCai = (ssCount['正财'] || 0) + (ssCount['偏财'] || 0) > 1
  const hasYin = (ssCount['正印'] || 0) + (ssCount['偏印'] || 0) > 0
  const hasShiShang = (ssCount['食神'] || 0) + (ssCount['伤官'] || 0) > 0

  if (hasKill && hasGuan) result.push('官杀混杂 — 事业上选择多，需要专注。')
  if (hasCai && hasYin) result.push('财印双全 — 既有追求财富的动力，又有学习和思考的习惯。')
  if (hasShiShang && hasGuan) result.push('食伤制官杀 — 想做事业，有突破的意愿。')
  if (hasShiShang && hasCai) result.push('食伤生财 — 有投资倾向，用技术或创意换钱。')
  if (ssCount['比肩'] && ssCount['比肩'] > 1) result.push('比肩多现 — 朋友多在意友情，做事亲力亲为。')

  return result
}

// ── 综合断事 ──
export function analyzeZongHe(pills: PillarInfo[], birthYear: number, gender: string, riGan: string): string[] {
  const result: string[] = []
  const monthPillar = pills[1]
  const hourPillar = pills[3]
  const yearPillar = pills[0]
  const riZhi = pills[2].zhi

  // 婚姻宫
  result.push(`婚姻宫（日支）为${riZhi}，喜静不喜动。`)
  // 检查日支关系
  const zhis = pills.map(p => p.zhi)
  const chongPairs = Object.keys(LIU_CHONG)
  const chuanPairs = Object.keys(LIU_CHUAN)
  for (let i = 0; i < zhis.length; i++) {
    if (i === 2) continue // skip self
    const k1 = riZhi + zhis[i]
    const k2 = zhis[i] + riZhi
    if (chongPairs.includes(k1) || chongPairs.includes(k2)) {
      result.push(`日支${riZhi}与${zhis[i]}相冲，婚姻宫被冲动，感情易波动。`)
    }
    if (chuanPairs.includes(k1) || chuanPairs.includes(k2)) {
      result.push(`日支${riZhi}与${zhis[i]}相穿，婚姻中有需要磨合的矛盾。`)
    }
  }

  // 年上字
  const yearGanSS = ssM[riGan]?.[yearPillar.gan] || ''
  const monthGanSS = ssM[riGan]?.[monthPillar.gan] || ''
  result.push(`年上${yearPillar.gan}为${yearGanSS}，能量大力量小，想法大落地难。`)
  result.push(`月令${monthPillar.zhi}力量最大，月干${monthPillar.gan}为${monthGanSS}，对命主直接影响强。`)

  // 时柱
  const hourGanSS = ssM[riGan]?.[hourPillar.gan] || ''
  result.push(`时上${hourPillar.gan}为${hourGanSS}，代表内心世界和晚年状态。`)

  // 共根在月令的判断
  const bestGen = BEST_GONG_GEN[riGan]
  if (bestGen && monthPillar.zhi.includes(bestGen.replace('土',''))) {
    result.push(`共根${bestGen}在月令，可以借父母的力，朋友多。`)
  }

  return result
}

// ── 八字性格总评 ──
export function analyzeSummary(pills: PillarInfo[], riGan: string, wangXiang: string[]): string {
  const riWx = getGanWx(riGan)
  const riZhi = pills[2].zhi
  const monthZhi = pills[1].zhi

  const wxDescs: Record<string, string> = {
    '木':'仁慈、有担当，以结果为导向。', '火':'热情、缺乏安全感，追求自由。',
    '土':'包容、想得多，随遇而安。', '金':'好面子、对自己要求高，严肃认真。',
    '水':'自我要求高，对事业有追求。',
  }

  return `${riGan}日主属${riWx}。${wxDescs[riWx]||''}坐下${riZhi}，月令${monthZhi}。${wangXiang.length > 0 ? '五行状态：' + wangXiang.slice(0,3).join('；') : ''}整体来看，命主是一个需要结合大运流年综合判断的独特个体。易理是为人服务的——八字不是宿命，而是认识自己的工具。`
}

// ── 主入口 ──

export interface YifanInput {
  pills: PillarInfo[]
  birthYear: number
  gender: string
}

export function yifanAnalysis(input: YifanInput): YifanAnalysis {
  const { pills, birthYear, gender } = input
  if (!pills || pills.length < 4) {
    return {
      riZhuXinXing: [], diZhiGuanXi: [], liuChuan: [], liuChong: [],
      sanHeLiuHe: [], xingPoAnHe: [], chuChuGongGen: [], wangXiangXuShi: [],
      wangDian: [], shiShen: [], zongHe: [], summary: '八字数据不足'
    }
  }

  const riGan = pills[2].gan
  const monthZhi = pills[1].zhi

  // 各模块分析
  const riZhuXinXing = analyzeRiZhuXinXing(pills, riGan)
  const liuChuan = analyzeLiuChuan(pills)
  const liuChong = analyzeLiuChong(pills)
  const sanHe = analyzeSanHe(pills)
  const liuHe = analyzeLiuHe(pills)
  const sanXing = analyzeSanXing(pills)
  const anHe = analyzeAnHe(pills)
  const po = analyzePo(pills)
  const ziHe = analyzeZiHe(pills)
  const chuChu = analyzeChuChu(pills, riGan)
  const wangXiang = analyzeWangXiang(pills, monthZhi)
  const xuShi = analyzeXuShi(pills)
  const wangDian = analyzeWangDian(pills, riGan)
  const shiShen = analyzeShiShen(pills, riGan)
  const zongHe = analyzeZongHe(pills, birthYear, gender, riGan)
  const summary = analyzeSummary(pills, riGan, wangXiang)

  return {
    riZhuXinXing,
    diZhiGuanXi: [...liuChuan.slice(0,2), ...liuChong.slice(0,2)],
    liuChuan,
    liuChong,
    sanHeLiuHe: [...sanHe, ...liuHe],
    xingPoAnHe: [...sanXing, ...anHe, ...po, ...ziHe],
    chuChuGongGen: chuChu,
    wangXiangXuShi: [...wangXiang, ...xuShi],
    wangDian,
    shiShen,
    zongHe,
    summary,
  }
}

export default yifanAnalysis
