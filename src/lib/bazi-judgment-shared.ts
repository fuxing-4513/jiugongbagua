/**
 * bazi-judgment.ts - 九宫八字实战断事层 v6
 *
 * 基于九宫高度分析体系 + 29条实战推理规则 + 原材料2.4MB逐字研读
 *
 * v6 改进：
 *   新增 制用结构评估(绳子与牛/制得干净/正制反制)
 *   强化 flowYearV2 严格遵循先冲合后生克优先级
 *   强化 墓库分析加入脆金概念和入墓好坏分判
 *   强化 人性分析加入通根连体日主提示
 *   强化 官运层次加入正制vs反制判断
 *
 * 关键规则实现:
 *   R1 找桥梁:A→B无直接关系,找C
 *   R2 会局优先:三会>三合>六合>半合>生>刑冲破害
 *   R3 得库:要库里的东西→找能制库的工具
 *   R4 应局做事:大运来了→做和这个字相关的事
 *   R5 流年触发:流年字活动,原局字静止
 *   R8 根=房子:根代表住的地方
 *   R10 两象定一象:两条证据→同一个结论
 *   R11 太极点转换:不同角色→不同太极点
 *   R14 家里被家外合:家里的字出来→可能被抢
 *   R16 食伤=说话=口头承诺
 *   R17 共根=共想法
 *   R20 出处品质决定层次
 *   R22 自合=自信(九组自合)
 *   R26 借根要看源头
 *   R28 弱的修强的控
 */

// ───────────────────────────────────────
//  常量定义
// ───────────────────────────────────────

export const WU_XING: Record<string, string> = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' }

export const CANG_GAN: Record<string, string[]> = {
  '子':['癸'],'丑':['己','癸','辛'],'寅':['甲','丙','戊'],'卯':['乙'],
  '辰':['戊','乙','癸'],'巳':['丙','庚','戊'],'午':['丁','己'],'未':['己','丁','乙'],
  '申':['庚','壬','戊'],'酉':['辛'],'戌':['戊','辛','丁'],'亥':['壬','甲']
}

