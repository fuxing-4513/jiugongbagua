/**
 * bazi-deep.ts — 九宫八字深层推理引擎
 *
 * 基于《甲辰杭州基础班》①② 全套知识体系重构
 * 涵盖：六穿/六冲/三刑/暗合/破/自合/三合深度/六合人性/
 *       出处共根借根/旺相休囚死/干支虚实/旺点/换象/断事
 *
 * 用法：
 *   import { deepAnalysis } from '@/lib/bazi-deep'
 *   const result = deepAnalysis(siZhu, birthYear, gender, lang?)
 */

import type { PillarInfo, BaziChartResult } from './bazi-engine'
import { wxM, ssM, hA, hG } from './bazi-engine'

// ── Type definitions ──

export interface DeepAnalysis {
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

// ── i18n helpers ──
const WX_EN: Record<string,string> = { '木':'Wood','火':'Fire','土':'Earth','金':'Metal','水':'Water' };
const WX_JA: Record<string,string> = { '木':'木','火':'火','土':'土','金':'金','水':'Water' };  // 四柱推命 also uses 五行
const WX_KO: Record<string,string> = { '木':'목','火':'화','土':'토','金':'금','水':'수' };
const SEASON_EN: Record<string,string> = { '春':'Spring','夏':'Summer','秋':'Autumn','冬':'Winter','四季':'Late Summer' };
const SEASON_JA: Record<string,string> = { '春':'春','夏':'夏','秋':'秋','冬':'冬','四季':'晩夏' };
const SEASON_KO: Record<string,string> = { '春':'봄','夏':'여름','秋':'가을','冬':'겨울','四季':'늦여름' };
const STATE_EN: Record<string,string> = { '旺':'Prosperous','相':'Nurturing','休':'Resting','囚':'Trapped','死':'Dying' };
const STATE_JA: Record<string,string> = { '旺':'旺','相':'相','休':'休','囚':'囚','死':'死' };
const STATE_KO: Record<string,string> = { '旺':'왕','相':'상','休':'휴','囚':'수','死':'사' };
const POS_EN = ['Year','Month','Day','Hour'];
const POS_JA = ['年','月','日','時'];
const POS_KO = ['년','월','일','시'];

function wxName(e: string, lang?: string): string {
  if (lang === 'en') return WX_EN[e] || e;
  if (lang === 'ja') return WX_JA[e] || e;
  if (lang === 'ko') return WX_KO[e] || e;
  return e;
}
function seasonName(s: string, lang?: string): string {
  if (lang === 'en') return SEASON_EN[s] || s;
  if (lang === 'ja') return SEASON_JA[s] || s;
  if (lang === 'ko') return SEASON_KO[s] || s;
  return s;
}
function stateName(s: string, lang?: string): string {
  if (lang === 'en') return STATE_EN[s] || s;
  if (lang === 'ja') return STATE_JA[s] || s;
  if (lang === 'ko') return STATE_KO[s] || s;
  return s;
}
function posName(i: number, lang?: string): string {
  if (lang === 'en') return POS_EN[i] || '';
  if (lang === 'ja') return POS_JA[i] || '';
  if (lang === 'ko') return POS_KO[i] || '';
  return ['年','月','日','时'][i] || '';
}

// Translation helpers for common analysis phrases
function t(texts: Record<string,string>, lang?: string): string {
  const l = (lang === 'en' || lang === 'ja' || lang === 'ko') ? lang : 'zh-CN';
  return texts[l] || texts['zh-CN'] || '';
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
  '亥巳': {active:'亥水', desc:'巳亥冲 — 考虑客户需要什么能给予什么。认清自己，放下旧的执念。'},
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
  const seen = new Set<string>()
  const zhis = pills.map(p => p.zhi)
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const key = zhis[i] + zhis[j]
      const rev = zhis[j] + zhis[i]
      let text = ''
      if (pairMap[key]) text = key + '=' + pairMap[key]
      else if (pairMap[rev]) text = rev + '=' + pairMap[rev]
      if (text && !seen.has(text)) {
        seen.add(text)
        result.push(text)
      }
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
function dedupPairs(zhis: string[], lookup: Record<string, any>, prefix: string): string[] {
  const result: string[] = []
  const seen = new Set<string>()
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const key = zhis[i] + zhis[j]
      const rev = zhis[j] + zhis[i]
      let text = ''
      if (lookup[key]) text = `${zhis[i]}${zhis[j]}${prefix}: ${lookup[key].desc || lookup[key]}`
      else if (lookup[rev]) text = `${zhis[j]}${zhis[i]}${prefix}: ${lookup[rev].desc || lookup[rev]}`
      if (text && !seen.has(text)) {
        seen.add(text)
        result.push(text)
      }
    }
  }
  return result
}

// ── 六穿分析 ──
export function analyzeLiuChuan(pills: PillarInfo[], lang?: string): string[] {
  const zhis = pills.map(p => p.zhi)
  const results = dedupPairs(zhis, LIU_CHUAN, t({'zh-CN':'穿','en':' Chuan (Piercing)','ja':'穿','ko':'천(穿)'}, lang))
  return results.length > 0 ? results : [t({
    'zh-CN':'无六穿关系',
    'en':'No Chuan (piercing) relationships',
    'ja':'六穿の関係はありません',
    'ko':'육천(六穿) 관계가 없습니다'
  }, lang)];
}

// ── 六冲分析 ──
export function analyzeLiuChong(pills: PillarInfo[], lang?: string): string[] {
  const zhis = pills.map(p => p.zhi)
  const results = dedupPairs(zhis, LIU_CHONG, t({'zh-CN':'冲','en':' Chong (Clash)','ja':'冲','ko':'충(冲)'}, lang))
  return results.length > 0 ? results : [t({
    'zh-CN':'无六冲关系',
    'en':'No Chong (clash) relationships',
    'ja':'六冲の関係はありません',
    'ko':'육충(六冲) 관계가 없습니다'
  }, lang)];
}

// ── 三合分析 ──
export function analyzeSanHe(pills: PillarInfo[], lang?: string): string[] {
  const result: string[] = []
  for (const [key, info] of Object.entries(SAN_HE)) {
    if (findTriplet(pills, info.elements)) {
      const chars = info.elements
      result.push(`${chars[0]}${chars[1]}${chars[2]}${t({'zh-CN':'三合','en':' Triad','ja':'三合','ko':'삼합(三合)'}, lang)}: ${info.desc}`)
    }
  }
  return result.length > 0 ? result : [t({
    'zh-CN':'无三合关系',
    'en':'No triad (San He) relationships',
    'ja':'三合の関係はありません',
    'ko':'삼합(三合) 관계가 없습니다'
  }, lang)];
}

// ── 六合分析 ──
export function analyzeLiuHe(pills: PillarInfo[], lang?: string): string[] {
  const results = hasHe(pills)
  return results.length > 0 ? results : [t({
    'zh-CN':'无六合关系',
    'en':'No Liu He (union) relationships',
    'ja':'六合の関係はありません',
    'ko':'육합(六合) 관계가 없습니다'
  }, lang)];
}

// ── 三刑分析 ──
export function analyzeSanXing(pills: PillarInfo[], lang?: string): string[] {
  const result: string[] = []
  const zhis = pills.map(p => p.zhi)
  if (zhis.includes('丑') && zhis.includes('未') && zhis.includes('戌')) {
    result.push(SAN_XING['丑未戌'])
  }
  if (zhis.includes('寅') && zhis.includes('巳') && zhis.includes('申')) {
    result.push(SAN_XING['寅巳申'])
  }
  return result.length > 0 ? result : [t({
    'zh-CN':'无三刑关系',
    'en':'No San Xing (punishment) relationships',
    'ja':'三刑の関係はありません',
    'ko':'삼형(三刑) 관계가 없습니다'
  }, lang)];
}

// ── 暗合分析 ──
export function analyzeAnHe(pills: PillarInfo[], lang?: string): string[] {
  const result = findZhiPairs(pills, AN_HE)
  return result.length > 0 
    ? result.map(r => `${t({'zh-CN':'暗合','en':'Hidden Union','ja':'暗合','ko':'암합(暗合)'}, lang)}: ${r}`)
    : [t({
      'zh-CN':'无暗合关系',
      'en':'No hidden union (An He) relationships',
      'ja':'暗合の関係はありません',
      'ko':'암합(暗合) 관계가 없습니다'
    }, lang)];
}

// ── 破分析 ──
export function analyzePo(pills: PillarInfo[], lang?: string): string[] {
  const result = findZhiPairs(pills, PO)
  return result.length > 0
    ? result.map(r => `${t({'zh-CN':'破','en':'Po (Destruct)','ja':'破','ko':'파(破)'}, lang)}: ${r}`)
    : [t({
      'zh-CN':'无破的关系',
      'en':'No Po (destruct) relationships',
      'ja':'破の関係はありません',
      'ko':'파(破) 관계가 없습니다'
    }, lang)];
}

// ── 自合分析 ──
export function analyzeZiHe(pills: PillarInfo[], lang?: string): string[] {
  const result: string[] = []
  for (const p of pills) {
    if (ZI_HE[p.gz]) {
      result.push(`${p.gz}${t({'zh-CN':'自合','en':' Self-Union','ja':'自合','ko':'자합(自合)'}, lang)}: ${ZI_HE[p.gz]}`)
    }
  }
  return result.length > 0 ? result : [t({
    'zh-CN':'无自合柱',
    'en':'No self-union (Zi He) pillars',
    'ja':'自合の柱はありません',
    'ko':'자합(自合) 기둥이 없습니다'
  }, lang)];
}