export const BEST_YIN_KU: Record<string, string> = { '甲':'辰','乙':'辰','丙':'未','丁':'未','戊':'戌','己':'戌','庚':'丑','辛':'丑','壬':'丑','癸':'丑' }
export const KU_MAP: Record<string, string> = {
  '子':'辰','丑':'丑','寅':'未','卯':'未','辰':'辰','巳':'戌','午':'未','未':'未',
  '申':'丑','酉':'丑','戌':'戌','亥':'辰'
}
export const ROOT_MAP: Record<string, string[]> = {
  '木':['寅','卯','辰','未','亥'],'火':['寅','巳','午','未','戌'],
  '土':['寅','辰','巳','午','未','申','戌','丑'],
  '金':['巳','申','酉','戌','丑'],'水':['辰','申','亥','子','丑']
}
export const ZHI_WU_XING: Record<string, string> = {
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火',
  '午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'
}
export const ZHI_NATURE: Record<string, string> = {
  '寅':'你喜欢管比劫、操心别人。每做一件事都希望别人认可你。没有压力动不了。',
  '卯':'你是内耗型。做什么事必须先说服自己。隐藏想法。认定的事很难改。极需要内心深处的认可。专一。',
  '巳':'你以结果为导向。要么不决定,决定了拉不回来。不会委屈自己。',
  '午':'你喜欢被认可,给人面子。在人群中容易成为焦点。讲义气。',
  '辰':'你喜欢自由自在但自我约束力不强。连自己都不知道真正想要什么。没有安全感。拖到最后。',
  '未':'你以结果为导向,搞钱的执行力很强。快速变现。喜欢在吃喝中聊事业。',
  '申':'你想得多顾虑多。做事之前反复权衡。喜欢琢磨事情。',
  '酉':'你专一、认死理。说服简单,认可难。笑点高。经常内耗自己。',
  '戌':'你想法很大但越做越小。喜欢跟朋友聊事业。有底线和原则。',
  '亥':'你会筛选身边的人。喜欢分享喜悦。不轻易做承诺。最讨厌拖拉推脱。',
  '子':'你喜欢自由自在。学习要一帮朋友一起学。有自己的节奏。',
  '丑':'你嘴巴都能说。做事需要100%以上把握才做决定。内心敏感,警惕性高。'
}
export const PEI_OU_CHAR: Record<string, string> = {
  '子':'你对象聪明灵活,喜欢自由。给空间才行。','丑':'你对象务实踏实。嘴比较碎。',
  '寅':'你对象有主见有事业心。','卯':'你对象内心细腻专一。不轻易说爱。',
  '辰':'你对象包容性强但优柔寡断。','巳':'你对象精明能干说一不二。',
  '午':'你对象热情大方要面子。','未':'你对象执行力强务实。',
  '申':'你对象想得多顾虑多。','酉':'你对象讲究要求高。有自己一套标准。',
  '戌':'你对象忠诚可靠有底线。','亥':'你对象会照顾人但控制欲强。'
}
export const WX_NATURE: Record<string, string> = {
  '木':'做事以结果为导向。希望得到别人的认可。',
  '火':'追求自由,缺乏安全感。特别要面子。',
  '土':'想得多,包容大。比劫对你的看法最重要。随遇而安。',
  '金':'抹不开面子,不会拒绝人。对自己要求高约束多。',
  '水':'自我要求高,对事业有追求。表面温和内心坚定。'
}
export const LIU_HE: Record<string,string> = {'子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午'}
export const LIU_CHONG: Record<string,string> = {'子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳'}
export const LIU_CHUAN: Record<string,string> = {'子':'未','未':'子','丑':'午','午':'丑','寅':'巳','巳':'寅','卯':'辰','辰':'卯','申':'亥','亥':'申','酉':'戌','戌':'酉'}
export const SAN_XING: Record<string,string> = {'寅':'巳','巳':'申','申':'寅','丑':'戌','戌':'未','未':'丑','子':'卯','卯':'子'}
// 六合人性
export const HE_REN: Record<string, string> = {
  '子丑':'子丑合--克的关系。子水想得到事业,丑土想让子水听话。要给面子和荣誉才会配合。',
  '寅亥':'寅亥合--生的关系,但相互拉扯。亥水想控制寅木的自由(用关心照顾的方式),寅木弱时委曲求全旺时直接拿走。',
  '卯戌':'卯戌合--最难同频。各自有各自想法。卯木控制欲强,要求戌土跟它一样;戌土开局很大越做越小。',
  '辰酉':'辰酉合--生的关系但难同频。辰土想教育酉金、挑毛病;酉金认为辰土的一切是自己给的。都以结果为导向。',
  '巳申':'巳申合--克的关系,部分同频。见面谁也不服谁(比大声),最终相互妥协。巳火最吃软(装哭就道歉)。',
  '午未':'午未合--唯一相互生的六合。最好相处。午火自来熟爱帮助,未土觉得午火帮自己是应该的。'
}
export const SAN_XING_MEANING = '三刑=学习效仿。看到别人的好东西就想学。丑未戌三刑=三个合伙人两两交流;寅巳申三刑=两个人一件事,谁主动谁被"逮住"。'
export const ZI_HE_MEANING = '自合=目标明确、内心渴望强烈。很难从外部改造,必须从内突破。合财=对结果要求严格;合官杀=对认可要求高。'

// ──── 各作用关系的本质(人本解释) ────
export const ZUO_YONG_BEN_ZHI: Record<string, string> = {
  '合':'合=商量。双方坐下来谈,达成共识。正常手段,符合自然规律的做法。',
  '冲':'冲=交换。快速得到,但也容易出错。冲是逼出来的改变,不是自愿的。',
  '穿':'穿=以爱的名义索取。表面为你好,实际你要接受我的条件。',
  '刑':'刑=互相伤害。你想要的我也想,双方都有损失。不是正常手段。',
  '破':'破=有交换的。分了又合,合了又分,不彻底。'
}

// ──── 六十甲子亲疏(生的纯粹性) ────
export const GAN_JIA_ZI_QIN_QING: Record<string, string> = {
  '甲寅':'通根连体--亲儿子,最亲近。',
  '乙卯':'通根连体--亲女儿,最亲近。',
  '丙寅':'寅木生丙火=亲妈帮儿子,最纯粹。',
  '丁卯':'卯木生丁火=亲妈帮亲儿子。',
  '丁巳':'丁巳干支互通--巳火是丁的根,自己人。',
  '癸巳':'癸巳自合--巳中的庚是癸的印,自家人。',
  '戊子':'戊子自合--子水的财被戊管住。',
  '辛巳':'辛巳自合--巳中的官被辛合。',
  '丁未':'丁未--未是丁火的半禄,半个江山。'
}

// 四个土的品质区别
export const SI_KU_PIN_ZHI: Record<string, string> = {
  '戌':'戌--火库/印/公司。含阳气火。品质适合生金。午火运品质最好。',
  '丑':'丑--金库/比劫库/最寒。晦火极强,一个丑晦六个巳。申酉运品质最好。',
  '辰':'辰--水库/印库。"破土而发",适合开拓新部门。亥子运品质最好。',
  '未':'未--木库。快速生长型,适合扩张。寅卯运品质最好。'
}