// ── 日主心性分析 ──
export function analyzeRiZhuXinXing(pills: PillarInfo[], riZhu: string, lang?: string): string[] {
  const result: string[] = []
  const dayPillar = pills[2]
  const monthPillar = pills[1]
  const hourPillar = pills[3]
  const riGan = dayPillar.gan
  const riZhi = dayPillar.zhi
  const riWx = getGanWx(riGan)

  result.push(t({
    'zh-CN':`日主${riGan}属${riWx}`,
    'en':`Day Master ${riGan} belongs to ${wxName(riWx, 'en')}`,
    'ja':`日主${riGan}は${wxName(riWx, 'ja')}`,
    'ko':`일주 ${riGan}은 ${wxName(riWx, 'ko')}에 속함`
  }, lang))

  if (ZUO_XIA[riZhi]) {
    const traits = ZUO_XIA[riZhi]
    result.push(t({
      'zh-CN':`坐下${riZhi}: ${traits.join('、')}`,
      'en':`Sitting on ${riZhi}: ${traits.join(', ')}`,
      'ja':`坐下${riZhi}: ${traits.join('、')}`,
      'ko':`좌하 ${riZhi}: ${traits.join(', ')}`
    }, lang))
  }

  if (ZI_HE[dayPillar.gz]) {
    const zh = ZI_HE[dayPillar.gz]
    result.push(`${dayPillar.gz}自合 — ${zh}。${t({
      'zh-CN':'自合的人目标明确，内心渴望强烈，很难从外部改造，必须从内突破。',
      'en':'Self-union people have clear goals and strong inner desires — hard to change from outside, breakthrough must come from within.',
      'ja':'自合の人は目標が明確で内なる欲求が強い。外部から変えるのは難しく、内側からの突破が必要。',
      'ko':'자합의 사람은 목표가 명확하고 내적 열망이 강합니다. 외부에서 바꾸기 어렵고 내면에서 돌파해야 합니다.'
    }, lang)}`)
  }

  const monthZhi = monthPillar.zhi
  const monthGan = monthPillar.gan
  result.push(t({
    'zh-CN':`月令${monthZhi}是全局力量最大的点，月干${monthGan}对日主影响直接。`,
    'en':`The month branch ${monthZhi} is the most powerful point. The month stem ${monthGan} directly influences the Day Master.`,
    'ja':`月令${monthZhi}は全局で最も力が強い。月干${monthGan}は日主に直接影響を与える。`,
    'ko':`월령 ${monthZhi}은(는)全局에서 가장 강력한 지점입니다. 월간 ${monthGan}은(는) 일주에 직접 영향을 줍니다.`
  }, lang))
  
  result.push(t({
    'zh-CN':`时支${hourPillar.zhi}影响内心世界。`,
    'en':`The hour branch ${hourPillar.zhi} influences your inner world.`,
    'ja':`時支${hourPillar.zhi}は内心に影響する。`,
    'ko':`시지 ${hourPillar.zhi}은(는) 내면 세계에 영향을 줍니다.`
  }, lang))

  return result
}

// ── 出处共根借根分析 ──
export function analyzeChuChu(pills: PillarInfo[], riGan: string, lang?: string): string[] {
  const result: string[] = []
  const riWx = getGanWx(riGan)
  const bestGen = BEST_GONG_GEN[riGan]
  
  if (bestGen) {
    result.push(t({
      'zh-CN':`${riGan}日主，你的底气在${bestGen}这个字上，这个位置撑着你`,
      'en':`${riGan} Day Master — your foundation is in ${bestGen}, this position supports you`,
      'ja':`${riGan}日主、あなたの基盤は${bestGen}にあり、この位置があなたを支えている`,
      'ko':`${riGan} 일주, 당신의 기반은 ${bestGen}에 있으며 이 위치가 당신을 지탱합니다`
    }, lang))
  }

  const chu = CHU_CHU[riWx]
  if (chu) {
    result.push(t({
      'zh-CN':`你的${riWx}有根，来源是${chu.join('、')}，这些是你的底牌`,
      'en':`Your ${wxName(riWx, 'en')} has roots from ${chu.join(', ')} — these are your hidden strengths`,
      'ja':`あなたの${wxName(riWx, 'ja')}には根があり、源泉は${chu.join('、')}、これらがあなたの切り札`,
      'ko':`당신의 ${wxName(riWx, 'ko')}에는 뿌리가 있으며 출처는 ${chu.join(', ')}입니다. 이것이 당신의 비장의 카드입니다`
    }, lang))
  }

  const zhis = pills.map(p => p.zhi)
  const kuMap: Record<string, string> = {'辰':'水库','戌':'火库','丑':'金库','未':'木库'}
  for (const z of zhis) {
    if (kuMap[z]) {
      if (chu && chu.includes(z + '土')) {
        result.push(t({
          'zh-CN':`地支${z}是${kuMap[z]}，你的${riWx}从这里来，这个位置靠得住`,
          'en':`Branch ${z} is the ${wxName(riWx, 'en')} warehouse — your ${wxName(riWx, 'en')} element draws from it, making this position reliable`,
          'ja':`地支${z}は${kuMap[z]}、あなたの${wxName(riWx, 'ja')}はここから来ており、この位置は信頼できる`,
          'ko':`지지 ${z}은(는) ${wxName(riWx, 'ko')} 창고이며 당신의 ${wxName(riWx, 'ko')}은(는) 여기서 옵니다. 이 위치는 믿을 수 있습니다`
        }, lang))
      }
    }
  }

  for (let i = 0; i < pills.length; i++) {
    if (bestGen && pills[i].zhi.includes(bestGen.replace('土',''))) {
      const pos = posName(i, lang)
      const meanings: Record<string,Record<string,string>> = {
        '年':{'zh-CN':'共根在年上，说明你祖上有底子，起跑线比别人高','en':'Root in Year pillar — ancestral foundation, starting line ahead of others','ja':'年柱に共根—家系に基盤があり、スタートラインが他人より高い','ko':'년주에 공근—조상의 기반이 있어 출발선이 남보다 높습니다'},
        '月':{'zh-CN':'共根在月令，说明你在朋友圈里能说得上话，兄弟朋友愿意听你的','en':'Root in Month pillar — your friends value your opinion and listen to you','ja':'月柱に共根—友人の間で発言力があり、兄弟友人があなたの言うことを聞く','ko':'월주에 공근—친구들 사이에서 발언권이 있고 형제·친구들이 당신 말을 잘 듣습니다'},
        '日':{'zh-CN':'共根在坐下，你自己就是自己最大的靠山','en':'Root in Day pillar — you are your own greatest support','ja':'日柱に共根—自分自身が最大の支え','ko':'일주에 공근—당신 자신이 가장 큰 버팀목입니다'},
        '时':{'zh-CN':'共根在时支，说明你晚年儿女运不错，老来有依靠','en':'Root in Hour pillar — good fortune with children in later years','ja':'時柱に共根—晩年に子供運が良く、老後は頼れる存在がいる','ko':'시주에 공근—만년에 자녀운이 좋아 노후에 의지할 곳이 있습니다'},
      };
      const pName = ['年','月','日','时'][i];
      if (meanings[pName]) result.push(`${t({'zh-CN':`${pos}柱有${bestGen}`,'en':`${pos} pillar has ${bestGen}`,'ja':`${pos}柱に${bestGen}`,'ko':`${pos}주에 ${bestGen}`}, lang)}，${meanings[pName][lang || 'zh-CN'] || meanings[pName]['zh-CN']}`);
    }
  }

  return result
}