export const SAN_HUI: Record<string,string[]> = {'寅':['寅','卯','辰'],'巳':['巳','午','未'],'申':['申','酉','戌'],'亥':['亥','子','丑']}
export const SAN_HE: Record<string,string[]> = {'寅':['寅','午','戌'],'巳':['巳','酉','丑'],'申':['申','子','辰'],'亥':['亥','卯','未']}

// 九组自合(R22)
export const ZI_HE: string[] = ['辛巳','癸巳','甲午','己亥','壬午','戊子','丙戌','壬戌','丁亥']

// 通根连体18个干支（盲派：身体本身就是工具，必须作为制，不能作为牛）
export const TONG_GEN_LIAN_TI: string[] = [
  '甲寅','甲辰','乙卯','乙亥','乙未','丙午','丙戌','丁巳','丁未',
  '戊寅','戊戌','庚申','辛酉','辛丑','壬子','壬辰','癸亥','癸丑'
]

export const TAO_HUA_MAP: Record<string, string> = {
  '申':'酉','子':'酉','辰':'酉','寅':'卯','午':'卯','戌':'卯','巳':'午','酉':'午','丑':'午','亥':'子','卯':'子','未':'子'
}
export const TAO_HUA_POS: string[] = ['年柱桃花--祖上有名望,异性缘来自长辈','月柱桃花--你主动,社交广桃花旺','日柱桃花--自身有魅力,配偶出众','时柱桃花--晚年桃花不弱']
export const GAN_BODY_ORGAN: Record<string, string> = {
  '甲':'胆','乙':'肝','丙':'小肠','丁':'心','戊':'胃','己':'脾','庚':'大肠','辛':'肺','壬':'膀胱','癸':'肾'
}
export const WU_XING_SICK: Record<string, string> = {
  '木':'肝胆不好、眼睛干涩','火':'气血问题、肩膀不适','土':'脾胃不好',
  '金':'呼吸道问题、牙齿不适','水':'肾脏问题,女命有妇科困扰'
}
export const WU_XING_ORGAN: Record<string, string> = {
  '木':'肝胆、眼睛、头颈','火':'心脏、气血、肩膀','土':'脾胃、消化系统','金':'呼吸道、肺、牙齿','水':'肾脏、泌尿系统'
}

// ──── 辅助函数 ────

export function wx(g: string): string { return WU_XING[g] || '' }
export function zhiWx(z: string): string { return ZHI_WU_XING[z] || '' }
export function zhiKu(zhi: string): string { return KU_MAP[zhi] || '' }

export function ss(ri: string, ot: string): string {
  const m: Record<string, Record<string, string>> = {
    '甲':{'甲':'比肩','乙':'劫财','丙':'食神','丁':'伤官','戊':'偏财','己':'正财','庚':'七杀','辛':'正官','壬':'偏印','癸':'正印'},
    '乙':{'甲':'劫财','乙':'比肩','丙':'伤官','丁':'食神','戊':'正财','己':'偏财','庚':'正官','辛':'七杀','壬':'正印','癸':'偏印'},
    '丙':{'甲':'偏印','乙':'正印','丙':'比肩','丁':'劫财','戊':'食神','己':'伤官','庚':'偏财','辛':'正财','壬':'七杀','癸':'正官'},
    '丁':{'甲':'正印','乙':'偏印','丙':'劫财','丁':'比肩','戊':'伤官','己':'食神','庚':'正财','辛':'偏财','壬':'正官','癸':'七杀'},
    '戊':{'甲':'七杀','乙':'正官','丙':'偏印','丁':'正印','戊':'比肩','己':'劫财','庚':'食神','辛':'伤官','壬':'偏财','癸':'正财'},
    '己':{'甲':'正官','乙':'七杀','丙':'正印','丁':'偏印','戊':'劫财','己':'比肩','庚':'伤官','辛':'食神','壬':'正财','癸':'偏财'},
    '庚':{'甲':'偏财','乙':'正财','丙':'七杀','丁':'正官','戊':'偏印','己':'正印','庚':'比肩','辛':'劫财','壬':'食神','癸':'伤官'},
    '辛':{'甲':'正财','乙':'偏财','丙':'正官','丁':'七杀','戊':'正印','己':'偏印','庚':'劫财','辛':'比肩','壬':'伤官','癸':'食神'},
    '壬':{'甲':'食神','乙':'伤官','丙':'偏财','丁':'正财','戊':'七杀','己':'正官','庚':'偏印','辛':'正印','壬':'比肩','癸':'劫财'},
    '癸':{'甲':'伤官','乙':'食神','丙':'正财','丁':'偏财','戊':'正官','己':'七杀','庚':'正印','辛':'偏印','壬':'劫财','癸':'比肩'},
  }
  return m[ri]?.[ot] || ''
}
export function sst(ri: string, ot: string): string {
  const s = ss(ri, ot); if (!s) return ''
  if (s==='正财'||s==='偏财') return '财'; if (s==='正官'||s==='七杀') return '官杀'
  if (s==='正印'||s==='偏印') return '印'; if (s==='食神'||s==='伤官') return '食伤'
  return '比劫'
}
export function isCai(s: string): boolean { return s==='正财'||s==='偏财' }
export function isGuan(s: string): boolean { return s==='正官'||s==='七杀' }
export function isYin(s: string): boolean { return s==='正印'||s==='偏印' }
export function isSS(s: string): boolean { return s==='食神'||s==='伤官' }
export function isBJ(s: string): boolean { return s==='比肩'||s==='劫财' }

export function getFlowGZ(year: number): [string, string] {
  const tg = '甲乙丙丁戊己庚辛壬癸', dz = '子丑寅卯辰巳午未申酉戌亥'
  const o = year - 4; return [tg[o%10], dz[o%12]]
}

// 判断一个天干是否在原局出现(含藏干)
export function isGanInChart(gan: string, gans: string[], zhis: string[]): boolean {
  if (gans.includes(gan)) return true
  for (const z of zhis) {
    if ((CANG_GAN[z]||[]).includes(gan)) return true
  }
  return false
}

// 判断一个五行在原局的强弱(含藏干)
export function wxStrength(wxType: string, gans: string[], zhis: string[]): number {
  let count = 0
  for (const g of gans) { if (wx(g) === wxType) count++ }
  for (const z of zhis) {
    if (zhiWx(z) === wxType) count++
    for (const cg of (CANG_GAN[z] || [])) { if (wx(cg) === wxType) count += 0.3 }
  }
  return count
}

// ──── 冲的力量评估(2026/06/25 全面修正) ────

export const SHENG_CYCLE: Record<string, string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
export const KE_CYCLE: Record<string, string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
export const CHONG_SAME_PAIRS: string[] = ['辰戌','戌辰','丑未','未丑']

export function evalZhiPower(zhi: string, monthZhi: string, allZhis: string[]): number {
  const wz = ZHI_WU_XING[zhi] || ''
  const mwz = ZHI_WU_XING[monthZhi] || ''
  let p = 5
  if (wz === mwz) p += 8
  else if (SHENG_CYCLE[mwz] === wz) p += 10
  else if (KE_CYCLE[mwz] === wz) p += 0
  else if (KE_CYCLE[wz] === mwz) p -= 4
  else if (SHENG_CYCLE[wz] === mwz) p -= 2
  for (const z of allZhis) {
    if (z === zhi || z === monthZhi) continue
    const zw = ZHI_WU_XING[z] || ''
    if (SHENG_CYCLE[zw] === wz) p += 3
    if (SHENG_CYCLE[wz] === zw) p -= 2
  }
  return Math.max(1, p)
}

export function isSameTypeChong(a: string, b: string): boolean {
  return CHONG_SAME_PAIRS.includes(a+b) || CHONG_SAME_PAIRS.includes(b+a)
}

export function evalChongOrder(a: string, b: string, monthZhi: string, allZhis: string[]): string {
  // 同类冲：辰戌丑未，比力量定方向
  if (isSameTypeChong(a, b)) {
    const ap = evalZhiPower(a, monthZhi, allZhis)
    const bp = evalZhiPower(b, monthZhi, allZhis)
    return ap >= bp ? a+'冲'+b : b+'冲'+a
  }
  // 五行相克冲：只有克的一方才能冲
  const aw = ZHI_WU_XING[a] || ''
  const bw = ZHI_WU_XING[b] || ''
  let attacker = '', defender = ''
  if (KE_CYCLE[aw] === bw) { attacker = a; defender = b }
  else if (KE_CYCLE[bw] === aw) { attacker = b; defender = a }
  if (!attacker) return ''
  const atkPower = evalZhiPower(attacker, monthZhi, allZhis)
  const aIdx = allZhis.indexOf(attacker)
  const dIdx = allZhis.indexOf(defender)
  let midDrain = 0
  const atkWx = ZHI_WU_XING[attacker] || ''
  for (let k = Math.min(aIdx,dIdx)+1; k < Math.max(aIdx,dIdx); k++) {
    const mid = allZhis[k]
    const mw = ZHI_WU_XING[mid] || ''
    if (SHENG_CYCLE[atkWx] === mw) midDrain += evalZhiPower(mid, monthZhi, allZhis) * 0.3
  }
  const effectivePower = atkPower - midDrain
  const threshold = Math.abs(aIdx-dIdx)===1 ? 6 : 8
  if (effectivePower < threshold) return ''
  return attacker + '冲' + defender
}