// ── 旺相休囚死分析 ──
export function analyzeWangXiang(pills: PillarInfo[], monthZhi: string, lang?: string): string[] {
  const result: string[] = []
  const season = getSeason(monthZhi)
  const wxState = WANG_XIANG[season]
  if (!wxState) return result

  result.push(t({
    'zh-CN':`你生在${season}季，月令${monthZhi}当令，这季节的气场对你影响最大。`,
    'en':`You were born in ${seasonName(season, 'en')}, with ${monthZhi} as the month branch. This season's energy influences you most.`,
    'ja':`あなたは${seasonName(season, 'ja')}生まれ、月令${monthZhi}が当令。この季節の気が最も影響する。`,
    'ko':`당신은 ${seasonName(season, 'ko')}에 태어났으며 월령 ${monthZhi}이(가) 당령입니다. 이 계절의 기운이 가장 큰 영향을 줍니다.`
  }, lang))
  
  for (const [wx, state] of Object.entries(wxState)) {
    result.push(t({
      'zh-CN':`${wx}在你这命里属于「${state}」的状态`,
      'en':`${wxName(wx, 'en')} in your chart is in "${stateName(state, 'en')}" state`,
      'ja':`${wxName(wx, 'ja')}はあなたの命式で「${stateName(state, 'ja')}」の状態`,
      'ko':`${wxName(wx, 'ko')}은(는) 당신 명식에서 "${stateName(state, 'ko')}" 상태입니다`
    }, lang))
  }

  const riGanWx = getGanWx(pills[2].gan)
  const riWxState = wxState[riGanWx]
  if (riWxState) {
    if (riWxState === '旺' || riWxState === '相') {
      result.push(t({
        'zh-CN':`你日主${riGanWx}正当令，你这人做事有底气，顺的时候多。`,
        'en':`Your ${wxName(riGanWx, 'en')} Day Master is in season — you act with confidence and often find things going your way.`,
        'ja':`日主${wxName(riGanWx, 'ja')}が旺相—行動に自信があり、うまくいくことが多い。`,
        'ko':`일주 ${wxName(riGanWx, 'ko')}이(가) 왕상—자신감 있게 행동하며 일이 잘 풀리는 경우가 많습니다.`
      }, lang))
    } else if (riWxState === '死' || riWxState === '囚') {
      result.push(t({
        'zh-CN':`你日主${riGanWx}偏弱，根基不够，得等大运流年给你补充。`,
        'en':`Your ${wxName(riGanWx, 'en')} Day Master is relatively weak — foundations insufficient, await the decade luck and annual cycles to supplement.`,
        'ja':`日主${wxName(riGanWx, 'ja')}はやや弱く、基盤が不十分。大運や流年での補充を待つ必要がある。`,
        'ko':`일주 ${wxName(riGanWx, 'ko')}이(가) 다소 약하고 기반이 부족합니다. 대운과 유년의 보충을 기다려야 합니다.`
      }, lang))
    } else {
      result.push(t({
        'zh-CN':`日主${riGanWx}当前状态一般，不好不坏。`,
        'en':`Your ${wxName(riGanWx, 'en')} Day Master is in a moderate state — neither strong nor weak.`,
        'ja':`日主${wxName(riGanWx, 'ja')}は現在普通の状態—良くも悪くもない。`,
        'ko':`일주 ${wxName(riGanWx, 'ko')}은(는) 현재 보통 상태—좋지도 나쁘지도 않습니다.`
      }, lang))
    }
  }

  for (const [wx, state] of Object.entries(wxState)) {
    if (state === '死') {
      result.push(t({
        'zh-CN':`${wx}在你命里是最弱的，这个领域你得悠着点，别硬来。`,
        'en':`${wxName(wx, 'en')} is weakest in your chart — take it easy in this area, don't force things.`,
        'ja':`${wxName(wx, 'ja')}が最も弱い—この分野では無理をせず、自然に任せて。`,
        'ko':`${wxName(wx, 'ko')}이(가) 가장 약합니다—이 분야에서는 무리하지 말고 자연스럽게 두세요.`
      }, lang))
    }
  }

  return result
}

// ── 旺点分析 ──
export function analyzeWangDian(pills: PillarInfo[], riGan: string, lang?: string): string[] {
  const result: string[] = []
  const monthPillar = pills[1]
  const hourPillar = pills[3]
  const monthZhi = monthPillar.zhi
  const hourZhi = hourPillar.zhi

  result.push(t({
    'zh-CN':`你命里力量最强的两个位置是月令${monthZhi}和时支${hourZhi}，这俩地方决定了你这人的主要走向。`,
    'en':`The two most powerful positions in your chart are the month branch ${monthZhi} and hour branch ${hourZhi} — these shape your life direction.`,
    'ja':`命式で最も力が強いのは月令${monthZhi}と時支${hourZhi}。この二つが人生の方向性を決める。`,
    'ko':`명식에서 가장 강력한 두 위치는 월령 ${monthZhi}과(와) 시지 ${hourZhi}입니다. 이 두 곳이 인생의 방향을 결정합니다.`
  }, lang))

  const riZhi = pills[2].zhi
  const relationships: string[] = []
  const pairs = [[monthZhi, riZhi], [hourZhi, riZhi]]
  const allCombs = [...Object.keys(LIU_CHUAN), ...Object.keys(LIU_CHONG), 
    ...Object.keys(LIU_HE), ...Object.keys(AN_HE)]

  for (const [a, b] of pairs) {
    if (allCombs.includes(a + b) || allCombs.includes(b + a)) {
      relationships.push(t({
        'zh-CN':`${a}与${b}有特殊关系（影响大）`,
        'en':`${a} and ${b} have a special relationship (strong influence)`,
        'ja':`${a}と${b}は特殊な関係（影響大）`,
        'ko':`${a}과(와) ${b}은(는) 특별한 관계가 있습니다 (영향 큼)`
      }, lang))
    } else {
      const ma = getZhiWx(a)
      const mb = getZhiWx(b)
      if (ma && mb) {
        if (ma === mb) {
          relationships.push(t({
            'zh-CN':`${a}与${b}五行相同`,
            'en':`${a} and ${b} share the same element (${wxName(ma, 'en')})`,
            'ja':`${a}と${b}は五行が同じ`,
            'ko':`${a}과(와) ${b}은(는) 오행이 같음`
          }, lang))
        } else {
          relationships.push(t({
            'zh-CN':`${a}(${ma})与${b}(${mb})有生克关系`,
            'en':`${a}(${wxName(ma, 'en')}) and ${b}(${wxName(mb, 'en')}) have generating/controlling relation`,
            'ja':`${a}(${wxName(ma, 'ja')})と${b}(${wxName(mb, 'ja')})は生克関係`,
            'ko':`${a}(${wxName(ma, 'ko')})과(와) ${b}(${wxName(mb, 'ko')})은(는) 생극 관계`
          }, lang))
        }
      }
    }
  }
  
  result.push(t({
    'zh-CN':`你的婚姻宫（日支${riZhi}）受月令${monthZhi}和时支${hourZhi}的影响: ${relationships.join('；')}`,
    'en':`Your marriage palace (Day branch ${riZhi}) is influenced by month branch ${monthZhi} and hour branch ${hourZhi}: ${relationships.join('; ')}`,
    'ja':`婚姻宮（日支${riZhi}）は月令${monthZhi}と時支${hourZhi}の影響を受ける: ${relationships.join('; ')}`,
    'ko':`혼인궁(일지 ${riZhi})은 월령 ${monthZhi}과(와) 시지 ${hourZhi}의 영향을 받습니다: ${relationships.join('; ')}`
  }, lang))

  return result
}

// ── 干支虚实分析 ──
export function analyzeXuShi(pills: PillarInfo[], lang?: string): string[] {
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
        result.push(t({
          'zh-CN':`${p.gz} — ${gan}坐${zhi}是坐实的，说明你在这个位置说一不二，底气足。`,
          'en':`${p.gz} — ${gan} sitting on ${zhi} is substantial — you're decisive and confident in this area.`,
          'ja':`${p.gz} — ${gan}が${zhi}に坐実—この位置では揺るぎなく、自信がある。`,
          'ko':`${p.gz} — ${gan}이(가) ${zhi}에 앉아 실함—이 위치에서는 확고하고 자신감이 있습니다.`
        }, lang))
      } else if (isXu) {
        result.push(t({
          'zh-CN':`${p.gz} — ${gan}坐${zhi}有点虚，想法多但落地难，得等时机成熟。`,
          'en':`${p.gz} — ${gan} sitting on ${zhi} is somewhat weak — many ideas but hard to execute, wait for the right timing.`,
          'ja':`${p.gz} — ${gan}が${zhi}に坐虚—アイデアは多いが実行が難しい。タイミングを待つ必要がある。`,
          'ko':`${p.gz} — ${gan}이(가) ${zhi}에 앉아 허함—아이디어는 많지만 실행이 어렵습니다.时机이 무르익을 때까지 기다리세요.`
        }, lang))
      }
    }
  }

  return result
}