export function evalChongCan(a: string, b: string, monthZhi: string, allZhis: string[]): boolean {
  return evalChongOrder(a, b, monthZhi, allZhis) !== ''
}

// ──── 浓缩标签系统 ═══════════════════════════

export const WX_SEASON: Record<string, Record<string, string>> = {
  '寅':{木:'旺',火:'相',水:'休',金:'囚',土:'死'},
  '卯':{木:'旺',火:'相',水:'休',金:'囚',土:'死'},
  '辰':{土:'旺',金:'相',火:'休',木:'囚',水:'死'},
  '巳':{火:'旺',土:'相',木:'休',水:'囚',金:'死'},
  '午':{火:'旺',土:'相',木:'休',水:'囚',金:'死'},
  '未':{土:'旺',金:'相',火:'休',木:'囚',水:'死'},
  '申':{金:'旺',水:'相',土:'休',火:'囚',木:'死'},
  '酉':{金:'旺',水:'相',土:'休',火:'囚',木:'死'},
  '戌':{土:'旺',金:'相',火:'休',木:'囚',水:'死'},
  '亥':{水:'旺',木:'相',金:'休',土:'囚',火:'死'},
  '子':{水:'旺',木:'相',金:'休',土:'囚',火:'死'},
  '丑':{土:'旺',金:'相',火:'休',木:'囚',水:'死'},
}

/** 根分档:强根(禄/帝旺) vs 中根(余气/库) */
export const STRONG_ROOTS: Record<string, string[]> = {
  甲:['寅'],乙:['卯'],丙:['巳'],丁:['午'],
  戊:['巳','午','未','戌'],己:['巳','午','未','戌'],
  庚:['申'],辛:['酉'],壬:['亥'],癸:['子']
}
export const MEDIUM_ROOTS: Record<string, string[]> = {
  乙:['辰'],丁:['未'],辛:['戌'],癸:['丑'],
  戊:['辰','丑'],己:['辰','丑']
}

/**
 * 身强身弱 三权分立: 得令50% > 得地30% > 得势20%
 * 总分>=50=身强, <=15=身弱, 中间=中和
 */
export function bodyStrength(riGan: string, gans: string[], zhis: string[]): '身强'|'身弱'|'身中和' {
  const riWx = wx(riGan)
  const monthZhi = zhis[1]
  const season = WX_SEASON[monthZhi]
  const status = season?.[riWx] || ''
  const ling: Record<string,number> = {旺:50,相:30,休:10,囚:-10,死:-30}
  let total = ling[status] || 0  // 得令
  for (let i = 0; i < zhis.length; i++) {
    const z = zhis[i]
    const p = i === 1 ? 1 : i === 3 ? 1 : i === 2 ? 0.3 : 0.3
    if ((STRONG_ROOTS[riGan]||[]).includes(z)) total += 30 * p   // 得地强根
    else if ((MEDIUM_ROOTS[riGan]||[]).includes(z)) total += 15 * p  // 得地中根
  }
  for (let i = 0; i < gans.length; i++) {  // 得势(天干只表象)
    const p = i === 1 ? 1 : i === 3 ? 1 : i === 2 ? 0.6 : 0.3
    const w = wx(gans[i])
    if (w === riWx) total += 20 * p
    else { const s = ss(riGan, gans[i]); if (isYin(s)) total += 15 * p }
  }

  // 消耗侧——只看月支时支,真正核心在这里
  const consumeKeyCheck = (()=>{
    const mZhi = zhiWx(zhis[1]); const hZhi = zhiWx(zhis[3])
    const cMap = ({木:['火','土','金'],火:['土','金','水'],土:['金','水','木'],金:['水','木','火'],水:['木','火','土']}[riWx]||[])
    if (cMap.includes(mZhi) && cMap.includes(hZhi)) return '双杀'
    if (cMap.includes(mZhi) || cMap.includes(hZhi)) return '单杀'
    return '不杀'
  })()
  // 月时双克泄 + 得令非旺 → 强制身弱
  if (consumeKeyCheck === '双杀' && (ling[status]||0) < 50) return '身弱'
  // 月时单克泄 + 得令偏弱 → 身弱
  if (consumeKeyCheck === '单杀' && (ling[status]||0) <= -10) return '身弱'

  if (total >= 50) return '身强'
  else if (total <= 15) return '身弱'
  else return '身中和'
}