// ── 十神组合解读 ──
export function analyzeShiShen(pills: PillarInfo[], riGan: string, lang?: string): string[] {
  const result: string[] = []
  
  const ssCount: Record<string, number> = {}
  for (const p of pills) {
    const s = ssM[riGan]?.[p.gan] || ''
    if (s) ssCount[s] = (ssCount[s] || 0) + 1
  }

  const topSS = Object.entries(ssCount).sort((a, b) => b[1] - a[1])
  for (const [ss, count] of topSS.slice(0, 3)) {
    result.push(t({
      'zh-CN':`${ss}在你命里出现${count}次，这个特质比较明显`,
      'en':`${ss} appears ${count} time(s) in your chart — this trait is prominent`,
      'ja':`${ss}が${count}回出現—この特性が顕著`,
      'ko':`${ss}이(가) ${count}회 나타남—이 특성이 두드러집니다`
    }, lang))
  }

  const hasKill = ssCount['七杀'] && ssCount['七杀'] > 0
  const hasGuan = ssCount['正官'] && ssCount['正官'] > 0
  const hasCai = (ssCount['正财'] || 0) + (ssCount['偏财'] || 0) > 1
  const hasYin = (ssCount['正印'] || 0) + (ssCount['偏印'] || 0) > 0
  const hasShiShang = (ssCount['食神'] || 0) + (ssCount['伤官'] || 0) > 0

  if (hasKill && hasGuan) result.push(t({
    'zh-CN':'官杀混杂，说明你事业上有好几条路可以走，但别贪多，专注一条才对。',
    'en':'Mixed Officer and Seven Kill — multiple career paths available, but stay focused on one.',
    'ja':'官殺混雑—いくつかのキャリアパスがあるが、一つに絞るのが賢明。',
    'ko':'관살혼잡—여러 직업 경로가 있지만 하나에 집중하는 것이 현명합니다.'
  }, lang))
  if (hasCai && hasYin) result.push(t({
    'zh-CN':'财印双全，你这人既能赚钱又爱学习，两手都硬。',
    'en':'Wealth and Seal both present — you can both earn and learn, strong in both areas.',
    'ja':'財印双全—お金を稼ぎ、学ぶこともできる。両方に強い。',
    'ko':'재인쌍전—돈도 벌고 공부도 잘합니다. 양쪽 모두 강합니다.'
  }, lang))
  if (hasShiShang && hasGuan) result.push(t({
    'zh-CN':'食伤制官杀，说明你不安分，总想搞点名堂出来。',
    'en':'Eating/Injury controlling Officer/Kill — you are restless, always wanting to make your mark.',
    'ja':'食傷制官殺—落ち着きがなく、常に何かを成し遂げたいと思っている。',
    'ko':'식상제관살—가만히 있지 못하고 항상 무언가를 이루고자 합니다.'
  }, lang))
  if (hasShiShang && hasCai) result.push(t({
    'zh-CN':'食伤生财，你这人脑子活，能用技术或创意来变现。',
    'en':'Eating/Injury generating Wealth — clever mind, monetize your skills and creativity.',
    'ja':'食傷生財—頭が良く、技術やクリエイティビティで収入を得られる。',
    'ko':'식상생재—머리가 좋아 기술이나 창의력으로 수익을 창출할 수 있습니다.'
  }, lang))
  if (ssCount['比肩'] && ssCount['比肩'] > 1) result.push(t({
    'zh-CN':'比肩多现，说明你这人重情义，朋友的事就是自己的事。',
    'en':'Multiple Peer Stars — you value loyalty, your friends\' problems become your own.',
    'ja':'比肩多現—情義に厚く、友人のことは自分のことのように考える。',
    'ko':'비견다현—의리를 중시하며 친구의 일을 자신의 일처럼 여깁니다.'
  }, lang))

  return result
}

// ── 综合断事 ──
export function analyzeZongHe(pills: PillarInfo[], birthYear: number, gender: string, riGan: string, lang?: string): string[] {
  const result: string[] = []
  const monthPillar = pills[1]
  const hourPillar = pills[3]
  const yearPillar = pills[0]
  const riZhi = pills[2].zhi

  result.push(t({
    'zh-CN':`你的婚姻宫在${riZhi}，这个位置偏静，婚姻这事你不太爱折腾。`,
    'en':`Your marriage palace is at ${riZhi} — a relatively calm position, you don't like to stir things up in relationships.`,
    'ja':`婚姻宮は${riZhi}—比較的静かな位置で、恋愛で波風を立てるのは好きではない。`,
    'ko':`혼인궁은 ${riZhi}—비교적 조용한 위치이며 연애에서 소란을 피우는 것을 좋아하지 않습니다.`
  }, lang))
  
  const zhis = pills.map(p => p.zhi)
  const chongPairs = Object.keys(LIU_CHONG)
  const chuanPairs = Object.keys(LIU_CHUAN)
  for (let i = 0; i < zhis.length; i++) {
    if (i === 2) continue
    const k1 = riZhi + zhis[i]
    const k2 = zhis[i] + riZhi
    if (chongPairs.includes(k1) || chongPairs.includes(k2)) {
      result.push(t({
        'zh-CN':`日支${riZhi}和${zhis[i]}相冲，婚姻宫被冲了，感情上容易起波澜。`,
        'en':`Day branch ${riZhi} clashes with ${zhis[i]} — marriage palace is stirred, emotions may fluctuate.`,
        'ja':`日支${riZhi}と${zhis[i]}が冲—婚姻宮が揺さぶられ、感情に波が出やすい。`,
        'ko':`일지 ${riZhi}과(와) ${zhis[i]}이(가) 충—혼인궁이 흔들려 감정에 파동이 생기기 쉽습니다.`
      }, lang))
    }
    if (chuanPairs.includes(k1) || chuanPairs.includes(k2)) {
      result.push(t({
        'zh-CN':`日支${riZhi}和${zhis[i]}相穿，说明你跟另一半在某些事上得相互忍让。`,
        'en':`Day branch ${riZhi} pierces ${zhis[i]} — you and your partner need mutual tolerance on certain issues.`,
        'ja':`日支${riZhi}と${zhis[i]}が穿—相手とある程度の相互譲歩が必要。`,
        'ko':`일지 ${riZhi}과(와) ${zhis[i]}이(가) 천—상대방과 특정 문제에서 서로 양보가 필요합니다.`
      }, lang))
    }
  }

  const yearGanSS = ssM[riGan]?.[yearPillar.gan] || ''
  const monthGanSS = ssM[riGan]?.[monthPillar.gan] || ''
  result.push(t({
    'zh-CN':`年上${yearPillar.gan}是${yearGanSS}，看起来是棵大树，实际离你远，想法大但真正使上劲不容易。`,
    'en':`Year stem ${yearPillar.gan} (${yearGanSS}) seems like a big tree but is far from you — big ideas but hard to fully leverage.`,
    'ja':`年干${yearPillar.gan}は${yearGanSS}。大樹のように見えるが遠くにある—アイデアは大きいが実現は容易ではない。`,
    'ko':`년간 ${yearPillar.gan}은(는) ${yearGanSS}입니다. 큰 나무처럼 보이지만 멀리 있어 생각은 크지만 실제 활용은 쉽지 않습니다.`
  }, lang))
  result.push(t({
    'zh-CN':`月令${monthPillar.zhi}是你命里最有力气的位，月干${monthPillar.gan}是${monthGanSS}，这个对你影响最直接。`,
    'en':`Month branch ${monthPillar.zhi} is your chart's most powerful position. Month stem ${monthPillar.gan} (${monthGanSS}) directly influences you.`,
    'ja':`月令${monthPillar.zhi}は命式で最も力がある。月干${monthPillar.gan}（${monthGanSS}）が最も直接的に影響する。`,
    'ko':`월령 ${monthPillar.zhi}은(는) 명식에서 가장 강력합니다. 월간 ${monthPillar.gan}（${monthGanSS}）이 가장 직접적인 영향을 줍니다.`
  }, lang))

  const hourGanSS = ssM[riGan]?.[hourPillar.gan] || ''
  result.push(t({
    'zh-CN':`时上${hourPillar.gan}是${hourGanSS}，这代表你晚年怎么过、内心真正想要什么。`,
    'en':`Hour stem ${hourPillar.gan} (${hourGanSS}) represents how you spend your later years and what your heart truly desires.`,
    'ja':`時干${hourPillar.gan}（${hourGanSS}）は晩年の過ごし方と心の真の望みを表す。`,
    'ko':`시간 ${hourPillar.gan}（${hourGanSS}）은 만년의 생활 방식과 마음의 진정한 소망을 나타냅니다.`
  }, lang))

  const bestGen = BEST_GONG_GEN[riGan]
  if (bestGen && monthPillar.zhi.includes(bestGen.replace('土',''))) {
    result.push(t({
      'zh-CN':`${bestGen}在月令，说明你在家里和朋友圈里吃得开，父母能帮你一把，兄弟朋友也多。`,
      'en':`${bestGen} in the month pillar — you thrive at home and among friends. Parents can help you, and you have many allies.`,
      'ja':`${bestGen}が月令にあり—家庭や友人関係でうまくいき、親の助けもあり、兄弟友人も多い。`,
      'ko':`${bestGen}이(가) 월령에 있어 가정과 친구 관계에서 잘 풀리고 부모님의 도움도 있으며 형제·친구도 많습니다.`
    }, lang))
  }

  return result
}