/** 旺相休囚死 + 身强身弱综合分析 */
export function bodyAndSeasonAnalysis(riGan: string, gans: string[], zhis: string[]): string[] {
  const r: string[] = []; const riWx = wx(riGan); const monthZhi = zhis[1]
  const season = WX_SEASON[monthZhi]
  const body = bodyStrength(riGan, gans, zhis)
  r.push(`你出生在${monthZhi}月。`)

  // 得地
  const roots: string[] = []
  for (let i = 0; i < zhis.length; i++) {
    const pos = i===1?'月':i===3?'时':i===2?'日':'年'
    if ((STRONG_ROOTS[riGan]||[]).includes(zhis[i])) roots.push(`${zhis[i]}(${pos}·强根)`)
    else if ((MEDIUM_ROOTS[riGan]||[]).includes(zhis[i])) roots.push(`${zhis[i]}(${pos}·中根)`)
  }
  if (roots.length > 0) r.push(`你的${riGan}在地支有根,底气相对充足。`)
  else r.push(`你的${riGan}在地支无根——需要借力发展。`)

  // 月时核心分析
  const mZhi = zhis[1]; const hZhi = zhis[3]
  const mWx = zhiWx(mZhi); const hWx = zhiWx(hZhi)
  // 判断月时是否克泄耗日主
  const consumeMap = ({木:['火','土','金'],火:['土','金','水'],土:['金','水','木'],金:['水','木','火'],水:['木','火','土']}[riWx]||[])
  const mKill = consumeMap.includes(mWx) ? '克泄耗' : '帮扶'
  const hKill = consumeMap.includes(hWx) ? '克泄耗' : '帮扶'
  const yZhi = zhis[0]; const rZhi = zhis[2]
  const yWx = zhiWx(yZhi); const rWx2 = zhiWx(rZhi)
  const yKill = consumeMap.includes(yWx) ? '克泄耗' : '帮扶'
  const rKill = consumeMap.includes(rWx2) ? '克泄耗' : '帮扶'
  r.push(`你先天状态:月柱${mZhi}对日主总体${mKill === '克泄耗' ? '牵制较多' : '有助力'},时柱${hZhi}也${hKill === '克泄耗' ? '需要留意' : '能帮到你'}。`)
  r.push(`年支${yZhi}是你祖辈环境的基调,大环境对你${yKill === '克泄耗' ? '不算友好' : '还算友善'}。`)



  // 综合
  const bodyCN: Record<string,string> = {身强:'自身力量充足,能担财担官。适合管理、创业、竞争型行业。',身弱:'自身力量不足,需要印(靠山/学历)和比劫(朋友/团队)。适合专业路线,别贪大。',身中和:'自身力量适中,进退有度。路宽但容易迷茫,需深耕一个方向。'}
  r.push(`综合判断:你的八字${body}。${bodyCN[body]||''}`)


  return r
}

/** 十神在身强/身弱下的不同解读 */
export function tenGodMeaning(tenGod: string, body: '身强' | '身弱' | '身中和'): string {
  const m: Record<string, Record<string, string>> = {
    '官杀': {
      '身强': '官杀在你这里是好事--身旺能担官。有事业心、有职位、有地位,别人服你。',
      '身弱': '官杀在你这里是压力--身弱不担官。事业上不是你想做就做,而是被人推着走。压力大、口舌多、容易跟上级和同事起是非。',
      '身中和': '官杀对你来说中性偏吉--能担一部分。你是有事业心的人,但也要注意自我调节。'
    },
    '财': {
      '身强': '财在你这里是好事--身旺能担财。赚钱渠道多,有能力守住钱。适合做投资、做生意。',
      '身弱': '财在你这里是负担--身弱不担财。不是赚不到钱,是赚到了也守不住。钱来钱去。你不适合贪大,稳扎稳打才是你的路。',
      '身中和': '财对你来说中性--能赚也能花。控制好消费欲望。'
    },
    '印': {
      '身强': '印在你这里偏中性--你已经够强了。适合做学问、搞研究,但小心依赖心。',
      '身弱': '印是你最重要的人--身弱最需要印。你身边需要有个能帮你、提携你的人。读书、进修、拜师是你改变命运的方式。',
      '身中和': '印对你是助力--有一定的学习能力和贵人运。'
    },
    '食伤': {
      '身强': '食伤是财富的源头--身旺食伤生财。脑子活、创意多,把想法变成产品就是钱。',
      '身弱': '食伤在消耗你--身弱食伤多了=想太多做太少。天天有想法但执行力跟不上。先把手上的事做透。',
      '身中和': '食伤中性--有想法也有执行力,但别贪多。'
    },
    '比劫': {
      '身强': '比劫过旺是竞争的信号--身边跟你水平差不多的人多。别跟比劫较劲,你要走差异化路线。',
      '身弱': '比劫是你需要的--你一个人撑不起来,需要朋友、团队、合作伙伴。你们得抱团取暖。',
      '身中和': '比劫中性--有朋友圈但不依赖。'
    }
  }
  return m[tenGod]?.[body] || ''
}