// ── 八字性格总评 ──
export function analyzeSummary(pills: PillarInfo[], riGan: string, wangXiang: string[], lang?: string): string {
  const riWx = getGanWx(riGan)
  const riZhi = pills[2].zhi
  const monthZhi = pills[1].zhi

  const wxDescs: Record<string, Record<string, string>> = {
    '木':{'zh-CN':'仁慈、有担当，以结果为导向。','en':'Benevolent, responsible, results-oriented.','ja':'仁愛があり、責任感が強く、結果重視。','ko':'자애롭고 책임감 있으며 결과 지향적.'},
    '火':{'zh-CN':'热情、缺乏安全感，追求自由。','en':'Passionate, security-seeking, freedom-loving.','ja':'情熱的で、安心感を求め、自由を追求。','ko':'열정적이고 안정감을 추구하며 자유를 갈망.'},
    '土':{'zh-CN':'包容、想得多，随遇而安。','en':'Tolerant, thoughtful, goes with the flow.','ja':'包容力があり、考え方が深く、流れに身を任せる。','ko':'포용력 있고 생각이 많으며 흐름에 몸을 맡김.'},
    '金':{'zh-CN':'好面子、对自己要求高，严肃认真。','en':'Status-conscious, high self-standards, serious and disciplined.','ja':'見栄っ張りで、自己要求が高く、真面目。','ko':'체면을 중시하고 자기 기준이 높으며 진지하고 엄숙.'},
    '水':{'zh-CN':'自我要求高，对事业有追求。','en':'High self-expectations, career-oriented.','ja':'自己要求が高く、キャリア志向。','ko':'자기 기준이 높고 직업에 대한 열망이 있음.'},
  }

  const desc = wxDescs[riWx]?.[lang || 'zh-CN'] || wxDescs[riWx]?.['zh-CN'] || ''
  const stateStr = wangXiang.length > 0 
    ? t({
      'zh-CN':`五行状态：${wangXiang.slice(0,3).join('；')}`,
      'en':`Element state: ${wangXiang.slice(0,3).join('; ')}`,
      'ja':`五行状態：${wangXiang.slice(0,3).join('；')}`,
      'ko':`오행 상태：${wangXiang.slice(0,3).join('; ')}`
    }, lang)
    : '';

  const conclusion = t({
    'zh-CN':'整体来看，你这人有自己的脾气和路子，上面说的这些是你天生的底牌——八字不是定命，是帮你认清楚自己是个什么样的人。',
    'en':'Overall, you have your own temperament and path. What\'s described above is your innate foundation — Ba Zi doesn\'t fix your destiny, it helps you understand who you truly are.',
    'ja':'総合的に見ると、あなたには独自の気質と道がある。上記のことは生まれ持った基盤—四柱推命は運命を決めるものではなく、自分がどんな人間かを知るためのものだ。',
    'ko':'종합적으로 볼 때, 당신만의 기질과 길이 있습니다. 위에서 설명한 것은 타고난 기반입니다 — 사주는 운명을 결정하는 것이 아니라 자신이 어떤 사람인지 이해하도록 돕는 도구입니다.'
  }, lang);

  return `${riGan}日主属${wxName(riWx, lang)}。${desc}坐下${riZhi}，月令${monthZhi}。${stateStr}${stateStr ? '。' : ''}${conclusion}`
}

// ── 主入口 ──

export interface DeepInput {
  pills: PillarInfo[]
  birthYear: number
  gender: string
}

export function deepAnalysis(input: DeepInput, lang?: string): DeepAnalysis {
  const { pills, birthYear, gender } = input
  if (!pills || pills.length < 4) {
    return {
      riZhuXinXing: [], diZhiGuanXi: [], liuChuan: [], liuChong: [],
      sanHeLiuHe: [], xingPoAnHe: [], chuChuGongGen: [], wangXiangXuShi: [],
      wangDian: [], shiShen: [], zongHe: [],
      summary: t({
        'zh-CN':'八字数据不足',
        'en':'Insufficient Ba Zi data',
        'ja':'四柱データが不足しています',
        'ko':'사주 데이터가 부족합니다'
      }, lang)
    }
  }

  const riGan = pills[2].gan
  const monthZhi = pills[1].zhi

  const riZhuXinXing = analyzeRiZhuXinXing(pills, riGan, lang)
  const liuChuan = analyzeLiuChuan(pills, lang)
  const liuChong = analyzeLiuChong(pills, lang)
  const sanHe = analyzeSanHe(pills, lang)
  const liuHe = analyzeLiuHe(pills, lang)
  const sanXing = analyzeSanXing(pills, lang)
  const anHe = analyzeAnHe(pills, lang)
  const po = analyzePo(pills, lang)
  const ziHe = analyzeZiHe(pills, lang)
  const chuChu = analyzeChuChu(pills, riGan, lang)
  const wangXiang = analyzeWangXiang(pills, monthZhi, lang)
  const xuShi = analyzeXuShi(pills, lang)
  const wangDian = analyzeWangDian(pills, riGan, lang)
  const shiShen = analyzeShiShen(pills, riGan, lang)
  const zongHe = analyzeZongHe(pills, birthYear, gender, riGan, lang)
  const summary = analyzeSummary(pills, riGan, wangXiang, lang)

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

export default deepAnalysis