export function pref(ri: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const z = pills.map(p=>p.zhi)
  const g = pills.map(p=>p.gan)
  const riWx = wx(ri)
  const body = bodyStrength(ri, g, z)

  // [1] 身强身弱总论
  r.push(`你的八字${body}。${body === '身强' ? '自身力量足。能担财担官,做事有底气。但别太"自我"。' : body === '身弱' ? '自身力量不足。需要印(靠山/学历)和比劫(朋友/团队)来帮。别贪大,做不了老板就先做专业人才。' : '自身力量适中。进退有度,选择多但容易迷茫。'}`)

  // [2] 五行力量加权分析(月×2 时×1.5)
  const scores: Record<string,number> = {木:0,火:0,土:0,金:0,水:0}
  for (let i = 0; i < g.length; i++) scores[wx(g[i])] += i === 1 ? 1.5 : i === 3 ? 1.2 : 1
  for (let i = 0; i < z.length; i++) {
    scores[zhiWx(z[i])] += i === 1 ? 2 : i === 3 ? 1.5 : 1
    for (const cg of (CANG_GAN[z[i]] || [])) scores[wx(cg)] += (i === 1 ? 2 : i === 3 ? 1.5 : 1) * 0.3
  }
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1])
  const strong = sorted[0], weak = sorted[sorted.length-1]

  // [3] 主要十神判定
  const tg: Record<string,number> = {官杀:0,财:0,印:0,食伤:0,比劫:0}
  for (const v of g) tg[ss(ri, v)]++
  for (let i = 0; i < z.length; i++)
    for (const cg of (CANG_GAN[z[i]] || []))
      tg[ss(ri, cg)] += i === 1 ? 1 : i === 3 ? 0.8 : 0.5

  const topTG = Object.entries(tg).sort((a,b)=>b[1]-a[1])[0]
  if (topTG && topTG[1] >= 1.5) r.push(tenGodMeaning(topTG[0], body))

  // [4] 月时柱权重说明
  r.push(`你受外界环境的影响较大,月柱${z[1]}给你打下了人生基调。`)

  // [5] 五行强弱总结
  if (strong && weak && strong[0] !== weak[0]) {
    if (body === '身弱') {
      const isKe = {'水':'土','火':'水','木':'金','金':'火','土':'木'}[riWx] === strong[0]
      if (isKe) r.push(`八字${strong[0]}最强--克制你的日主${riWx}。生活压力大,很多事不受你控制。`)
      else if (['水','火','木','金','土'][['木','火','土','金','水'].indexOf(riWx)] === strong[0]) r.push(`八字${strong[0]}最强--这是生你的力量,有靠山。`)
      else r.push(`八字${strong[0]}最强。`)
    } else {
      r.push(`八字${strong[0]}最强--你的底色。方向选对了就是天赋。`)
    }
    r.push(`${weak[0]}最弱--这方面要补。`)
  }

  return r
}

export const WAN_WU: Record<string, {renwu:string[];wupin:string[];changsuo:string[];hangye:string[];shenti:string[];shijian:string[]}> = {
  '比肩':{renwu:['同龄人','战友','工友','兄弟姐妹','竞争对手','散户','普通群众'],wupin:['同款衣物','双胞胎','对称器物','分身','镜子','同款商品','平价日用品'],changsuo:['宿舍','集体宿舍','健身房','同学聚会场所','批发市场','平价商铺'],hangye:['合伙生意','同行同业','流水线工人','团队基层','平价零售'],shenti:['四肢','筋骨','肌肉','皮肉','双手双脚'],shijian:['结伴出行','同辈相争','平分财物','合伙共事','攀比内卷']},
  '劫财':{renwu:['情敌','竞争对手','酒肉朋友','投机者','江湖义气之人','销售人员'],wupin:['二手物品','分割之物','破损器物','抢夺类道具','赌场筹码'],changsuo:['赌场','娱乐会所','酒吧','拍卖场','二手市场','竞争激烈的赛场'],hangye:['博弈','销售','中介','竞争型行业','民间借贷','倒卖生意'],shenti:['血管','血液循环','咽喉','筋骨损伤','磕碰外伤'],shijian:['破财被骗','钱财被分','争夺感情','合伙散伙','冲动投资亏损']},
  '食神':{renwu:['厨师','美食博主','艺人','演员','教师','营养师','养生师','孩童','温顺晚辈'],wupin:['美食','零食','乐器','画笔','厨具','艺术品','化妆品','甜品'],changsuo:['餐厅','甜品店','画室','剧场','养生馆','游乐园','农家乐'],hangye:['餐饮','美妆','文创','演艺','养生','幼教','手工艺','美食自媒体'],shenti:['嘴巴','肠胃','食道','五官','皮肤','呼吸系统'],shijian:['吃喝玩乐','学艺深造','登台表演','享受休闲','生育生女','口福美食']},
  '伤官':{renwu:['设计师','发明家','律师','演说家','网红','艺术家','学者','叛逆青年','谋士'],wupin:['创意产品','文书','笔墨','话筒','手术刀','高科技设备','小众艺术品'],changsuo:['工作室','法庭','直播间','设计院','实验室','辩论赛场'],hangye:['设计','法律','新媒体','科研','医美','策划','自媒体','创意策划'],shenti:['大脑','五官','神经','伤口','手术','口舌','精神情绪'],shijian:['打官司','演讲辩论','创业创新','顶撞上级','才艺成名','手术伤病','口舌纠纷']},
  '正财':{renwu:['上班族','会计','出纳','实体店老板','工薪阶层','原配妻子','本分生意人'],wupin:['存款','工资卡','房产','田地','黄金首饰','日用品','固定资产','粮食'],changsuo:['写字楼','银行','实体店','农田','住宅','超市','稳定单位'],hangye:['会计','地产','农业','商超','行政文员','传统实体','固定薪资岗位'],shenti:['脾胃','腹部','皮肉','消化器官'],shijian:['上班领薪','购置房产','稳定经营','婚姻嫁娶','储蓄存款','长期稳定收入']},
  '偏财':{renwu:['投资人','商人','经销商','中介','富二代','异地贵人','副业从业者'],wupin:['股票','基金','彩票','珠宝','豪车','流动资产','礼品','海外资产'],changsuo:['交易所','赌场','奢侈品店','古玩市场','外贸市场','投资公司'],hangye:['金融投资','股票期货','外贸','古玩','中介','自媒体副业','大宗商品'],shenti:['肝胆','血液循环','筋骨','肺部'],shijian:['中彩票','投资获利','意外得财','异地求财','副业增收','送礼收礼','破财挥霍']},
  '正官':{renwu:['公务员','官员','法官','校长','国企领导','正派长辈','丈夫','公职人员'],wupin:['证书','公章','公文','法令','制服','官印','合同','证件'],changsuo:['政府机关','法院','学校','国企','办公楼','政务大厅','考场'],hangye:['公职','教育','法务','行政','事业单位','合规管理','体制内工作'],shenti:['肝胆','头部','神经','关节'],shijian:['考取功名','升职加薪','办理证件','婚姻（女命正缘）','接受正规管束','官司公正判决']},
  '七杀':{renwu:['军警','武将','法官','黑社会','屠夫','外科医生','创业者','强势对手','打手'],wupin:['刀具','枪械','兵器','警械','手术器械','危险品','尖锐金属','炸药'],changsuo:['军营','警局','法院','医院手术室','沙场','矿山','格斗赛场','监狱'],hangye:['军警','司法','医疗外科','安保','矿业','格斗','刑侦','高危行业','创业竞争行业'],shenti:['骨骼','刀伤','跌打损伤','血液','心脏','外伤','急症'],shijian:['官非牢狱','车祸意外','争斗打架','手术开刀','竞争上位','突发灾祸','手握实权掌权']},
  '正印':{renwu:['教师','医生','文人','长辈','母亲','宗教人士','公职文职','慈善家'],wupin:['书籍','文凭','房契','被褥','雨伞','庇护之物','经书','房产契约','衣物'],changsuo:['学校','图书馆','医院','寺庙','住宅','书房','养老院','文化馆'],hangye:['教育','文化','医疗','宗教','出版','文职','慈善','不动产'],shenti:['心脏','脾胃','皮肉','大脑','精神','免疫系统'],shijian:['读书升学','买房置业','长辈庇护','得贵人相助','考证拿文凭','安家落户','祈福受庇']},
  '偏印':{renwu:['命理师','道士','术士','医生（偏方）','科研怪人','隐士','心理咨询师','小众匠人'],wupin:['符咒','古书','偏方药材','冷门法器','古董','小众收藏品','玄学道具'],changsuo:['道观','寺庙偏殿','古玩店','占卜馆','实验室','冷门工作室','深山隐居地'],hangye:['玄学命理','中医偏方','占卜','考古','小众科研','神秘文化','非遗冷门手艺'],shenti:['神经系统','脑部','慢性病','内脏隐疾','精神抑郁','失眠'],shijian:['学习玄学秘术','独处修行','久病缠身','与长辈隔阂','意外孤独','子女健康受损','钻研冷门技艺']}
}

/** 判断一个十神在此人身上是喜用还是忌神 */
