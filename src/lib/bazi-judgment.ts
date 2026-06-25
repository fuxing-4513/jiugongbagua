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

const WU_XING: Record<string, string> = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' }

const CANG_GAN: Record<string, string[]> = {
  '子':['癸'],'丑':['己','癸','辛'],'寅':['甲','丙','戊'],'卯':['乙'],
  '辰':['戊','乙','癸'],'巳':['丙','庚','戊'],'午':['丁','己'],'未':['己','丁','乙'],
  '申':['庚','壬','戊'],'酉':['辛'],'戌':['戊','辛','丁'],'亥':['壬','甲']
}

const BEST_YIN_KU: Record<string, string> = { '甲':'辰','乙':'辰','丙':'未','丁':'未','戊':'戌','己':'戌','庚':'丑','辛':'丑','壬':'丑','癸':'丑' }
const KU_MAP: Record<string, string> = {
  '子':'辰','丑':'丑','寅':'未','卯':'未','辰':'辰','巳':'戌','午':'未','未':'未',
  '申':'丑','酉':'丑','戌':'戌','亥':'辰'
}
const ROOT_MAP: Record<string, string[]> = {
  '木':['寅','卯','辰','未','亥'],'火':['寅','巳','午','未','戌'],
  '土':['寅','辰','巳','午','未','申','戌','丑'],
  '金':['巳','申','酉','戌','丑'],'水':['辰','申','亥','子','丑']
}
const ZHI_WU_XING: Record<string, string> = {
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火',
  '午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'
}
const ZHI_NATURE: Record<string, string> = {
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
const PEI_OU_CHAR: Record<string, string> = {
  '子':'你对象聪明灵活,喜欢自由。给空间才行。','丑':'你对象务实踏实。嘴比较碎。',
  '寅':'你对象有主见有事业心。','卯':'你对象内心细腻专一。不轻易说爱。',
  '辰':'你对象包容性强但优柔寡断。','巳':'你对象精明能干说一不二。',
  '午':'你对象热情大方要面子。','未':'你对象执行力强务实。',
  '申':'你对象想得多顾虑多。','酉':'你对象讲究要求高。有自己一套标准。',
  '戌':'你对象忠诚可靠有底线。','亥':'你对象会照顾人但控制欲强。'
}
const WX_NATURE: Record<string, string> = {
  '木':'做事以结果为导向。希望得到别人的认可。',
  '火':'追求自由,缺乏安全感。特别要面子。',
  '土':'想得多,包容大。比劫对你的看法最重要。随遇而安。',
  '金':'抹不开面子,不会拒绝人。对自己要求高约束多。',
  '水':'自我要求高,对事业有追求。表面温和内心坚定。'
}
const LIU_HE: Record<string,string> = {'子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午'}
const LIU_CHONG: Record<string,string> = {'子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳'}
const LIU_CHUAN: Record<string,string> = {'子':'未','未':'子','丑':'午','午':'丑','寅':'巳','巳':'寅','卯':'辰','辰':'卯','申':'亥','亥':'申','酉':'戌','戌':'酉'}
const SAN_XING: Record<string,string> = {'寅':'巳','巳':'申','申':'寅','丑':'戌','戌':'未','未':'丑','子':'卯','卯':'子'}
// 六合人性
const HE_REN: Record<string, string> = {
  '子丑':'子丑合--克的关系。子水想得到事业,丑土想让子水听话。要给面子和荣誉才会配合。',
  '寅亥':'寅亥合--生的关系,但相互拉扯。亥水想控制寅木的自由(用关心照顾的方式),寅木弱时委曲求全旺时直接拿走。',
  '卯戌':'卯戌合--最难同频。各自有各自想法。卯木控制欲强,要求戌土跟它一样;戌土开局很大越做越小。',
  '辰酉':'辰酉合--生的关系但难同频。辰土想教育酉金、挑毛病;酉金认为辰土的一切是自己给的。都以结果为导向。',
  '巳申':'巳申合--克的关系,部分同频。见面谁也不服谁(比大声),最终相互妥协。巳火最吃软(装哭就道歉)。',
  '午未':'午未合--唯一相互生的六合。最好相处。午火自来熟爱帮助,未土觉得午火帮自己是应该的。'
}
const SAN_XING_MEANING = '三刑=学习效仿。看到别人的好东西就想学。丑未戌三刑=三个合伙人两两交流;寅巳申三刑=两个人一件事,谁主动谁被"逮住"。'
const ZI_HE_MEANING = '自合=目标明确、内心渴望强烈。很难从外部改造,必须从内突破。合财=对结果要求严格;合官杀=对认可要求高。'

// ──── 各作用关系的本质(人本解释) ────
const ZUO_YONG_BEN_ZHI: Record<string, string> = {
  '合':'合=商量。双方坐下来谈,达成共识。正常手段,符合自然规律的做法。',
  '冲':'冲=交换。快速得到,但也容易出错。冲是逼出来的改变,不是自愿的。',
  '穿':'穿=以爱的名义索取。表面为你好,实际你要接受我的条件。',
  '刑':'刑=互相伤害。你想要的我也想,双方都有损失。不是正常手段。',
  '破':'破=有交换的。分了又合,合了又分,不彻底。'
}

// ──── 六十甲子亲疏(生的纯粹性) ────
const GAN_JIA_ZI_QIN_QING: Record<string, string> = {
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
const SI_KU_PIN_ZHI: Record<string, string> = {
  '戌':'戌--火库/印/公司。含阳气火。品质适合生金。午火运品质最好。',
  '丑':'丑--金库/比劫库/最寒。晦火极强,一个丑晦六个巳。申酉运品质最好。',
  '辰':'辰--水库/印库。"破土而发",适合开拓新部门。亥子运品质最好。',
  '未':'未--木库。快速生长型,适合扩张。寅卯运品质最好。'
}

const SAN_HUI: Record<string,string[]> = {'寅':['寅','卯','辰'],'巳':['巳','午','未'],'申':['申','酉','戌'],'亥':['亥','子','丑']}
const SAN_HE: Record<string,string[]> = {'寅':['寅','午','戌'],'巳':['巳','酉','丑'],'申':['申','子','辰'],'亥':['亥','卯','未']}

// 九组自合(R22)
const ZI_HE: string[] = ['辛巳','癸巳','甲午','己亥','壬午','戊子','丙戌','壬戌','丁亥']

// 通根连体18个干支（盲派：身体本身就是工具，必须作为制，不能作为牛）
const TONG_GEN_LIAN_TI: string[] = [
  '甲寅','甲辰','乙卯','乙亥','乙未','丙午','丙戌','丁巳','丁未',
  '戊寅','戊戌','庚申','辛酉','辛丑','壬子','壬辰','癸亥','癸丑'
]

const TAO_HUA_MAP: Record<string, string> = {
  '申':'酉','子':'酉','辰':'酉','寅':'卯','午':'卯','戌':'卯','巳':'午','酉':'午','丑':'午','亥':'子','卯':'子','未':'子'
}
const TAO_HUA_POS: string[] = ['年柱桃花--祖上有名望,异性缘来自长辈','月柱桃花--你主动,社交广桃花旺','日柱桃花--自身有魅力,配偶出众','时柱桃花--晚年桃花不弱']
const GAN_BODY_ORGAN: Record<string, string> = {
  '甲':'胆','乙':'肝','丙':'小肠','丁':'心','戊':'胃','己':'脾','庚':'大肠','辛':'肺','壬':'膀胱','癸':'肾'
}
const WU_XING_SICK: Record<string, string> = {
  '木':'肝胆不好、眼睛干涩','火':'气血问题、肩膀不适','土':'脾胃不好',
  '金':'呼吸道问题、牙齿不适','水':'肾脏问题,女命有妇科困扰'
}
const WU_XING_ORGAN: Record<string, string> = {
  '木':'肝胆、眼睛、头颈','火':'心脏、气血、肩膀','土':'脾胃、消化系统','金':'呼吸道、肺、牙齿','水':'肾脏、泌尿系统'
}

// ──── 辅助函数 ────

function wx(g: string): string { return WU_XING[g] || '' }
function zhiWx(z: string): string { return ZHI_WU_XING[z] || '' }
function zhiKu(zhi: string): string { return KU_MAP[zhi] || '' }

function ss(ri: string, ot: string): string {
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
function sst(ri: string, ot: string): string {
  const s = ss(ri, ot); if (!s) return ''
  if (s==='正财'||s==='偏财') return '财'; if (s==='正官'||s==='七杀') return '官杀'
  if (s==='正印'||s==='偏印') return '印'; if (s==='食神'||s==='伤官') return '食伤'
  return '比劫'
}
function isCai(s: string): boolean { return s==='正财'||s==='偏财' }
function isGuan(s: string): boolean { return s==='正官'||s==='七杀' }
function isYin(s: string): boolean { return s==='正印'||s==='偏印' }
function isSS(s: string): boolean { return s==='食神'||s==='伤官' }
function isBJ(s: string): boolean { return s==='比肩'||s==='劫财' }

function getFlowGZ(year: number): [string, string] {
  const tg = '甲乙丙丁戊己庚辛壬癸', dz = '子丑寅卯辰巳午未申酉戌亥'
  const o = year - 4; return [tg[o%10], dz[o%12]]
}

// 判断一个天干是否在原局出现(含藏干)
function isGanInChart(gan: string, gans: string[], zhis: string[]): boolean {
  if (gans.includes(gan)) return true
  for (const z of zhis) {
    if ((CANG_GAN[z]||[]).includes(gan)) return true
  }
  return false
}

// 判断一个五行在原局的强弱(含藏干)
function wxStrength(wxType: string, gans: string[], zhis: string[]): number {
  let count = 0
  for (const g of gans) { if (wx(g) === wxType) count++ }
  for (const z of zhis) {
    if (zhiWx(z) === wxType) count++
    for (const cg of (CANG_GAN[z] || [])) { if (wx(cg) === wxType) count += 0.3 }
  }
  return count
}

// ──── 冲的力量评估(2026/06/25 全面修正) ────

const SHENG_CYCLE: Record<string, string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
const KE_CYCLE: Record<string, string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
const CHONG_SAME_PAIRS: string[] = ['辰戌','戌辰','丑未','未丑']

function evalZhiPower(zhi: string, monthZhi: string, allZhis: string[]): number {
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

function isSameTypeChong(a: string, b: string): boolean {
  return CHONG_SAME_PAIRS.includes(a+b) || CHONG_SAME_PAIRS.includes(b+a)
}

function evalChongOrder(a: string, b: string, monthZhi: string, allZhis: string[]): string {
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

function evalChongCan(a: string, b: string, monthZhi: string, allZhis: string[]): boolean {
  return evalChongOrder(a, b, monthZhi, allZhis) !== ''
}

// ──── 浓缩标签系统 ═══════════════════════════

function lifeLabels(riGan: string, pills: {gan:string;zhi:string}[], gender: string): string[] {
  const l: string[] = []
  const gans = pills.map(p=>p.gan)
  const zhis = pills.map(p=>p.zhi)
  const riZhi = zhis[2]
  const riWx = wx(riGan)
  const roots = ROOT_MAP[riWx]||[]
  const homeRoots = zhis.slice(2).filter(z=>roots.includes(z))
  const outRoots = zhis.slice(0,1).filter(z=>roots.includes(z))

  // 无根离乡
  if (homeRoots.length === 0 && outRoots.length === 0 && zhis.slice(0,2).filter(z=>roots.includes(z)).length === 0) {
    l.push('🏷️ 八字标签:无根离乡型--人生靠外力推动,贵人环境合作缺一不可。适合离乡发展。')
  }

  // 借根型
  if (homeRoots.length === 0 && outRoots.length > 0) {
    l.push('🏷️ 八字标签:借根型--不自信、重情义、怕欠人情。得有人带才行。')
  }

  // 家有禄根
  if (homeRoots.filter(z=>['寅','巳','申','亥'].includes(z)).length > 0 && homeRoots.filter(z=>!['寅','巳','申','亥'].includes(z)).length === 0) {
    l.push('🏷️ 八字标签:纯禄根--靠自己的能力,不靠圈子。')
  }

  // 全局同库(极纯八字)
  let allSame = true, totalKu = ''
  for (const g of gans) { const k = BEST_YIN_KU[g]||''; if(!totalKu) totalKu=k; else if(k!==totalKu) {allSame=false;break} }
  if (allSame && totalKu) l.push(`🏷️ 八字标签:极纯八字--身边全是"一路人",能量聚焦不分散。`)

  // 食伤生财（含地支藏干）
  let hasSS = false, hasCai = false
  for (const g of gans) { const st = ss(riGan,g); if(isSS(st)) hasSS=true; if(isCai(st)) hasCai=true }
  for (const z of zhis) {
    for (const c of (CANG_GAN[z]||[])) {
      const cst = sst(riGan, c)
      if(isSS(cst)) hasSS = true
      if(isCai(cst)) hasCai = true
    }
  }
  if (hasSS && hasCai) l.push('🏷️ 八字标签:食伤生财--靠技术/口才/才华吃饭。路子对了赚钱不难。')

  // 官印相生（含地支藏干）
  let hasGuan = false, hasYin = false
  for (const g of gans) { const st = ss(riGan,g); if(isGuan(st)) hasGuan=true; if(isYin(st)) hasYin=true }
  for (const z of zhis) {
    for (const c of (CANG_GAN[z]||[])) {
      const cst = sst(riGan, c)
      if(isGuan(cst)) hasGuan = true
      if(isYin(cst)) hasYin = true
    }
  }
  if (hasGuan && hasYin) l.push('🏷️ 八字标签:官印相生--适合体制/管理岗。能做成事。')

  // 比劫夺财（含地支藏干）
  let biCount = 0, caiCount = 0
  for (const g of gans) { const st = ss(riGan,g); if(isBJ(st)) biCount++; if(isCai(st)) caiCount++ }
  for (const z of zhis) {
    for (const c of (CANG_GAN[z]||[])) {
      const cst = sst(riGan, c)
      if(isBJ(cst)) biCount++
      if(isCai(cst)) caiCount++
    }
  }
  if (biCount >= 3 && caiCount <= 1) l.push('🏷️ 八字标签:比劫夺财--朋友多花钱快。注意别合伙别担保。')

  // 财旺从商（含地支）
  if (caiCount >= 2) l.push('🏷️ 八字标签:财旺型--适合做生意/做投资。')

  // 官杀混杂（含地支藏干,女命）
  let guanCount = 0
  for (const g of gans) { if(isGuan(ss(riGan,g))) guanCount++ }
  for (const z of zhis) {
    for (const c of (CANG_GAN[z]||[])) { if(isGuan(sst(riGan,c))) guanCount++ }
  }
  if (guanCount >= 2 && gender === '女') l.push('🏷️ 八字标签:官杀混杂--感情上容易有选择困难。建议晚婚。')

  // 印旺耗身（含地支藏干）
  let yinCount = 0
  for (const g of gans) { if(isYin(ss(riGan,g))) yinCount++ }
  for (const z of zhis) {
    for (const c of (CANG_GAN[z]||[])) { if(isYin(sst(riGan,c))) yinCount++ }
  }
  if (yinCount >= 3) l.push('🏷️ 八字标签:印旺耗身--想得多做得少。别内耗,学再多不如动手。')

  // 自合=自信(R22)
  for (const z of zhis) {
    const pos = ['年','月','日','时']
    if (ZI_HE.includes(gans[zhis.indexOf(z)] + z)) {
      l.push(`🏷️ 八字标签:自合型--自己会把自己说得很厉害。自信足。`)
    }
  }

  // 通根连体日主
  if (TONG_GEN_LIAN_TI.includes(gans[2] + zhis[2])) {
    l.push(`🏷️ 八字标签:通根连体日主--你的身体就是你的工具,你的人生必须"制"住某样东西才有价值。`)
  }

  if (l.length === 0) l.push('🏷️ 八字标签:综合型--运势多变,人生有起有落。')

  return l
}

// ──── 两象定一象推理(R10)═══════════════════

function twoSignsJudge(riGan: string, pills: {gan:string;zhi:string}[], gender: string): string[] {
  const r: string[] = []
  const zhis = pills.map(p=>p.zhi)
  const gans = pills.map(p=>p.gan)

  // 纯结论
  for (let i = 0; i < 2; i++) {
    const st = ss(riGan, gans[i])
    if (isCai(st) && sst(riGan, (CANG_GAN[pills[2].zhi]||[''])[0]) === '比劫') {
      r.push('跟朋友/合作方相关的财务问题要多留心。')
    }
  }

  for (let i = 0; i < 2; i++) {
    const st = ss(riGan, gans[i])
    if (isGuan(st)) {
      const monthSS = sst(riGan, gans[1])
      if (monthSS === '印') {
        r.push('事业靠学习和技术驱动。适合知识型岗位。')
      }
    }
  }

  const hourSS = ss(riGan, gans[3])
  if (isSS(hourSS) && sst(riGan, (CANG_GAN[pills[2].zhi]||[''])[0]) === '财') {
    r.push('最终的赚钱路径是靠技术或口才变现。')
  }

  let biCount = 0, guanCount = 0
  for (const g of gans) { const st = ss(riGan,g); if(isBJ(st)) biCount++; if(isGuan(st)) guanCount++ }
  if (biCount >= 3 && guanCount === 0) {
    r.push('不适合死板的上班环境,自由职业或创业更合适。')
  }

  return r
}

// ──── 根=房子(R8)+ 找桥梁(R1)══════════════

function rootHouseNarr(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const riWx = wx(riGan)
  const roots = ROOT_MAP[riWx]||[]
  const zhis = pills.map(p=>p.zhi)
  const posNames = ['年','月','日','时']
  const rtSeen = new Set<string>()

  // 根与住房：每个根最多输出一次结论
  for (let i = 0; i < zhis.length; i++) {
    if (roots.includes(zhis[i])) {
      const riKu = zhiKu(zhis[2])
      const posKu = zhiKu(zhis[i])
      if (riKu && posKu && riKu === posKu) {
        if (!rtSeen.has('anquangan')) { rtSeen.add('anquangan'); r.push('精神上有安全感,住的地方对你很重要。') }
      } else if (i === 0) {
        if (!rtSeen.has('outside')) { rtSeen.add('outside'); r.push('精神上依赖外面,不是本地命。') }
      }
    }
  }

  const bestKu = BEST_YIN_KU[riGan] || ''
  if (bestKu && !zhis.includes(bestKu)) {
    r.push(`当大运流年遇到${bestKu}时,你有换工作/换地方的强烈冲动。`)
  }

  return r
}

// ──── 大运断事(含R1 R3 R5 R14)═══════════════

function daYunJudgeV2(
  riGan: string, pills: {gan:string;zhi:string;gz:string}[],
  dg: string, dz: string
): string[] {
  const r: string[] = []
  const gans = pills.map(p=>p.gan)
  const zhis = pills.map(p=>p.zhi)
  const riZhi = zhis[2]
  const riWx = wx(riGan)
  const posNames = ['年','月','日','时']

  // [1] 大运来源(含藏干)
  if (isGanInChart(dg, gans, zhis)) {
    r.push(`这十年你在道上--大运的${dg}原局就有根。`)
  } else {
    r.push(`这十年是外来的运--跟着航道走能赚钱,偏离了就出问题。`)
  }

  // [2] 大运十神
  const ds = sst(riGan, dg)
  if (ds === '财') r.push('这十年追求钱相关的事。')
  if (ds === '官杀') r.push('这十年事业压力大。')
  if (ds === '印') r.push('这十年适合学习积累。')
  if (ds === '食伤') r.push('这十年想法多,发挥特长。')
  if (ds === '比劫') r.push('这十年朋友多合作多。')

  // [3] R5流年触发规则 + R14家里的字被家外合
  for (let i = 2; i < 4; i++) {
    if (gans[i] === dg && zhis[i] === dz) {
      for (let j = 0; j < 2; j++) {
        if (LIU_HE[zhis[i]] === zhis[j] || LIU_HE[zhis[j]] === zhis[i]) {
          r.push(`大运来了你${posNames[i]}柱的${dg}${dz}--被${posNames[j]}柱的${zhis[j]}合了(R14:家里字出来被家外合)。家外的人对你的东西有想法--要防着点。`)
        }
      }
    }
  }

  // [4] 大运谁控制——家里控制还是家外控制(原材料附录1)
  let homeHasControl = false
  let homeType = ''
  const ht: Record<string, string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
  for (const hg of gans.slice(2)) {
    if (ht[dg + hg] || ht[hg + dg]) { homeHasControl = true; homeType = '合'; break }
  }
  if (!homeHasControl) {
    for (const hz of zhis.slice(2)) {
      if (LIU_HE[hz] === dz || LIU_HE[dz] === hz) { homeHasControl = true; homeType = '合'; break }
      if (LIU_CHONG[hz] === dz || LIU_CHONG[dz] === hz) { homeHasControl = true; homeType = '冲'; break }
      if (LIU_CHUAN[hz] === dz || LIU_CHUAN[dz] === hz) { homeHasControl = true; homeType = '刑穿'; break }
    }
  }
  if (homeHasControl) {
    r.push(`这步大运${dg}${dz}跟你家里有关系(${homeType})--你有主导权。这十年你是主动方,事情成败在你手上。`)
  } else {
    r.push(`这步大运${dg}${dz}跟你家里没有直接关系--你参与但不主导。这十年你要借别人的力,别单干。`)
  }

  // [5] 信心与运气逆向
  r.push('提醒一句--信心十足时反而要谨慎(可能是坏运前的感觉)。信心不足时反而要大胆(可能是转运起点)。')

  // [6] 婚姻宫
  if (LIU_CHONG[riZhi] === dz) r.push(`大运${dz}冲了你夫妻宫--这十年感情容易波动。`)
  if (LIU_HE[riZhi] === dz) r.push(`大运${dz}合了你夫妻宫--这十年感情上有大变化。`)

  // [7] 弱点的字不喜出来
  const wc: Record<string,number> = {木:0,火:0,土:0,金:0,水:0}
  for (const v of gans) wc[wx(v)]++
  for (const v of zhis) wc[ZHI_WU_XING[v]]++
  const sorted = Object.entries(wc).sort((a,b)=>a[1]-b[1])
  const weakest = sorted[0]
  if (weakest && weakest[1] <= 2) {
    const dw = wx(dg)
    if (dw === weakest[0]) {
      const wwarn: Record<string,string> = {
        '木':'你的八字木最弱--食伤出来了。影响财源,结果不好。',
        '火':'你的八字火最弱--财出来了。轻则没钱,重则负债。',
        '土':'你的八字土最弱--官杀出来了。事业压力大,经常想换工作。',
        '金':'你的八字金最弱--印出来了。颠沛流离,经常换地方。',
        '水':'你的八字水最弱--比劫出来了。容易被朋友拖累。'
      }
      if (wwarn[dw]) r.push(wwarn[dw])
    }
  }

  // [8] 五行生克
  const sheng: Record<string,string[]> = {'木':['火'],'火':['土'],'土':['金'],'金':['水'],'水':['木']}
  const dWx = wx(dg)
  if (dWx && riWx) {
    if ((sheng[dWx]||[]).includes(riWx)) r.push(`${dg}(${dWx})生${riGan}(${riWx})--这步运能借力。`)
    else if ((sheng[riWx]||[]).includes(dWx)) r.push(`${dg}(${dWx})被${riGan}(${riWx})生--这步运你付出多。`)
  }

  return r
}

// ──── 流年断事(含R5 R16 + 严格优先级)════════

function flowYearV2(ri: string, pills: {gan:string;zhi:string}[],
  year: number, gender: string): string[] {
  const r: string[] = []
  const gans = pills.map(p=>p.gan)
  const zhis = pills.map(p=>p.zhi)
  const riZhi = zhis[2]
  const yearZhi = zhis[0]
  const [fg, fz] = getFlowGZ(year)

  // ──── 流年断法六步法(基于原材料附录1) ────

  // [1] 流年跟原局的关系——看来源(分三种情况)
  // 情况A: 原局有且强
  // 情况B: 原局有但弱 → 流年仍保持弱性
  // 情况C: 原局没有 → 流年为旺
  const fgWx = wx(fg)
  const fgStrength = wxStrength(fgWx, gans, zhis)

  if (fgStrength >= 3) {
    r.push(`${year}年(${fg}${fz})--这个字原局就有根而且强,今年是"顺势而为"。做你擅长的事就能成。`)
  } else if (fgStrength >= 1) {
    r.push(`${year}年(${fg}${fz})--这个字原局有但不够旺,今年是"补短板"的一年。你本来有这个底子,但还不够扎实,能借着流年的力量补一补。`)
  } else {
    r.push(`${year}年(${fg}${fz})--这个字原局没有,今年是"外来的运气"。能不能抓住看你的根够不够深。你八字里没有这个字,意味着要么今年突然有好事,要么你根本接不住。`)
  }

  // [2] 流年十神还原
  const fss = sst(ri, fg)
  if (fss === '财') r.push('今年关注钱的事。')
  if (fss === '官杀') r.push('今年工作压力大。')
  if (fss === '印') r.push('今年适合学习进修。')
  if (fss === '食伤') r.push('今年想法多。注意冲动。')
  if (fss === '比劫') r.push('今年朋友多应酬多。')

  // [3] R16: 食伤=说话,注意口头承诺
  if (fss === '食伤') r.push('今年注意口头承诺--说多了容易给自己挖坑。')

  // [4] 谁能控制这个流年的字——家里控制还是家外控制(原材料附录1第五步)
  // 控制关系:合不看力量,制要看力量,刑冲破害也要看力量
  const homeGans = gans.slice(2)
  const homeZhis = zhis.slice(2)
  const outGans = gans.slice(0,2)
  const outZhis = zhis.slice(0,2)

  // 检查流年天干是否被家里控制
  let homeControlsGan = false
  for (const hg of homeGans) {
    const ht: Record<string, string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
    if (ht[fg + hg] || ht[hg + fg]) { homeControlsGan = true; break }
  }
  // 检查流年天干是否被家外控制
  let outControlsGan = false
  for (const og of outGans) {
    const ht: Record<string, string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
    if (ht[fg + og] || ht[og + fg]) { outControlsGan = true; break }
  }

  if (homeControlsGan && !outControlsGan) {
    r.push(`今年流年${fg}被你家里控制了--你是主动方,这个运气你能把握。想要什么就直接做,别犹豫。`)
  } else if (!homeControlsGan && outControlsGan) {
    r.push(`今年流年${fg}被家外控制了--你不是主动方。事情的发展你控制不了,顺其自然就好,别硬出头。`)
  } else if (homeControlsGan && outControlsGan) {
    r.push(`今年流年${fg}家里家外都能控制--你一半主动一半被动。关键看你怎么选,选对了就是你的,选错了就是别人的。`)
  } else {
    r.push(`今年流年${fg}没有被明显控制--这个运气跟你若即若离。你要主动去争取,但别太执着。`)
  }

  // [5] 流年地支关系——严格按优先级: 先冲合 → 次刑穿破 → 最后生克
  let foundDiZhiRelation = false

  // 第一优先级: 冲 (冲的力量最大,优先判断)
  for (const z of zhis) {
    const co = evalChongOrder(z, fz, zhis[1], zhis)
    if (co) {
      r.push(`流年${co}--冲是交换,今年跟这个宫位相关的事会有快速变化。`)
      foundDiZhiRelation = true
      break
    }
  }

  // 第二优先级: 合 (合不看力量,只要合上就有关系)
  if (!foundDiZhiRelation) {
    for (const z of zhis) {
      if (LIU_HE[z] === fz) {
        r.push(`流年${fz}合了你${['年','月','日','时'][zhis.indexOf(z)]}柱的${z}--今年在这件事上需要跟人商量着来。合不看力量,只要合上了就有关系。`)
        if (z === riZhi) r.push(`合你的配偶宫--感情有变化。`)
        foundDiZhiRelation = true
        break
      }
    }
  }

  // 第三优先级: 穿 + 刑 (不分先后)
  if (!foundDiZhiRelation) {
    for (const z of zhis) {
      if (LIU_CHUAN[z] === fz) {
        r.push(`流年${fz}穿你${['年','月','日','时'][zhis.indexOf(z)]}柱的${z}--今年有说不清道不明的矛盾。表面没事,心里别扭。`)
        if (z === riZhi) r.push(`穿你的配偶宫--注意夫妻间隐性矛盾。有一根刺摆在那说不出口。`)
        foundDiZhiRelation = true
        break
      }
    }
  }

  if (!foundDiZhiRelation) {
    for (const z of zhis) {
      if (SAN_XING[z] === fz || SAN_XING[fz] === z) {
        r.push(`流年${fz}跟你${['年','月','日','时'][zhis.indexOf(z)]}柱的${z}刑--今年跟这个宫位的关系是在互相较劲中前进。`)
        foundDiZhiRelation = true
        break
      }
    }
  }

  // 第四优先级: 生克 (最后)
  if (!foundDiZhiRelation) {
    const fzWx = zhiWx(fz)
    const sheng: Record<string, string[]> = {木:['火'],火:['土'],土:['金'],金:['水'],水:['木']}
    const ke: Record<string, string[]> = {木:['土'],火:['金'],土:['水'],金:['木'],水:['火']}
    for (const z of zhis) {
      const zWx = zhiWx(z)
      if ((sheng[fzWx]||[]).includes(zWx)) {
        r.push(`流年${fz}(${fzWx})生你${['年','月','日','时'][zhis.indexOf(z)]}柱的${z}(${zWx})--今年有人或事帮你,是运气不错的一年。`)
        foundDiZhiRelation = true
        break
      }
      if ((ke[fzWx]||[]).includes(zWx)) {
        r.push(`流年${fz}(${fzWx})克你${['年','月','日','时'][zhis.indexOf(z)]}柱的${z}(${zWx})--今年有压制的力量。注意身体和人际关系。`)
        foundDiZhiRelation = true
        break
      }
    }
  }

  // [5] 桃花
  const th = TAO_HUA_MAP[yearZhi]
  if (th && fz === th) r.push(`今年是桃花年--异性缘不错。`)

  return r
}

// ──── 婚姻专项 ═══════════════════════════

function wanHun(ri: string, pills: {gan:string;zhi:string}[], gen: string): string[] {
  const r: string[] = []; const z = pills.map(p=>p.zhi); const rz = z[2]; const n = ['年','月','日','时']
  if (gen==='男') {
    const hs = ss(ri, pills[3].gan)
    if (isCai(hs)) r.push('感情来得比较晚。')
    for (const cg of CANG_GAN[pills[3].zhi]||[]) { if (isCai(ss(ri,cg))) {r.push('财星藏在时支--晚婚。');break} }
  } else {
    const hs = ss(ri, pills[3].gan)
    if (isGuan(hs)) r.push('感情来得比较晚。')
    for (const cg of CANG_GAN[pills[3].zhi]||[]) { if (isGuan(ss(ri,cg))) {r.push('官星藏在时支--晚婚。');break} }
  }
  for (const v of z) { if (v===rz) continue; const co=evalChongOrder(rz,v,z[1],z); if (co) {r.push(`婚姻宫被${co}--晚婚能化解。`);break} }
  if (r.length===0) r.push('没有明显的晚婚倾向。')
  return r
}

function liHun(ri: string, pills: {gan:string;zhi:string}[], gen: string): string[] {
  const r: string[] = []; const z = pills.map(p=>p.zhi); const rz = z[2]; const g = pills.map(p=>p.gan)
  let hasGen = false
  for (const v of z) { if (v===rz) continue; if (LIU_CHUAN[rz]===v) {r.push('婚姻宫被穿--有克服不了的矛盾。');hasGen=true} const co=evalChongOrder(rz,v,z[1],z); if (co) {r.push(`婚姻宫被${co}--容易动荡。`);hasGen=true} }
  const ht: Record<string,string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
  if (gen==='女') {
    for (const p of g) { const st=ss(ri,p); if (isGuan(st)) { for (const p2 of g) { if (p2===p) continue; if (ht[p+p2]||ht[p2+p]) {r.push(`官星${p}被${p2}合走--配偶容易被拉走。`);hasGen=true;break} };break} }
  } else {
    for (const p of g) { const st=ss(ri,p); if (isCai(st)) { for (const p2 of g) { if (p2===p) continue; if (ht[p+p2]||ht[p2+p]) {r.push(`财星${p}被${p2}合走--配偶容易被拉走。`);hasGen=true;break} };break} }
  }
  if (hasGen) r.push('以上是不利感情的信号。流年不触发就没事。')
  return r
}

function jieHun(ri: string, pills: {gan:string;zhi:string}[], gen: string, dg?: string): string[] {
  const r: string[] = []; const rz = pills[2].zhi
  if (!dg) return r
  const ds = sst(ri, dg)
  if (gen==='男' && isCai(ds)) r.push(`当前大运走财运(${dg})--这十年有结婚运。`)
  if (gen==='女' && isGuan(ds)) r.push(`当前大运走官运(${dg})--这十年有结婚运。`)
  if (LIU_HE[rz] === (pills[1]?.zhi||'')) r.push('感情方面的事情比较多。')
  return r
}

// ──── 健康 ────

/**
 * v8重写:健康分析 v3
 * 核心原则:
 *   1. 月支力量最大(月令),时柱力量第二
 *   2. 某五行在月时同时出现,力量翻倍
 *   3. 某五行出现在年柱但无根,视为虚浮/弱
 *   4. 生克关系链:火生土→土不弱,火克金→金被牵制,火金牵制需看向谁
 *   5. 甲子水无根+子水被巳午火制 → 木水最弱
 */
function healthV3(ri: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const g = pills.map(p=>p.gan)
  const z = pills.map(p=>p.zhi)

  // ========== 位置权重体系(你指定) ==========
  // 年=1%, 月=50%, 日=1%, 时=48%
  // 天干权重 = 同柱地支的30%(天干为表,地支为里)
  const POS_PCT: Record<string,number> = {年:1, 月:50, 日:1, 时:48}
  const posNames = ['年','月','日','时']
  
  // 加权五行力量统计
  const wc: Record<string,number> = {木:0,火:0,土:0,金:0,水:0}
  for (let i = 0; i < g.length; i++) {
    const posPct = POS_PCT[posNames[i]] || 1
    // 天干权重 = 柱权重的30% (天干为表)
    wc[wx(g[i])] = (wc[wx(g[i])] || 0) + posPct * 0.3
    // 地支权重 = 柱权重的70% (地支为里,比天干重要)
    wc[ZHI_WU_XING[z[i]]] = (wc[ZHI_WU_XING[z[i]]] || 0) + posPct * 0.7
  }
  
  // 生克关系修正: 生我者加权重,我克者减权重
  // 火生土:土受到火生→土不弱
  // 火克金:金受制→金的力量打折扣
  const shengMap: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const keMap: Record<string,string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
  
  // 生护关系: 某五行有生它的五行在月时→该五行不减弱
  // 克制关系: 某五行有克它的五行在月时→该五行打8折
  for (const wxName of Object.keys(wc)) {
    const shengBy = Object.entries(shengMap).find(([_,v]) => v === wxName)?.[0]  // 生我的
    const keBy = Object.entries(keMap).find(([_,v]) => v === wxName)?.[0]  // 克我的
    
    if (shengBy && wc[shengBy] >= 25) {
      // 生我的五行在月时有力→我不弱
      wc[wxName] = wc[wxName] * 1.3
    }
    if (keBy && wc[keBy] >= 50) {
      // 克我的五行极旺(在月令)→我被压制
      wc[wxName] = wc[wxName] * 0.7
    }
  }

  const sorted = Object.entries(wc).sort((a,b) => a[1] - b[1])
  const weakest = sorted[0]
  const strongest = sorted[sorted.length-1]

  // 𓆙 天干→脏腑（十干歌诀：甲胆乙肝丙小肠，丁心戊胃己脾乡；庚是大肠辛属肺，壬系膀胱癸肾藏）
  const GAN_ORGAN: Record<string,string> = {
    '甲':'胆','乙':'肝','丙':'小肠','丁':'心','戊':'胃','己':'脾','庚':'大肠','辛':'肺','壬':'膀胱','癸':'肾'
  }
  // 天干→身体部位（甲头乙项丙肩求，丁心戊肋己属腹；庚是脐轮辛属股，壬胫癸足一身由）
  const GAN_BODY: Record<string,string> = {
    '甲':'头/脑','乙':'脖颈','丙':'肩部','丁':'心/胸','戊':'肋部','己':'腹部','庚':'肚脐','辛':'大腿','壬':'小腿','癸':'足'
  }
  // 地支→脏腑
  const ZHI_ORGAN: Record<string,string> = {
    '子':'肾/膀胱/耳','丑':'脾/胃/肚脐','寅':'胆/手臂/筋骨','卯':'肝/十指/眼',
    '辰':'脾胃/胸腔/肩','巳':'心/咽喉/小肠','午':'心/眼目/血脉','未':'脾胃/脊梁/腰腹',
    '申':'大肠/肺/经络','酉':'肺/气管/鼻','戌':'命门/腰腿/关节','亥':'肾/骨髓/生殖/尿道'
  }
  // 五行→脏腑体表
  const WX_ORGAN: Record<string,string[]> = {
    '木':['肝','胆','目（眼睛）','筋/关节/神经','肝火/近视/偏头痛/中风'],
    '火':['心','小肠','舌（口舌咽喉）','血脉/血管/面部','心悸/高血压/心梗/焦虑'],
    '土':['脾','胃','口唇','肌肉/皮肉/腹部','胃胀/脾虚/糖尿病/痰湿'],
    '金':['肺','大肠','鼻','皮肤/毛孔/牙齿','咳嗽/鼻炎/皮肤病/便秘'],
    '水':['肾','膀胱','耳','骨骼/腰/生殖器官','肾虚/耳鸣/腰酸/骨质疏松']
  }

  // 𓆙 第一步：四柱宫位断病（年→头 月→胸 日→腰 时→下肢）
  const GONG = [
    [0, '年柱', '头部/脖颈/五官/颈椎——上半身顶端（先天根基）'],
    [1, '月柱', '胸腔/心肺/肝胆/乳腺——躯干中部（核心气机）'],
    [2, '日柱', '腰腹/脾胃/肾/生殖——躯干中下（命主本体）'],
    [3, '时柱', '下肢/腿脚/排泄/末梢——四肢末端（晚年身体）']
  ]

  r.push('━━━ 四柱对应人体（宫位+五行双断） ━━━')
  for (const item of GONG) {
    const idx = item[0] as number
    const name = item[1] as string
    const area = item[2] as string
    const gan = g[idx]
    const zhi = z[idx]
    const ganWx = wx(gan)
    const zhiWx = ZHI_WU_XING[zhi]
    const ganOrg = GAN_ORGAN[gan] || ''
    const ganBody = GAN_BODY[gan] || ''
    const zhiOrg = ZHI_ORGAN[zhi] || ''

    r.push(`【${name}】${gan}${zhi}：${area}`)
    r.push(`  天干${gan}=${ganWx}→${ganOrg}（${ganBody}）,地支${zhi}=${zhiWx}→${zhiOrg}`)

    // 宫位提示：只看年柱(年柱力量仅1%,最需关注)
    // 月日时的五行强弱由全局五行综合判断决定
    const go = WX_ORGAN[ganWx]
    if (go && weakest && idx === 0 && wc[ganWx] <= 20) {
      r.push(`  ⚠ ${ganWx}偏弱（${wc[ganWx].toFixed(1)}）→重点养护${go[0]}/${go[1]}，注意${go[4]}`)
    }
    const zo = WX_ORGAN[zhiWx]
    if (zo && strongest && idx === 0 && wc[zhiWx] >= 85 && zhiWx !== ganWx) {
      r.push(`  ⚠ ${zhiWx}偏旺（${wc[zhiWx].toFixed(1)}）→${zhiWx}过旺易使${zo[0]}郁结`)
    }
  }

  // 𓆙 第二步：五行旺衰综合
  r.push('')
  r.push('━━━ 五行脏腑强弱 ━━━')
  if (weakest && weakest[1] <= 25 && weakest[0]) {
    const wo = WX_ORGAN[weakest[0]]
    if (wo) {
      r.push(`最弱【${weakest[0]}】(${weakest[1].toFixed(1)})：脏=${wo[0]}，腑=${wo[1]}，窍=${wo[2]}，体=${wo[3]}`)
      r.push(`  易发问题：${wo[4]}。这是你后天要重点养护的。`)
      const cm: Record<string,string[]> = {木:['绿','青'],火:['红','紫'],土:['黄','棕'],金:['白','金'],水:['黑','蓝']}
      const cc = cm[weakest[0]]
      if (cc) r.push(`  宜多穿${cc.join('/')}色，饮食偏重${weakest[0]}属性。`)
    }
  }
  if (strongest && strongest[1] >= 80 && strongest[0]) {
    const wo = WX_ORGAN[strongest[0]]
    if (wo) r.push(`最旺【${strongest[0]}】(${strongest[1].toFixed(1)})：过旺则${wo[0]}易郁结，注意${wo[4]}。`)
  }

  // 𓆙 第三步：地支刑冲→隐患
  let hasConflict = false
  for (let i = 0; i < z.length; i++) {
    for (let j = i + 1; j < z.length; j++) {
      const co = evalChongOrder(z[i], z[j], z[1], z)
      if (co) {
        if (!hasConflict) { r.push(''); r.push('━━━ 地支冲克 → 对应器官隐患 ━━━'); hasConflict = true }
        const pi = ['年','月','日','时'][i]
        const pj = ['年','月','日','时'][j]
        r.push(`${pi}柱${z[i]}${z[j]}相冲（${co}）：${z[i]}（${ZHI_ORGAN[z[i]]}）与${z[j]}（${ZHI_ORGAN[z[j]]}）对冲，需同时养护。`)
      }
    }
  }

  // 𓆙 第四步：十神维度看健康（印=体质/比劫=体力/食伤=心情）
  const yinCount = g.filter(gg => ss(ri, gg) === '正印' || ss(ri, gg) === '偏印').length
  const biJieCount = g.filter(gg => ss(ri, gg) === '比肩' || ss(ri, gg) === '劫财').length
  r.push('')
  r.push('━━━ 十神维度看体质 ━━━')
  if (yinCount >= 2) {
    r.push('【印旺】你先天底子好、抵抗力强。但你心力消耗大——想得多的人身体反而消耗快。越是觉得自己身体好,越要留意心火。')
  } else if (yinCount === 0) {
    r.push('【印弱】你先天底子偏弱。别人熬三天没事,你熬一天就倒了。养生对你来说不是可有可无,是刚需。')
  }
  if (biJieCount >= 2) {
    r.push('【比劫旺】你体力好、恢复快。有小病小痛扛一扛就过去了。但小心仗着身体好透支——年轻时没事,四十以后找上门。')
  } else if (biJieCount === 0 && !z.some(zz => ['寅','巳','申','亥'].includes(zz))) {
    r.push('【比劫偏弱】你体力偏弱,容易累。不要跟别人比体力,你的策略是细水长流,不是短跑冲刺。')
  }

  // 𓆙 第五步：养生总结
  r.push('')
  r.push('💡 先天体质参考——宫位定位置，五行看脏腑，刑冲找隐患。具体以实际身体为准。')

  return r
}

// ──── 父母子女 ────

function parentV2(ri: string, pills: {gan:string;zhi:string;gz?:string}[]): string[] {
  const r: string[] = []; const mg = pills[1].gan; const mss = ss(ri,mg)
  const rk = zhiKu(pills[2].zhi), mk = zhiKu(pills[1].zhi)
  if (rk && mk && rk===mk) r.push('能借父母的力,关系近。')
  else r.push('自己的事自己扛,父母帮不上太多。')
  return r
}

function childrenV2(ri: string, pills: {gan:string;zhi:string;gz?:string}[]): string[] {
  const r: string[] = []; const hg = pills[3].gan; const hz = pills[3].zhi; const hs = ss(ri,hg)
  if (isYin(hs)) r.push('对子女教育上心。')
  else if (isCai(hs)) r.push('给子女花钱大方。')
  else if (isGuan(hs)) r.push('对子女要求严格。')
  else if (isSS(hs)) r.push('跟子女像朋友。')
  else if (isBJ(hs)) r.push('跟子女像兄弟/姐妹。')
  const rk = zhiKu(pills[2].zhi), hk = zhiKu(hz)
  if (rk && hk && rk===hk) r.push('跟小孩亲密,会以身作则。')
  return r
}

function caiXi(ri: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []; let found = false
  for (let i=0; i<4; i++) { const s=ss(ri,pills[i].gan); if (isCai(s)) {found=true} }
  if (!found) for (let i=0; i<4; i++) { for (const cg of CANG_GAN[pills[i].zhi]||[]) { if (isCai(ss(ri,cg))) {found=true;break} } if (found) break }
  if (!found) r.push('财来财去,不容易存住钱。')
  return r
}

function guanSha(ri: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []; let found = false
  for (let i=0; i<4; i++) { const s=ss(ri,pills[i].gan); if (isGuan(s)) {found=true} }
  if (!found) for (let i=0; i<4; i++) { for (const cg of CANG_GAN[pills[i].zhi]||[]) { if (isGuan(ss(ri,cg))) {found=true;break} } if (found) break }
  if (!found) r.push('事业上缺乏外力推动。')
  return r
}

/**
 * 旺相休囚死表: 月支 → 各五行节令状态
 */
const WX_SEASON: Record<string, Record<string, string>> = {
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
const STRONG_ROOTS: Record<string, string[]> = {
  甲:['寅'],乙:['卯'],丙:['巳'],丁:['午'],
  戊:['巳','午','未','戌'],己:['巳','午','未','戌'],
  庚:['申'],辛:['酉'],壬:['亥'],癸:['子']
}
const MEDIUM_ROOTS: Record<string, string[]> = {
  乙:['辰'],丁:['未'],辛:['戌'],癸:['丑'],
  戊:['辰','丑'],己:['辰','丑']
}

/**
 * 身强身弱 三权分立: 得令50% > 得地30% > 得势20%
 * 总分>=50=身强, <=15=身弱, 中间=中和
 */
function bodyStrength(riGan: string, gans: string[], zhis: string[]): '身强'|'身弱'|'身中和' {
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
function bodyAndSeasonAnalysis(riGan: string, gans: string[], zhis: string[]): string[] {
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
function tenGodMeaning(tenGod: string, body: '身强' | '身弱' | '身中和'): string {
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

function pref(ri: string, pills: {gan:string;zhi:string}[]): string[] {
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

// ═══════════════════════════════════════════════
//  主入口
// ═══════════════════════════════════════════════

export interface JudgmentResult {
  labels: string[]
  charNarr: string[]
  careerNarr: string[]
  wealthNarr: string[]
  marriageNarr: string[]
  parentNarr: string[]
  childrenNarr: string[]
  healthNarr: string[]
  prefNarr: string[]
  biJieNarr: string[]
  daYunNarr: string[]
  flowYearNarr: string[]
  wanHunNarr: string[]
  jieHunNarr: string[]
  liHunNarr: string[]
  twoSignsNarr: string[]
  rootHouseNarr: string[]
  friendModeNarr: string[]
  spouseDynamicNarr: string[]
  childrenRelationNarr: string[]
  /** 四柱六亲宫位分析 */
  liuqinGong: { nianZhu: string[]; yueZhu: string[]; riZhi: string[]; shiZhu: string[]; xingGong: string[]; summary: string[] }
  techAbilityNarr: string[]
  moneyMindsetNarr: string[]
  careerLevelNarr: string[]
  tombWareNarr: string[]
  deepHumanNarr: string[]
  controlPowerNarr: string[]
  dayMasterNarr: string[]
  enterpriseNarr: string[]
  /** v6新增: 制用结构评估(绳子与牛/制得干净/正制反制) */
  zhiYongNarr: string[]
  /** v7新增: 十神万物类象深度分析 */
  tenGodDetailNarr: string[]
  /** v7新增: 节气状态+身强身弱分析 */
  bodySeasonNarr: string[]
  /** v8 P0-1: 关系链引擎(BFS多跳推理) */
  bfsRelationNarr: string[]
  /** v8 P0-2: 大运评估四步法 */
  daYunFourStepNarr: string[]
  /** v8 P0-3: 两象定一象引擎(双线合论) */
  twoSignsEngineNarr: string[]
  /** v8 P0-4: 控制权三级归属(出处>生>控制) */
  controlLevelNarr: string[]
  /** v8 P0-5: 制用结构四元化(正制/反制/互制/不制) */
  zhiYongFourNarr: string[]
  /** v8 P0-6: 借根7层逻辑 */
  jieGenNarr: string[]
  /** v8 P0-7: 原局有无判断+全局标记 */
  yuanJuCheckNarr: string[]
}

export function analyzeJudgment(
  pills: {gan:string;zhi:string;gz:string}[],
  riGan: string,
  gender: string,
  birthYear: number,
  currentYear: number,
  currentDaYunGan?: string,
  currentDaYunZhi?: string
): JudgmentResult {
  const posNames = ['年','月','日','时']
  const zhis = pills.map(p => p.zhi)
  const gans = pills.map(p => p.gan)
  const riZhi = pills[2].zhi
  const riWx = wx(riGan)
  const monthGan = pills[1].gan
  const hourGan = pills[3].gan
  const yearZhi = pills[0].zhi

  // ──── 浓缩标签 ────
  const labels = lifeLabels(riGan, pills, gender)

  // ──── 性格 ────
  const charNarr: string[] = []
  if (WX_NATURE[riWx]) charNarr.push(WX_NATURE[riWx])
  if (ZHI_NATURE[riZhi]) charNarr.push(ZHI_NATURE[riZhi])
  const mainRS = sst(riGan, (CANG_GAN[riZhi]||[''])[0])
  if (mainRS === '印') charNarr.push('想得多爱学习。有选择困难症。')
  if (mainRS === '财') charNarr.push('以结果为导向。')
  if (mainRS === '官杀') charNarr.push('对自己要求高。')
  if (mainRS === '食伤') charNarr.push('喜欢自由。迟早自己干。')

  if (mainRS) charNarr.push(wangDian(ss(riGan,monthGan)))

  if (ZHI_NATURE[riZhi]) charNarr.push(ZHI_NATURE[riZhi])

  for (let hi = 0; hi < zhis.length; hi++) {
    for (let hj = hi + 1; hj < zhis.length; hj++) {
      if (LIU_CHUAN[zhis[hi]] === zhis[hj]) {
        charNarr.push(`${zhis[hi]}${zhis[hj]}穿--表面为你好,实际要你接受条件。你这人对外面总是笑眯眯的客气,但亲近你的人知道你骨子里有控制欲。`)
      }
      if (SAN_XING[zhis[hi]] === zhis[hj]) {
        charNarr.push(`${zhis[hi]}${zhis[hj]}刑--互相较劲互相学习。你的朋友圈里总有人在跟你比,你也老是拿自己跟别人比。`)
      }
    }
  }

  for (let hi = 0; hi < zhis.length; hi++) {
    for (let hj = hi + 1; hj < zhis.length; hj++) {
      if (LIU_HE[zhis[hi]] === zhis[hj]) {
        const key = zhis[hi] < zhis[hj] ? zhis[hi] + zhis[hj] : zhis[hj] + zhis[hi]
        if (HE_REN[key]) charNarr.push(HE_REN[key])
      }
    }
  }

  // 土塌理论
  const hasTu = zhis.some(z=>['辰','戌','丑','未'].includes(z)) || gans.some(g=>['戊','己'].includes(g))
  const hasShui = zhis.some(z=>['亥','子'].includes(z)) || gans.some(g=>['壬','癸'].includes(g))
  const hasMu = zhis.some(z=>['寅','卯'].includes(z)) || gans.some(g=>['甲','乙'].includes(g))
  if (hasTu && hasShui && hasMu) {
    const hasDingMu = zhis.slice(2).some(z=>['寅','卯'].includes(z)) || gans.slice(2).some(g=>['甲','乙'].includes(g))
    if (hasDingMu) charNarr.push('你是"家里有木能固定土"的人。别人出问题你能兜底,越是公司乱的时候你越有价值。但不适合自己当老板,当老板印一塌你就完了。')
  }

  // 月十神
  const mssn: Record<string,string> = {
    '正印':'爱学习、易信任人。','偏印':'钻研型,善良。',
    '正财':'大方理智。','偏财':'出手大方有冒险精神。',
    '食神':'喜欢吃喝玩乐。共情强。','伤官':'灵感多想法多。',
    '正官':'稳重但有小人心--容易信任别人。','七杀':'行动力强但冲动。',
    '比肩':'交友广。','劫财':'社交强竞争强。'
  }
  if (mssn[ss(riGan,monthGan)]) charNarr.push(mssn[ss(riGan,monthGan)])
  const hss = ss(riGan,hourGan)
  const hssn: Record<string,string> = {
    '正印':'内心强大自信沉稳。','偏印':'技术型。',
    '正财':'迟早自己干,有主见。','偏财':'投资创业型。',
    '食神':'喜欢自己研究。','伤官':'受委屈自己消化。',
    '正官':'脾气时好时坏。','七杀':'不安全感强。',
    '比肩':'对认定的人好到极致。','劫财':'重人际关系。'
  }
  if (hssn[hss]) charNarr.push(hssn[hss])

  // ──── 事业 ────
  const careerNarr: string[] = []
  const mss = sst(riGan,monthGan)
  if (mss==='印') careerNarr.push('追求归属感和稳定。看重团队。')
  if (mss==='财') careerNarr.push('追求收入和回报。')
  if (mss==='官杀') careerNarr.push('有野心追求职位。')
  if (mss==='食伤') careerNarr.push('追求自由,适合创意类。')
  if (mss==='比劫') careerNarr.push('需要伙伴,一个人不行。')

  // 反断法
  const hasCold = zhis.slice(0,2).some(z=>['子','亥'].includes(z)) || gans.slice(0,2).some(g=>['壬','癸'].includes(g))
  const hasFire = zhis.slice(2).some(z=>['巳','午'].includes(z)) || gans.slice(2).some(g=>['丙','丁'].includes(g))
  if (hasCold && hasFire) {
    careerNarr.push('外面越冷你越吃香。别人(比劫)越惨你越有发挥空间。你的人生机会往往来自别人的变故。')
  }

  const yearSS = sst(riGan, pills[0].gan)
  if (yearSS === '财') careerNarr.push('年上是财--你这辈子想赚大钱。做什么事都看有没有钱赚。')
  if (yearSS === '食伤') careerNarr.push('年上是食伤--你这辈子想法大、创意多。适合做产品和技术。')
  if (yearSS === '官杀') careerNarr.push('年上是官杀--你这辈子想干大事业。要地位要名声。')
  if (yearSS === '印') careerNarr.push('年上是印--有高级学历或体面工作。对精神和层次有追求。')
  if (yearSS === '比劫') careerNarr.push('年上是比劫--身边有牛逼的贵人,社会最顶层有朋友。')

  // 官印完整检查（含自坐印/自坐比劫）
  let hG=false, hY=false
  for (const g of gans) { const st=ss(riGan,g); if (isGuan(st)) hG=true; if (isYin(st)) hY=true }
  // 日支主星=印也算有印【自坐印】：戊午、丙戌等，有自尊要面子
  const riZhiRcm = (CANG_GAN[zhis[2]] || [''])[0]  // 日支主藏干
  const riZhiMainSS = sst(riGan, riZhiRcm)
  if (isYin(riZhiMainSS)) { hY = true; careerNarr.push('自坐印--你有框架有自尊,别人的话听不进去,有自己的主意。') }
  // 自坐比劫=同类=也有自尊要面子：戊戌（坐比劫）、乙卯（坐禄）等
  if (isBJ(riZhiMainSS)) { hY = true; careerNarr.push('自坐比劫--面子大过天,强者思维,受不了别人不把你当回事。') }
  if (hG&&hY) careerNarr.push('官印齐全--适合体制/管理。')
  if (hG&&!hY) careerNarr.push('有官无印--压力大,技术路线。')
  if (!hG&&hY) careerNarr.push('有印无官--坐等好运。')
  if (!hG&&!hY) careerNarr.push('官印不透--自己闯。')

  // ──── 财富 ────
  const wealthNarr: string[] = caiXi(riGan, pills)
  for (const g of gans) { if (isSS(ss(riGan,g))) {wealthNarr.push('有食伤生财--靠技术赚钱。');break} }

  // ──── 婚姻 ────
  const marriageNarr: string[] = []
  if (PEI_OU_CHAR[riZhi]) marriageNarr.push(PEI_OU_CHAR[riZhi])
  const spouseMarrySeen = new Set<string>()
  for (const z of zhis) {
    if (z===riZhi) continue
    if (LIU_HE[riZhi]===z && !spouseMarrySeen.has('he'+z)) { spouseMarrySeen.add('he'+z); marriageNarr.push('配偶宫被合。'); }
    const co=evalChongOrder(riZhi,z,zhis[1],zhis); if (co && !spouseMarrySeen.has('chong'+z)) { spouseMarrySeen.add('chong'+z); marriageNarr.push(`配偶宫被${co}。`); }
    if (LIU_CHUAN[riZhi]===z && !spouseMarrySeen.has('chuan'+z)) { spouseMarrySeen.add('chuan'+z); marriageNarr.push('配偶宫被穿。'); }
  }
  if (gender==='男') { marriageNarr.push('男命--以财为妻。');marriageNarr.push(...caiXi(riGan,pills))
    const th = TAO_HUA_MAP[yearZhi]; if (th && zhis.includes(th)) marriageNarr.push(`桃花(${th})在${posNames[zhis.indexOf(th)]}柱--${TAO_HUA_POS[zhis.indexOf(th)]}`)
  } else { marriageNarr.push('女命--以官杀为夫。');marriageNarr.push(...guanSha(riGan,pills))
    const th = TAO_HUA_MAP[yearZhi]; if (th && zhis.includes(th)) marriageNarr.push(`桃花(${th})在${posNames[zhis.indexOf(th)]}柱--${TAO_HUA_POS[zhis.indexOf(th)]}`)
  }

  // ──── 其他 ────
  const parentNarrResult = parentV2(riGan, pills)
  const childrenNarrResult = childrenV2(riGan, pills)
  const healthNarrResult = healthV3(riGan, pills)
  const prefNarrResult = pref(riGan, pills)
  const twoSignsResult = twoSignsJudge(riGan, pills, gender)
  const rootHouseResult = rootHouseNarr(riGan, pills)
  const friendModeResult = analyzeFriendMode(riGan, pills, ss)
  const liuqinResult = analyzeLiuQin(riGan, pills, gender, ss)
  const spouseDynamicResult = analyzeSpouseDynamic(riGan, pills, gender)
  const childrenRelationResult = analyzeChildrenRelation(riGan, pills)
  const techAbilityResult = analyzeTechAbility(riGan, pills)
  const moneyMindsetResult = analyzeMoneyMindset(riGan, pills)
  const careerLevelResult = analyzeCareerLevel(riGan, pills, gender)
  const tombWareResult = analyzeTombWarehouse(riGan, pills, gender)
  const deepHumanResult = deepHumanInsight(riGan, pills, gender)
  const controlPowerResult = controlPowerAnalysis(riGan, pills)
  const dayMasterResult = dayMasterNature(riGan, pills)
  const enterpriseResult = enterpriseAnalysis(riGan, gans, zhis)
  const zhiYongResult = zhiYongEvaluate(riGan, gans, zhis, gender)
  const tenGodDetailResult = tenGodDetailAnalysis(riGan, pills, gender, bodyStrength(riGan, gans, zhis))
  const bodySeasonResult = bodyAndSeasonAnalysis(riGan, gans, zhis)
  // ──── 大运 ────
  const daYunNarr: string[] = currentDaYunGan && currentDaYunZhi
    ? daYunJudgeV2(riGan, pills as any, currentDaYunGan, currentDaYunZhi)
    : ['请提供当前大运干支。']

  // ──── 流年 ────
  const flowYearNarr: string[] = flowYearV2(riGan, pills, currentYear, gender)

  // ──── 婚姻专项 ────
  const wanHunNarr: string[] = wanHun(riGan, pills, gender)
  const jieHunNarr: string[] = jieHun(riGan, pills, gender, currentDaYunGan)
  const liHunNarr: string[] = liHun(riGan, pills, gender)

  return {
    labels, charNarr, careerNarr, wealthNarr, marriageNarr,
    parentNarr: parentNarrResult, childrenNarr: childrenNarrResult,
    healthNarr: healthNarrResult, prefNarr: prefNarrResult,
    biJieNarr: ['比劫分析集成在标签和两象定一象中'],
    daYunNarr, flowYearNarr, wanHunNarr, jieHunNarr, liHunNarr,
    twoSignsNarr: twoSignsResult, rootHouseNarr: rootHouseResult,
    friendModeNarr: friendModeResult,
    spouseDynamicNarr: spouseDynamicResult,
    childrenRelationNarr: childrenRelationResult,
    liuqinGong: liuqinResult,
    techAbilityNarr: techAbilityResult,
    moneyMindsetNarr: moneyMindsetResult,
    careerLevelNarr: careerLevelResult,
    tombWareNarr: tombWareResult,
    deepHumanNarr: deepHumanResult,
    controlPowerNarr: controlPowerResult,
    dayMasterNarr: dayMasterResult,
    enterpriseNarr: enterpriseResult,
    zhiYongNarr: zhiYongResult,
    tenGodDetailNarr: tenGodDetailResult,
    bodySeasonNarr: bodySeasonResult,
    bfsRelationNarr: bfsRelationChain(riGan, pills, gender),
    daYunFourStepNarr: currentDaYunGan && currentDaYunZhi
      ? daYunFourStep(riGan, pills, currentDaYunGan, currentDaYunZhi, gender)
      : ['请提供当前大运干支。'],
    twoSignsEngineNarr: twoSignsEngine(riGan, gans, zhis, gender),
    controlLevelNarr: controlLevelThree(riGan, pills),
    zhiYongFourNarr: zhiYongFour(riGan, gans, zhis, gender),
    jieGenNarr: jieGenAnalysis(riGan, pills),
    yuanJuCheckNarr: yuanJuCheck(riGan, gans, zhis, gender)
  }
}

// ═══════════════════════════════════════════════
//  十神万物类象深度分析
// ═══════════════════════════════════════════════

/** 万物类象——十神的六维映射 */
const WAN_WU: Record<string, {renwu:string[];wupin:string[];changsuo:string[];hangye:string[];shenti:string[];shijian:string[]}> = {
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
function xiJiGod(ri: string, gans: string[], zhis: string[], tenGod: string): '喜神'|'忌神'|'中性' {
  const riWx = wx(ri)
  let score = 0
  // 身强身弱基准
  const body = bodyStrength(ri, gans, zhis)
  if (body === '身弱') {
    if (tenGod === '印') score += 2
    else if (tenGod === '比劫') score += 1
    else if (tenGod === '官杀') score -= 2
    else if (tenGod === '财') score -= 1
    else if (tenGod === '食伤') score -= 1
  } else if (body === '身强') {
    if (tenGod === '官杀') score += 2
    else if (tenGod === '财') score += 1
    else if (tenGod === '食伤') score += 1
    else if (tenGod === '印') score -= 1
    else if (tenGod === '比劫') score -= 2
  }
  // 实际出现增强判断
  for (const g of gans) {
    const s = ss(ri, g)
    if (s === tenGod) score += 0.5
  }
  for (const z of zhis) {
    for (const cg of (CANG_GAN[z] || [])) {
      if (ss(ri, cg) === tenGod) score += 0.3
    }
  }
  if (score >= 2) return '喜神'
  else if (score <= -1) return '忌神'
  else return '中性'
}

/** 十神万物类象深度分析(融合身强身弱+喜忌+类象) */
function tenGodDetailAnalysis(ri: string, pills: {gan:string;zhi:string}[], gender: string, body: '身强'|'身弱'|'身中和'): string[] {
  const r: string[] = []; const gans = pills.map(p=>p.gan); const zhis = pills.map(p=>p.zhi)
  const posNames = ['年','月','日','时']

  // 统计算每个十神的天干+藏干出现次数(加权)
  const counts: Record<string,{total:number;pos:string[]}> = {比肩:{total:0,pos:[]},劫财:{total:0,pos:[]},食神:{total:0,pos:[]},伤官:{total:0,pos:[]},正财:{total:0,pos:[]},偏财:{total:0,pos:[]},正官:{total:0,pos:[]},七杀:{total:0,pos:[]},正印:{total:0,pos:[]},偏印:{total:0,pos:[]}}
  for (let i = 0; i < gans.length; i++) {
    const s = ss(ri, gans[i])
    if (counts[s]) { counts[s]!.total++; counts[s]!.pos.push(posNames[i]) }
  }
  for (let i = 0; i < zhis.length; i++) {
    for (const cg of (CANG_GAN[zhis[i]] || [])) {
      const s = ss(ri, cg)
      if (counts[s]) { counts[s]!.total += 0.5 }
    }
  }

  // 按总出现排序
  const sorted = Object.entries(counts).sort((a,b)=>b[1].total - a[1].total)

  // 输出每个>=1.5的十神
  for (const [tg, info] of sorted) {
    if (info.total < 1.5) continue
    const ww = WAN_WU[tg]
    const xi = xiJiGod(ri, gans, zhis, tg)

    // 核心心性(从资料提炼吉凶)
    const xinXing: Record<string,{ji:string;xiong:string}> = {
      '比肩':{ji:'你独立、有主见、能跟人共甘共苦,不贪非分之财。',xiong:'你固执、自我为中心、好攀比。不是别人跟你比,是你自己在跟自己较劲。'},
      '劫财':{ji:'你豪爽大方、行动力强、敢闯敢拼、热心帮人。',xiong:'你冲动、脾气急、花钱大手大脚、容易因为朋友破财。'},
      '食神':{ji:'你温和善良、乐观豁达、有口福、擅长才艺、知足常乐。',xiong:'你懒散、贪图享受、好吃懒做、不思进取。'},
      '伤官':{ji:'你聪明、脑洞大、创意强、口才犀利、敢突破规则。',xiong:'你恃才傲物、顶撞领导、口舌是非多、叛逆不服管。'},
      '正财':{ji:'你勤俭稳重、踏实本分、有责任心、精打细算能守财。',xiong:'你吝啬抠门、眼光短浅、胆小保守、过分看重物质。'},
      '偏财':{ji:'你慷慨大方、人缘好、眼光独到、敢把握机遇、灵活变通。',xiong:'你挥霍无度、风流多情、财来财去留不住、好赌。'},
      '正官':{ji:'你品行端正、守规矩、有责任心、重视名誉、正直公正。',xiong:'你胆小懦弱、死板教条、优柔寡断、过分畏惧权威。'},
      '七杀':{ji:'你胆识过人、杀伐果断、领导力强、抗压能力极强、敢闯敢拼。',xiong:'你暴躁、偏激冲动、是非官非多、压力崩溃、好斗。'},
      '正印':{ji:'你仁慈宽厚、心地善良、有学识修养、有贵人帮扶、淡泊名利。',xiong:'你依赖性强、懒惰被动、死板固执、逃避竞争。'},
      '偏印':{ji:'你悟性极高、直觉敏锐、精通冷门领域、心思缜密、洞察力强。',xiong:'你孤僻冷漠、多疑猜忌、消极悲观、不合群、内心阴郁。'}
    }
    const xing = xinXing[tg]

    // 输出
    r.push(`【${tg}】出现${info.total >= 2 ? '较多' : '明显'}`)

    if (xi === '喜神') {
      if (xing) r.push(`对你来说是喜神。${xing.ji}`)
      r.push(`类象:你生活中容易接触${(ww?.renwu||[]).slice(0,3).join('、')}这类人,常出现在${(ww?.changsuo||[]).slice(0,2).join('或')}。身体上注意${(ww?.shenti||[]).slice(0,2).join('、')}。`)
    } else if (xi === '忌神') {
      if (xing) r.push(`对你来说是忌神。${xing.xiong}`)
      r.push(`提示:注意控制。生活中${(ww?.shijian||[]).slice(0,2).join('、')}这类事容易发生。身体上留心${(ww?.shenti||[]).slice(0,2).join('、')}。`)
    } else {
      if (xing) r.push(`对你来说中性。吉时${xing.ji}凶时${xing.xiong}`)
      r.push(`你生活中偶尔出现${(ww?.renwu||[]).slice(0,2).join('、')}相关的人或事。`)
    }
  }

  // 补充:正偏神比例
  let zhengCount = 0, pianCount = 0
  for (const g of gans) {
    const s = ss(ri, g)
    if (['比肩','食神','正财','正官','正印'].includes(s)) zhengCount++
    else if (['劫财','伤官','偏财','七杀','偏印'].includes(s)) pianCount++
  }
  if (zhengCount > pianCount + 1) r.push('正神偏多--性格偏稳。适合走正统路线:体制内、大公司、规范行业。')
  else if (pianCount > zhengCount + 1) r.push('偏神偏多--性格偏激动荡。适合不走寻常路:创业、艺术、投资、技术自由职业。')
  else r.push('正偏均衡--能稳也能闯。你来得了体制也做得了生意,关键看你选什么。')

  // 特殊配置说明——用显式循环访问避免TS可选链问题
  const getTG = (name: string) => { for (const [k,v] of sorted) { if (k===name) return v.total } return 0 }
  const hasZhengGuan = getTG('正官') >= 0.5
  const hasQiSha = getTG('七杀') >= 0.5
  if (hasZhengGuan && hasQiSha) r.push('正官七杀同现--官杀混杂。你一方面要规矩(正官),一方面又不想被人管(七杀)。这是矛盾的。适合你在体制外干体制内的事,或者用正职的规范来做副业的突破。')

  const hasZhengYin = getTG('正印') >= 0.5; const hasPianYin = getTG('偏印') >= 0.5
  if (hasZhengYin && hasPianYin) r.push('正印偏印同现--两种学习方式。你不是纯学院派,也不是纯野路子。一半靠正统学习,一半靠自学和钻研。适合做需要交叉学科的事。')

  const hasShiShen = getTG('食神') >= 0.5; const hasShangGuan = getTG('伤官') >= 0.5
  if (hasShiShen && hasShangGuan) r.push('食神伤官同现--才华输出方式多样。你既能温和表达(食神),又能犀利突破(伤官)。这是双刃剑:用好了是通才,用不好是半桶水。')

  return r
}


// ──── 深度朋友相处分析 ════════════════════

function analyzeFriendMode(riGan: string, pills: {gan:string;zhi:string}[], ss: (r:string,g:string)=>string): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)

  // 六亲定位：年=祖上/长辈 月=父母/兄弟姐妹/朋友圈 日支=配偶 时=子女/下属

  // ── 年柱：祖上/长辈 ──
  const yearGan = gans[0]
  const yearZhi = zhis[0]
  const yearCang = (CANG_GAN[yearZhi] || [''])[0]
  const yearSS = ss(riGan, yearGan)

  if (isBJ(yearSS)) {
    r.push(`年柱${yearGan}${yearZhi}比劫透出--祖上或长辈圈里有人跟你是同类人。你身上有他们传下来的那股劲,不管好坏你都带着他们的烙印。`)
    if (yearCang) {
      const yearHat = sst(riGan, yearCang)
      if (yearHat === '印') r.push(`  祖上讲究体面,他们那代人吃过苦,所以特别在意面子。你做事要体面,不能让他们丢人。`)
      else if (yearHat === '财') r.push(`  祖上现实得很,做事讲结果。家里有老江湖,你看事情容易先算值不值。`)
      else if (yearHat === '官杀') r.push(`  祖上管得严,规矩大。你怕说错话做错事,这毛病是祖上传下来的。`)
      else if (yearHat === '食伤') r.push(`  祖上有手艺人或读书人,你骨子里的技术底子从这里来。`)
    }
  }

  // ── 月柱：父母/兄弟姐妹/朋友圈 ──
  const monthGan = gans[1]
  const monthZhi = zhis[1]
  const monthSS = ss(riGan, monthGan)
  const monthCang = (CANG_GAN[monthZhi] || [''])[0]

  // 先看月干是否是比劫（兄弟姐妹/朋友的核心标志）
  if (isBJ(monthSS)) {
    // 按柱位分析比劫：不同位置的朋友类型不同 + 区分比肩与劫财
    // 核心逻辑：年上是国家、祖辈、贵人层面,不跟日主在同一场域竞争
    // 月上是社会、现实层面,月柱比劫才是真正跟日主竞争的
    // 时上是家庭、晚年归属层面
    const bjSeen = new Set<string>()
    for (let i = 0; i < zhis.length; i++) {
      const z = zhis[i]
      const mainCg = (CANG_GAN[z] || [''])[0]
      if (!mainCg) continue
      const cgSS = ss(riGan, mainCg)
      if (!isBJ(cgSS)) continue
      const pos = ['年','月','日','时'][i]
      const bjKey = pos + mainCg + z
      if (bjSeen.has(bjKey)) continue
      bjSeen.add(bjKey)
      const isBiJian = mainCg === riGan
      if (pos === '年') {
        // 年上是国家/祖辈/贵人层面,不跟日主竞争
        if (isBiJian) {
          r.push('年上有比肩根--国家层面有你的同路人。你天生有贵气,对大平台有缘分,看国家大事有共鸣。这不是跟你在一个碗里抢饭吃的朋友,是给你铺路的人。')
        } else {
          r.push('年上有劫财根--祖上或长辈圈子里有人在社会上混得开,路子野。不是你亲兄弟那种交情,更多是利益来往。这个根不跟你抢,但你也别指望他给你兜底。')
        }
      } else if (pos === '月') {
        // 月上是社会/现实层面,月柱比劫才跟日主竞争
        if (isBiJian) {
          r.push('月柱有比肩根--你中年圈子里有真兄弟、真合伙人。能跟你一起扛事,不是酒肉朋友。但月柱毕竟是社会场,该分清楚的利益还是要分清楚。')
        } else {
          r.push('月柱有劫财根--你中年认识的朋友是社会层面的,层次参差不齐。有些讲义气,有些沾了就甩不掉。月上的劫财是你现实中要防的--他会跟你抢生意、抢机会、抢女人。社会场上的竞争就在这里。')
        }
      } else if (pos === '时') {
        // 时上是家庭/晚年归属
        if (isBiJian) {
          r.push('时柱有比肩根--你的根在家里。中年折腾一圈,最后留下的是真自己人。你骨子里忠义,时上的比肩是你晚年的底气。')
        } else {
          r.push('时柱有劫财根--晚年身边还有利益关系在,但你已经看淡了。')
        }
      }
    }
    
    // 同柱内部刑冲破害检测：同一层面内部有矛盾
    // 不同柱位的比劫不在同一场域,不直接竞争,所以不跨柱比较
    // 只看同一柱的天干和地支内部有无刑冲破害
    for (let i = 0; i < zhis.length; i++) {
      const z = zhis[i]
      const g = gans[i]
      const pos = ['年','月','日','时'][i]
      // 天干地支相冲（如甲午——甲午本柱）
      if (LIU_CHONG[z] === g || LIU_CHONG[g] === z) {
        if (pos === '年') {
          r.push('年柱天地相冲--国家层面的同路人内部有分裂。好比说你在体制内,但体制里两拨人不对付,你夹在中间不好做人。')
        } else if (pos === '月') {
          r.push('月柱天地相冲--社会层面的圈子内部有冲突。你的朋友圈里有人跟另一个人隔着什么过节,你夹在中间很为难。')
        }
      }
      // 地支自刑（如辰辰自刑）
      if (z === '辰' || z === '午' || z === '酉' || z === '亥') {
        if (pos === '年') {
          r.push('年支自刑--你祖上的事没那么简单,长辈之间有翻不过去的旧账。这个层面的东西不该你管,你也管不了。')
        }
      }
    }

    // 月柱藏干主气的帽子
    if (monthCang) {
      const monthHat = sst(riGan, monthCang)
      if (monthHat === '印') {
        r.push('你月柱这个圈子里--有人要面子,有人讲义气,没人真正帮你兜底。')
      } else if (monthHat === '财') {
        r.push('你月柱这个圈子里--现实得很,看你有用凑上来,你没用了就散。')
      } else if (monthHat === '官杀') {
        r.push('你月柱这个圈子里--嘴上厉害,真到风险时候靠不住。')
      } else if (monthHat === '食伤') {
        r.push('你月柱这个圈子里--手上有技术,愿意教你东西。但别跟他们谈钱的事。')
      } else {
        r.push('你月柱这个圈子--跟你一个德性,又帮你又跟你抢。')
      }
    }

    // 自合检测
    if (ZI_HE.includes(monthGan + monthZhi)) {
      r.push('月柱自合--特别自信甚至自负。这个圈子里有人不停夸自己,嘴上从来不输。')
    }

    // 地支五行属性推测职业
    if (monthZhi === '巳') r.push('月柱有网络/技术属性,这个圈子里大概率搞互联网、IT或新媒体。')
    if (monthZhi === '酉') r.push('月柱有金融/精密属性。这个圈子里可能在金融会计行业,或者做事特别较真。')
    if (monthZhi === '申') r.push('月柱有平台/法律属性。这个圈子里可能在大平台公司或者做法律相关。')
  }


  // ── 共根：年柱和月柱的关系 ──
  const yearKu = zhiKu(yearZhi)
  const monthKu = zhiKu(monthZhi)
  if (yearKu && monthKu && yearKu === monthKu) {
    r.push(`你年和月都出自${yearKu},你家世有根基。祖上和父母的能量你一脉相承,外人一看就知道你是哪家出来的。`)
  }

  // ── 天地一气判断（仅看年月） ──
  if (yearGan && monthGan) {
    const yk = BEST_YIN_KU[yearGan] || ''
    const mk = BEST_YIN_KU[monthGan] || ''
    if (yk && mk && yk === mk) {
      r.push(`年干月干同出${yk},天地一气。你这个人没有边界感,别人的事就是自己的事。讲义气是好事,但分不清"你的我的"早晚会吃亏。`)
    }
  }

  // ── 月柱不是比劫时的兜底提示 ──
  if (!isBJ(monthSS)) {
    const otherBJ = [0,2,3].filter(i => isBJ(ss(riGan, gans[i]))).length
    if (otherBJ > 0) {
      r.push('月柱不是比劫,你的朋友熟人更多在别的宫位。你自己的社交圈不算大,但有几个交心的就够了。')
    } else {
      r.push('你八字里比劫不多,朋友这块不是你的核心课题。你心里有自己的一小撮人,清清静静的,不需要为了合群去勉强自己。')
    }
  }

  return r
}

// ──── 深度夫妻相处分析 ══════════════════

function analyzeSpouseDynamic(riGan: string, pills: {gan:string;zhi:string}[], gender: string): string[] {
  const r: string[] = []
  const zhis = pills.map(p => p.zhi)
  const gans = pills.map(p => p.gan)
  const riZhi = zhis[2]
  const posNames = ['年','月','日','时']

  const mainCang = (CANG_GAN[riZhi] || [''])[0]
  const riZhiSt = sst(riGan, mainCang)

  if (riZhiSt === '印') {
    r.push(`你另一半的座驾是${riZhi},藏在里头的是印。你这位另一半有主见、爱管你、爱教育你。你们吵架最典型的场面就是:你刚开口说一件事,他/她就打断你开始给你上课。你得接受被"说教"的日常。`)
  } else if (riZhiSt === '财') {
    r.push(`你另一半的座驾是${riZhi},藏在里头的是财。你俩过日子很务实,钱的事说得很清楚。他/她管钱你也不操心。但吵架十有八九是因为钱--他/她觉得你花得不对,你觉得他/她抠。`)
  } else if (riZhiSt === '官杀') {
    r.push(`你另一半的座驾是${riZhi},藏在里头的是官杀。这人强势,要求高,对你期望值很大。你做好了是应该的,做不好直接说你。你跟他/她过日子容易有压力,总有被管着的感觉。`)
  } else if (riZhiSt === '食伤') {
    r.push(`你另一半的座驾是${riZhi},藏在里头的是食伤。这人爱自由、浪漫,不喜欢被管。你管得多了他/她会觉得喘不过气。你们相处得像朋友一样反而感情更好。`)
  } else if (riZhiSt === '比劫') {
    r.push(`你另一半的座驾是${riZhi},藏在里头的是比劫。你俩像兄弟一样相处,互相较劲又互相帮忙。但谁也不服谁,容易因为面子问题吵起来。`)
  }

  const spouseSeen = new Set<string>()
  for (const z of zhis) {
    if (z === riZhi) continue
    const co=evalChongOrder(riZhi,z,zhis[1],zhis)
    const key = (co ? 'chong' : '') + (LIU_HE[riZhi] === z ? 'he' : '') + (LIU_CHUAN[riZhi] === z ? 'chuan' : '')
    if (!key || spouseSeen.has(key + z)) continue
    spouseSeen.add(key + z)
    if (co) {
      r.push(`你的配偶宫被${co}了--你俩性格一开始就有冲突点。刚在一起的时候吵得厉害,慢慢学会了各退一步。这种关系不能强求对方改变,你得学会包容不同点。`)
    }
    if (LIU_HE[riZhi] === z) {
      r.push(`你的配偶宫${riZhi}被${z}合了--你们的感情不是纯粹的二人世界,总有外力介入。父母、朋友、工作关系,总有人掺合你们的事。你们的问题常常是"外人怎么看"而不是"我们怎么想"。`)
    }
    if (LIU_CHUAN[riZhi] === z) {
      r.push(`你的配偶宫${riZhi}被${z}穿了--有一种说不清的别扭。你觉得不是什么大不了的事,但你另一半心里一直扎着一根刺。这种矛盾最磨人--说出来好像小题大做,不说又一直在那。`)
    }
  }

  r.push('我再从你另一半的角度给你说说--')
  for (const z of zhis) {
    if (z === riZhi) continue
    if (LIU_CHUAN[riZhi] === z) {
      if ((riZhi === '子' && z === '未') || (riZhi === '未' && z === '子')) {
        r.push(`就说${riZhi}${z}穿这个细节:按你的角度看,你是为了孩子的事在管(子水为太极=管孩子)。但换成你另一半的视角,他/她觉得你在故意找事、让他/她下不来台。一个"管孩子"的事,你俩看到的是完全不同的画面。这就是夫妻矛盾的根源--同一件事,不同太极点,结论全反。`)
      }
    }
  }

  // 配偶宫借根判断：只取配偶宫主气藏干做一次分析，避免重复
  const spCang = CANG_GAN[riZhi] || []
  const mainCg = spCang[0]  // 只取主气
  if (mainCg) {
    const cgKu = BEST_YIN_KU[mainCg] || ''
    if (cgKu && zhis.includes(cgKu)) {
      r.push(`你配偶宫里的根正——你另一半跟你"共根"，同一个源头的。人品靠得住，不是那种来去匆匆的路人。你们相处起来轻松，骨子里是一路人。`)
    } else if (cgKu) {
      r.push(`你另一半是"借根"的命。他/她骨子里需要别人的认可、需要别人帮衬。你跟他/她多给面子多鼓励。他/她不是故意不靠谱，是先天缺乏安全感。`)
    }
  }

  if (gender === '女') {
    let fuGan = '', fuPos = -1
    for (let i = 0; i < gans.length; i++) {
      const st = ss(riGan, gans[i])
      if (isGuan(st)) { fuGan = gans[i]; fuPos = i; break }
    }
    if (fuGan) {
      const ht: Record<string, string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
      for (const g of gans) {
        if (g === fuGan) continue
        if (ht[fuGan+g] || ht[g+fuGan]) {
          r.push(`你的夫星${fuGan}被${g}合走了——你老公的注意力不完全在你身上。可能有工作上的事、朋友的事占了很大部分。他不是不爱你,是他心里有事没说。`)
          break
        }
      }
      if (fuPos === 2) {
        r.push('夫星坐在你自己的家里——这个婚姻你说了算。你能管住他,他翻不出你的手心。但别管太死,男人要面子。')
      } else if (fuPos < 2) {
        r.push('夫星在外面（年月）——你老公有他自己的世界。工作圈、朋友圈,你有的时候觉得跟他隔了一层。这种婚姻要给空间,别追着查岗。')
      }
    }
    const riZhiSt = sst(riGan, (CANG_GAN[riZhi] || [''])[0])
    if (riZhiSt === '官杀') {
      let nengZhi = false
      const ke: Record<string, string[]> = {
        '子':['午','巳'],'丑':['午','巳','未'],'寅':['申','酉'],
        '卯':['酉','申'],'辰':['戌','未'],'巳':['申','亥'],
        '午':['子','亥'],'未':['子','亥'],'申':['寅','卯'],
        '酉':['卯','寅'],'戌':['辰','丑'],'亥':['巳','午']
      }
      for (const z of zhis) { if (z !== riZhi && (ke[riZhi]||[]).includes(z)) { nengZhi = true; break } }
      if (nengZhi) {
        r.push(`你坐下的${riZhi}（官杀）能管住外面的字——你是能管人的女人。婚姻里你说了算的多,你老公在你的世界里转悠。你是女强人型的感情模式。`)
      } else {
        r.push(`你坐下的${riZhi}（官杀）管不住外面——你在婚姻里容易被动。你老公对你的影响大于你对他的影响。`)
      }
    }
  } else {
    let qiGan = '', qiPos = -1
    for (let i = 0; i < gans.length; i++) {
      const st = ss(riGan, gans[i])
      if (isCai(st)) { qiGan = gans[i]; qiPos = i; break }
    }
    if (qiGan) {
      if (qiPos === 2) {
        r.push('妻星坐在你自己的家里——老婆的钱归你管,家里的事你说了算。但也意味着老婆的钱也是你的钱,她的问题也是你的问题。')
      } else if (qiPos < 2) {
        r.push('妻星在外面——老婆有自己赚钱的渠道。你们各自经济独立,但花钱的事得商量着来。')
      }
    }
  }

  const spouseFightSeen = new Set<string>()
  for (const z of zhis) {
    if (z === riZhi) continue
    for (const cg of spCang) {
      const cgWx = wx(cg)
      const zWx = zhiWx(z)
      const ke: Record<string, string> = {木:'金',火:'水',土:'木',金:'火',水:'土'}
      const fightKey = z + cg
      if (ke[cgWx] === zWx && !spouseFightSeen.has(fightKey)) {
        spouseFightSeen.add(fightKey)
        r.push(`你们吵架的模式是:你另一半(${cg}属性)做了决定或说了什么,然后被${z}(${zWx})这边给否了。他/她会觉得"你总是跟我对着干"。其实不是针对他/她,是你们看问题的角度本来就不一样。`)
      }
    }
  }

  return r
}

// ──── 深度子女关系分析 ══════════════════

function analyzeChildrenRelation(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riZhi = zhis[2]
  const hg = gans[3]
  const hz = zhis[3]
  const hs = ss(riGan, hg)

  if (isYin(hs)) {
    r.push('你的子女宫坐印--你对孩子上学的事情很上心。管得多、问得多,恨不得替他/她规划好每一步。但你得注意,管得太细孩子会烦你。')
  } else if (isCai(hs)) {
    r.push('你的子女宫坐财--你舍得给孩子花钱,要啥给啥。但你要小心别变成溺爱。给钱大方是好事,但别让孩子觉得什么都来得太容易。')
  } else if (isGuan(hs)) {
    r.push('你的子女宫坐官杀--你对孩子要求严格,规矩多。你心里是为他/她好,但孩子不一定领情。你要学会什么时候该松一松。')
  } else if (isSS(hs)) {
    r.push('你的子女宫坐食伤--你跟孩子处得像朋友。你愿意听他/她说话,尊重他/她的想法。这种教育方式好,孩子跟你亲近,但也容易没大没小。')
  } else if (isBJ(hs)) {
    r.push('你的子女宫坐比劫--你跟孩子像兄弟/姐妹一样相处。一起玩一起闹,但也有互相较劲的时候。孩子会觉得你是他/她的玩伴而不是家长。')
  }

  if ((riZhi === '子' && hz === '未') || (riZhi === '未' && hz === '子')) {
    r.push(`你管孩子管教育,但从孩子的角度,他觉得你在干涉他。你好心管他,他觉得你烦。`)
  }

  const rk = zhiKu(riZhi)
  const hk = zhiKu(hz)
  if (rk && hk && rk === hk) {
    r.push(`跟孩子关系亲密,你会以身作则。你说的道理自己先做到,孩子也服你。`)
  } else {
    r.push(`多少有点代沟。你理解不了现在的孩子在想什么,孩子也嫌你老土。沟通上要多花心思。`)
  }

  const hMainCang = (CANG_GAN[hz] || [''])[0]
  const hSt = sst(riGan, hMainCang)
  if (hSt === '比劫') {
    r.push(`孩子宫坐比劫--孩子跟你像兄弟一样。他/她想要的是"跟你站在一起"的感觉,而不是被你管着。`)
  } else if (hSt === '印') {
    r.push(`孩子宫坐印--孩子爱学习爱琢磨,你们可以互相讨论问题。他/她喜欢跟你交流想法,这种亲子关系很健康。`)
  } else if (hSt === '财') {
    r.push(`孩子宫坐财--孩子从小就对自己拥有的东西很在意。他/她会管自己的零花钱、管自己的东西。你在这方面不用太操心。`)
  }

  const childSeen = new Set<string>()
  for (const cg of (CANG_GAN[hz] || [])) {
    const cgWx = wx(cg)
    for (const z of zhis) {
      if (z === hz) continue
      const zWx = zhiWx(z)
      const ke: Record<string, string> = {木:'金',火:'水',土:'木',金:'火',水:'土'}
      const childKey = cg + z
      if (ke[cgWx] === zWx && !childSeen.has(childKey)) {
        childSeen.add(childKey)
        r.push(`你子女宫里的${cg}被${z}冲到了--孩子在外面闯荡的时候可能不太省心。跟同学同事的关系、在外面的事情,你得留心点。`)
      }
    }
  }

  return r
}

// ──── 技术能力深度评估 ═══════════════════

function analyzeTechAbility(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riWx = wx(riGan)

  const ssInfo: {gan:string; zhi:string; pos:number}[] = []
  for (let i = 0; i < gans.length; i++) {
    const st = ss(riGan, gans[i])
    if (isSS(st)) ssInfo.push({gan: gans[i], zhi: zhis[i], pos: i})
  }
  for (let i = 0; i < zhis.length; i++) {
    for (const cg of (CANG_GAN[zhis[i]] || [])) {
      if (isSS(ss(riGan, cg))) {
        ssInfo.push({gan: cg, zhi: zhis[i], pos: i})
      }
    }
  }

  if (ssInfo.length === 0) {
    r.push('你的八字里没有明显的食伤。技术不是你的核心赛道,你不靠手艺吃饭。你更适合靠资源、关系或者管理来发展。')
    return r
  }

  // 食伤库判断：只对主气食伤做一次
  if (ssInfo.length > 0) {
    const ssGan = ssInfo[0].gan
    const cgKu = BEST_YIN_KU[ssGan] || ''
    if (cgKu) {
      if (zhis.includes(cgKu)) {
        let yinCount = 0, bjCount = 0
        for (const g of gans) {
          const st = ss(riGan, g)
          if (isYin(st)) yinCount++
          if (isBJ(st)) bjCount++
        }
        if (yinCount > bjCount) {
          r.push(`你的食伤有库支撑,你的技术有底蕴,是真正学进去的东西,不是花架子。`)
        } else {
          r.push(`你的食伤偏比劫库,你的技术偏表面功夫,够用但不深入。要成为专家还得再磨一磨。`)
        }
      } else {
        r.push(`你的技术悟性不错,但缺少系统沉淀。你学东西很快,但深度不够。`)
      }
    }
  }

  const monthZhi = zhis[1]
  const monthWx = zhiWx(monthZhi)
  const riWxVal = riWx
  const ssWx: Record<string, string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const ssWxVal = ssWx[riWxVal] || ''
  const sheng: Record<string, string[]> = {木:['火'],火:['土'],土:['金'],金:['水'],水:['木']}
  if (ssWxVal && (sheng[monthWx]||[]).includes(ssWxVal)) {
    r.push(`你对技术有追求,精益求精,容不得马虎。这个月对你有利,手艺上会有提升。`)
  } else if (ssWxVal) {
    r.push(`你的技术平平,够用但不算拔尖。要多花时间在专业上磨练。`)
  }

  // 食伤被合/被冲判断：只在主气食伤上做一次，避免重复
  const ht: Record<string, string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
  const mainSSZhi = new Set<string>()
  let ssFoundHe = false, ssFoundChong = false
  for (const si of ssInfo) {
    if (ssFoundHe && ssFoundChong) break
    if (mainSSZhi.has(si.zhi)) continue
    mainSSZhi.add(si.zhi)
    for (const g of gans) {
      if (g === si.gan) continue
      if (ht[si.gan + g] || ht[g + si.gan]) {
        r.push(`你的食伤被${g}合走了--你有技术但发挥不出来。不是能力不行,是时机不对或者被其他事情牵制住了。`)
        ssFoundHe = true
        break
      }
    }
    for (const z of zhis) {
      if (z === si.zhi) continue
      if (evalChongCan(z, si.zhi, zhis[1], zhis)) {
        r.push(`技术这条路不太平,你要经历磨练才能出彩。遇到的挫折都是在帮你磨刀。`)
        ssFoundChong = true
        break
      }
    }
  }

  let hasCai = false, hasGuan = false
  for (const g of gans) {
    const st = ss(riGan, g)
    if (isCai(st)) hasCai = true
    if (isGuan(st)) hasGuan = true
  }
  if (hasCai) {
    r.push('你八字里有食伤也有财--你的技术能变现。你的手艺能换成钱,路子对了收入不低。')
  }
  if (hasGuan) {
    r.push('你八字里有食伤也有官杀--你靠技术拿地位。你在公司或圈子里是靠专业能力说话的。')
  }

  if (zhis.includes('巳') || gans.includes('丙') || gans.includes('丁')) {
    r.push('你的八字里有巳火或者丙丁火--你跟互联网、网络技术有缘分。你的技术方向可能跟数字化、网络相关。')
  }

  return r
}

// ──── 赚钱心态深度分析 ════════════════════

function analyzeMoneyMindset(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const posNames = ['年','月','日','时']

  let caiFound = false
  let caiPos = -1
  let caiGan = ''
  for (let i = 0; i < gans.length; i++) {
    const st = ss(riGan, gans[i])
    if (isCai(st)) {
      caiFound = true; caiPos = i; caiGan = gans[i]; break
    }
  }
  if (!caiFound) {
    for (let i = 0; i < zhis.length; i++) {
      for (const cg of (CANG_GAN[zhis[i]] || [])) {
        if (isCai(ss(riGan, cg))) {
          caiFound = true; caiPos = i; caiGan = cg; break
        }
      }
      if (caiFound) break
    }
  }

  if (caiFound && caiPos >= 0) {
    if (caiPos === 0) {
      r.push('你这人花钱大气,不抠门。在钱的事上讲排面、讲体面。小时候家里对你也不抠,所以你养成了大方的习惯。')
    } else if (caiPos === 1) {
      r.push('你花钱会算性价比。不是小气,是心里有一本账。同样的东西你能找到最划算的买法,别人说你抠,但你知道自己是为了把钱花在刀刃上。')
    } else if (caiPos === 2) {
      r.push('你会攒钱。钱到手里就不想花,存着才有安全感。你对自己的要求是"手里有钱心里不慌"。')
    } else if (caiPos === 3) {
      r.push('你的财运在晚年,越往后越有钱。现在的你可能不觉得,但到老了你会发现钱不是问题。你对钱的态度是"该有的都会有"。')
    }
  }

  const ht: Record<string, string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
  if (caiFound && caiGan) {
    for (const g of gans) {
      if (g === caiGan) continue
      if (ht[g + caiGan] || ht[caiGan + g]) {
        r.push(`你的财星${caiGan}被${g}合了--你想赚轻松钱、快钱。别人说有个好项目来钱快,你就容易上头。你这种心态特别容易被忽悠,合伙做生意要格外小心,合财的人必须自己亲自盯着。`)
      }
    }
  }

  const wc: Record<string,number> = {木:0,火:0,土:0,金:0,水:0}
  for (const v of gans) wc[wx(v)]++
  for (const v of zhis) wc[ZHI_WU_XING[v]]++
  const sorted = Object.entries(wc).sort((a,b)=>a[1]-b[1])
  const weakest = sorted[0]
  if (weakest) {
    const caiWx: Record<string, string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
    const riWxVal = wx(riGan)
    const caiWxVal = caiWx[riWxVal] || ''
    if (weakest[0] === caiWxVal && weakest[1] <= 1) {
      r.push(`你的八字里${caiWxVal}最弱,恰好是你的财星五行--这叫"弱财"。轻则存不住钱、财来财去;重则容易负债。你也别太焦虑,有时候身体出了小毛病帮你挡了财上的灾,反而是好事。`)
    }
  }

  if (caiFound) {
    r.push('你八字里财星是透出来的--你对钱这件事在道上,知道自己该赚什么钱、不该赚什么钱。能掌控自己的财务状况。')
  } else {
    r.push('你八字里没有透出财星--财来财去留不住。你赚钱靠运气,花钱靠心情。建议你有钱先买固定资产或存定期,别放手里,放手里就会花掉。')
  }

  let bjCount = 0
  for (const g of gans) {
    if (isBJ(ss(riGan, g))) bjCount++
  }
  if (bjCount >= 2) {
    let allSameVault = true
    let firstVault = ''
    for (const g of gans) {
      const k = BEST_YIN_KU[g] || ''
      if (!firstVault) firstVault = k
      else if (k !== firstVault) { allSameVault = false; break }
    }
    if (allSameVault && firstVault) {
      r.push(`你跟兄弟一起赚钱,分钱的时候大家心里有数。但你心里会觉得"他跟我想的一样",太不设防了。`)
    } else {
      r.push('你比劫多而且不是同库--这就有风险了。兄弟朋友借钱、合伙、担保这些事你最好别碰。就算关系再好,钱的事一掺合就容易出问题。')
    }
  }

  for (const z of zhis) {
    const idx = zhis.indexOf(z)
    if (ZI_HE.includes(gans[idx] + z)) {
      const st = sst(riGan, gans[idx])
      if (st === '财') {
        r.push(`你的${posNames[idx]}柱${gans[idx]}${z}是自合财--你对钱的结果要求特别高。赚不到钱你就焦虑、急功近利。这种心态让你很努力,但也让你活得很累。要学会享受过程,别只看结果。`)
      }
    }
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  官运层次判定
// ════════════════════════════════════════════════════════════

function analyzeCareerLevel(
  riGan: string, pills: {gan:string;zhi:string}[], gender: string
): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const posNames = ['年','月','日','时']
  const riZhi = zhis[2]

  // [0] 正制 vs 反制 (第7轮:正制=轻松,反制=艰难)
  // 正制: 我克他(日主克/制),反制: 他被我克/但对方力量更大
  const riWx = wx(riGan)
  const ke: Record<string, string[]> = {木:['土'],火:['金'],土:['水'],金:['木'],水:['火']}
  const keBy: Record<string, string[]> = {木:['金'],火:['水'],土:['木'],金:['火'],水:['土']}
  let isZhengZhi = true
  for (const z of zhis.slice(1,3)) {  // 月令+日支
    const zWx = zhiWx(z)
    for (const cg of (CANG_GAN[z] || [])) {
      const cgWx = wx(cg)
      // 如果日主五行克对方(正制) vs 对方克日主(反制)
      if ((ke[riWx]||[]).includes(cgWx)) { /* 正制 - 没问题 */ }
      else if ((keBy[riWx]||[]).includes(cgWx)) {
        isZhengZhi = false
      }
    }
  }
  if (isZhengZhi) {
    r.push('正制结构--你的八字是你去制别人。你这个人做事比较顺,因为你主动出击,别人被动接招。')
  } else {
    r.push('反制结构--你的八字是别人制你。你做事阻力大,经常被人管被人压。但反制的人韧性最强,熬出来了反而比正制的走得远。')
  }

  // [1] 年上十神 = 背景
  const yearSS = sst(riGan, gans[0])
  if (yearSS === '官杀') r.push('家里有做官的路子--这是吃公家饭的底子。')
  else if (yearSS === '印') r.push('家里有文化底蕴、有体面人--社会资源不愁。')
  else if (yearSS === '比劫') r.push('家里有能人--亲戚朋友中有人混得不错。')
  else if (yearSS === '财') r.push('家里经济条件不错--从小不缺钱。')
  else if (yearSS === '食伤') r.push('家里有手艺传承--耳濡目染有技术底子。')

  // [2] 坐下官杀制别人 = 管理能力
  const riZhiMain = (CANG_GAN[riZhi] || [''])[0]
  const riZhiSt = sst(riGan, riZhiMain)
  let sitGuanNengLi = false
  if (riZhiSt === '官杀') {
    for (const z of zhis) {
      if (z === riZhi) continue
      const ke: Record<string, string[]> = {
        '子':['午','巳'],'丑':['午','巳','未'],'寅':['申','酉'],
        '卯':['酉','申'],'辰':['戌','未'],'巳':['申','亥'],
        '午':['子','亥'],'未':['子','亥'],'申':['寅','卯'],
        '酉':['卯','寅'],'戌':['辰','丑'],'亥':['巳','午']
      }
      if ((ke[riZhi]||[]).includes(z)) {
        r.push('坐下的力量能管住外面的人--有管人的底子。')
        sitGuanNengLi = true
        break
      }
    }
  }

  // [3] 宫位定级别
  let hasGuanOnYear = false, hasGuanOnMonth = false, hasGuanOnRi = false, hasGuanOnHour = false
  for (let i = 0; i < 4; i++) {
    const st = sst(riGan, gans[i])
    if (st === '官杀') {
      if (i === 0) hasGuanOnYear = true
      if (i === 1) hasGuanOnMonth = true
      if (i === 2) hasGuanOnRi = true
      if (i === 3) hasGuanOnHour = true
    }
  }

  if (hasGuanOnYear) {
    r.push('官星在年上--这是大领导的格局。省部级的命。不管现在到没到,底子在那里。')
  } else if (hasGuanOnMonth) {
    r.push('官星在月上--厅局级的底子。能在体制内做到不小的位置。')
  } else if (hasGuanOnRi && sitGuanNengLi) {
    r.push('官星坐日主且能管住外面--科局级是起步。处事水平到了,能带团队。')
  } else if (hasGuanOnRi && !sitGuanNengLi) {
    r.push('官星坐日主但管不住外面--有职务但不掌实权。副职或虚名的可能性大。')
  } else if (hasGuanOnHour) {
    r.push('官星在时柱--年龄越大官位越高。年轻时别急,是把长线。')
  } else {
    let hasGuanCang = false
    for (const z of zhis) {
      for (const cg of (CANG_GAN[z] || [])) {
        if (sst(riGan, cg) === '官杀') { hasGuanCang = true; break }
      }
    }
    if (hasGuanCang) {
      r.push('官星藏在支里--心里想当官,表面上不露。适合低调爬升,别太张扬。')
    } else {
      r.push('命局没有明显的官星--对当官没执念。自由发展、做生意、搞技术更自在。')
    }
  }

  // [4] 绳子牛结构
  if (riZhiSt === '官杀' || riZhiSt === '印') {
    r.push('坐下的力量是你的绳子--管人的能力是你最大的武器。')
  }
  if (riZhiSt === '财') {
    r.push('坐下的力量是你的牛--你这辈子围着钱转。钱是你的目标也是你的牵绊。')
  }
  if (riZhiSt === '食伤') {
    r.push('坐下的力量是你的绳子--技术能力是你最大的底气。')
  }

  // [5] 墓库开闭
  const kuList: string[] = []
  for (const z of zhis) {
    if (['辰','戌','丑','未'].includes(z)) {
      kuList.push(z)
    }
  }
  if (kuList.length >= 2) {
    r.push(`命局有${kuList.join('、')}两个库--这是大能量的格局。但库不开等于没有,能不能用要看大运流年怎么冲开。`)
  } else if (kuList.length === 1) {
    r.push(`命局有${kuList[0]}库--有资源但被收着。等大运引动的时候才发力。`)
  }

  // [6] 反局风险
  const ht: Record<string, string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
  let hasHe = false
  for (let i = 0; i < gans.length; i++) {
    for (let j = i + 1; j < gans.length; j++) {
      if (ht[gans[i] + gans[j]] || ht[gans[j] + gans[i]]) { hasHe = true; break }
    }
  }
  if (!hasHe) {
    r.push('天干无合--八字结构比较脆弱。最怕大运来合了命主,一旦合上就是反局,容易丢官出事。')
  }

  // [7] 比劫争官
  let bjCount = 0
  for (const g of gans) { if (isBJ(ss(riGan, g))) bjCount++ }
  if (bjCount >= 2 && hasGuanOnYear) {
    r.push('比劫多且官在年上--同事竞争激烈。你上面有人下面也有人盯着你。靠资历稳扎稳打,别走歪门邪道。')
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  墓库开闭分析(v6版:新增脆金+入墓好坏+辰万物之库)
// ════════════════════════════════════════════════════════════

function analyzeTombWarehouse(
  riGan: string, pills: {gan:string;zhi:string}[], gender: string
): string[] {
  const r: string[] = []
  const zhis = pills.map(p => p.zhi)
  const gans = pills.map(p => p.gan)

  const kus = ['辰','戌','丑','未']
  const kuInChart: string[] = []
  for (const z of zhis) { if (kus.includes(z)) kuInChart.push(z) }

  const kuMeaning: Record<string, string> = {
    '辰':'水库(藏着戊乙癸)--辰是万物之库,巳午寅卯亥子申丑未全部可以入辰库。主教育、包容万象。能量最大。',
    '戌':'火库(藏着戊辛丁)--主政府、互联网、房地产、光明。戌藏辛金可以脆金,能量大但偏燥。',
    '丑':'金库(藏着己癸辛)--主阴暗、部队、刀枪、黑社会。丑晦火力度极强,一个丑可晦六个巳。',
    '未':'木库(藏着己丁乙)--主医药、农作物、花草。未戌都是燥土,可以脆金。'
  }

  for (const ku of kuInChart) {
    if (kuMeaning[ku]) r.push(`八字有${ku}库--${kuMeaning[ku]}`)
  }

  // 脆金检测(v6新增:未戌燥土脆金=体力/高强度脑力劳动)
  if ((zhis.includes('未') || zhis.includes('戌')) && (gans.includes('庚') || gans.includes('辛') || zhis.includes('申') || zhis.includes('酉'))) {
    const hasXu = zhis.includes('戌'), hasWei = zhis.includes('未')
    const hasJin = gans.some(g=>['庚','辛'].includes(g)) || zhis.some(z=>['申','酉'].includes(z))
    if (hasJin) {
      r.push(`你的八字里有${hasXu?'戌':''}${hasWei?'未':''}燥土脆金--你的工作或生活有很强的"磨人"属性。不是体力上的累,是心累。这种累可能是高强度脑力劳动(程序开发、高精密设计),也可能是长期高压环境。金被脆得坚不坚,决定了你能不能扛住。`)
    }
  }

  // 开库检测
  let hasKuOpen = false
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      if (
        (zhis[i] === '辰' && zhis[j] === '戌') ||
        (zhis[i] === '戌' && zhis[j] === '辰') ||
        (zhis[i] === '丑' && zhis[j] === '未') ||
        (zhis[i] === '未' && zhis[j] === '丑')
      ) {
        hasKuOpen = true
        // v6: 库开≠好事——要看库里的东西好坏
        const ku = zhis[i] === '辰' || zhis[i] === '戌' ? zhis[i] : zhis[j]
        r.push(`${zhis[i]}${zhis[j]}冲--库门被冲开了。`)
      }
      const hasChou = zhis.includes('丑'), hasWei = zhis.includes('未'), hasXu = zhis.includes('戌')
      if (hasChou && hasWei && hasXu) {
        r.push('丑未戌三刑齐全--这是最强开库方式。库门大开,能量倍数释放。你的人生大起大落,但学到的东西也多。')
      }
    }
  }

  // v6: 库开了是好是坏?
  if (hasKuOpen) {
    // 看库里的藏干对应的是什么十神
    const kuInChartDetail: {zhi:string; cangs:string[]}[] = []
    for (const z of zhis) {
      if (['辰','戌','丑','未'].includes(z)) {
        kuInChartDetail.push({zhi: z, cangs: CANG_GAN[z] || []})
      }
    }
    let hasGood = false, hasBad = false
    for (const kd of kuInChartDetail) {
      for (const cg of kd.cangs) {
        const st = sst(riGan, cg)
        if (isCai(st) || st === '官杀') hasGood = true  // 财官开库=好事
        if (isBJ(st)) hasBad = true  // 比劫开库=抢
      }
    }
    if (hasBad && !hasGood) {
      r.push('但是打开的是比劫库--不太好。开的不是财官库,打开了一堆跟你争东西的人。大运流年遇到要注意:身边的人会来抢你的资源。')
    } else if (hasGood && hasBad) {
      r.push('库里有财官也有比劫--开库以后好坏参半。一边得到好处一边也要防着身边的人。你要做的是:快速拿钱锁仓,别让比劫抢了去。')
    }
  }

  // 闭库检测
  const heCloseMap: Record<string, string> = {'卯':'戌','戌':'卯','辰':'酉','酉':'辰','丑':'子','子':'丑','未':'午','午':'未','寅':'亥','亥':'寅','巳':'申','申':'巳'}
  for (const hz of zhis) {
    const target = heCloseMap[hz]
    if (target && zhis.includes(target) && ['辰','戌','丑','未'].includes(target)) {
      r.push(`${hz}合${target}--${target}库被合闭了。库门关着,里面的东西等于没有,要用得等到大运冲开。`)
    }
  }

  // 巳火变色龙检测
  if (zhis.includes('巳')) {
    const hasChou = zhis.includes('丑')
    const hasYou = zhis.includes('酉')
    const hasShen = zhis.includes('申')

    if (hasChou && hasYou) {
      r.push('巳酉丑三合--巳火跟酉丑一起变了金,不再当火用。本来是火性的一面被压制了,变成金的工具。你的性格里有些时候会突然变得特别实际、理性,跟平时的热情判若两人--这是巳火变色龙的特性。')
    } else if (hasShen) {
      const fireCount = gans.filter(g => wx(g) === '火').length + zhis.filter(z => zhiWx(z) === '火').length
      const metalCount = gans.filter(g => wx(g) === '金').length + zhis.filter(z => zhiWx(z) === '金').length
      if (fireCount > metalCount) {
        r.push('巳申合但火旺--巳火论刑不论合。巳火是主动方,穿申金。你的性格里热情的一面占上风,但你有时候也会突然翻脸、不讲情面。')
      } else if (metalCount > fireCount) {
        r.push('巳申合但金旺--巳火论合不论刑。巳火里面的庚金和申金亲密无间。你这个人表面热情,内心实际。外人觉得你很好说话,只有亲近的人知道你心里算得清。')
      } else {
        r.push('巳申--火金力量相当,合中带刑。你这个人又爱面子又现实,经常在感情和利益之间纠结。')
      }
    } else {
      r.push('巳火是变色龙--表面热情内心实际。你今天答应的事明天可能就变了主意。不是你不诚信,是你自己都搞不清自己想要什么。')
    }
  }

  // 丑晦火检测
  if (zhis.includes('丑') && zhis.some(z => ['巳','午'].includes(z))) {
    const hasSi = zhis.includes('巳'), hasWu = zhis.includes('午')
    const count = (hasSi ? 1 : 0) + (hasWu ? 1 : 0)
    r.push(`丑去晦${hasSi?'巳':''}${hasWu?'午':''}火--一个丑可以晦六个火。这${count}个火被丑土压着,你的热情和动力被现实压住了。有劲使不出来。`)
  }

  // 入墓检测(v6:分好坏)
  // <b>入墓规则(原材料逐字):</b>
  //   亥入辰墓,子不入辰墓(子辰半合)
  //   巳入戌墓,午不入戌墓(午戌半合)
  //   申入丑墓,酉不入丑墓(酉丑半合)
  //   寅入未墓,卯不入未墓(卯未半合)
  const ruMu: Record<string, {mu:string; notRu: string; note: string}> = {
    '亥': {mu:'辰', notRu:'子', note:'亥子水—亥入辰墓;子不入(子辰半合)'},
    '巳': {mu:'戌', notRu:'午', note:'巳午火—巳入戌墓;午不入(午戌半合)'},
    '申': {mu:'丑', notRu:'酉', note:'申酉金—申入丑墓;酉不入(酉丑半合)'},
    '寅': {mu:'未', notRu:'卯', note:'寅卯木—寅入未墓;卯不入(卯未半合)'},
  }

  // 查看日主地支是否入墓
  const riZhi = zhis[2]
  const ruMuSeen = new Set<string>()
  for (const [zhi, info] of Object.entries(ruMu)) {
    if (riZhi === zhi) {
      for (const mu of zhis) {
        const muKey = info.mu
        if (mu === info.mu && !ruMuSeen.has(muKey)) {
          ruMuSeen.add(muKey)
          if (info.mu === '辰' || info.mu === '未') {
            r.push(`你日支${riZhi}入${info.mu}墓--你的身体/精神有被"收藏"的特质。好事,因为你懂收敛、懂保存实力。但太过于"收"了也会压抑自己。大运走入库的时候要警惕过度保守。`)
          } else {
            r.push(`你日支${riZhi}入${info.mu}墓--你的身体/精神有被"压制"的特质。好的东西入库=你得到;但丑戌库比较阴,更多的是压力。大运走入库的时候,轻则压抑重则身体出问题。`)
          }
        }
      }
    }
  }

  if (r.length === 0) {
    r.push('命局没有明显的墓库--人生起伏不大,稳定型。不需要经历大苦大难就能过好自己的日子。')
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  新增v6: 制用结构评估(绳子与牛/制得干净/正制反制/通根连体)
//  基于盲派笔记第7-8章 + 西安分享附录1
// ════════════════════════════════════════════════════════════

function zhiYongEvaluate(
  riGan: string, gans: string[], zhis: string[], gender: string
): string[] {
  const r: string[] = []
  const riGZ = gans[2] + zhis[2]
  const riWx = wx(riGan)

  // [1] 通根连体日主检查
  if (TONG_GEN_LIAN_TI.includes(riGZ)) {
    r.push(`你是通根连体日主(${riGZ})--你的身体就是你的工具,你必须"制"住一样东西才有价值。你不是那种可以清闲的人,你的人生意义在于"搞定"什么--搞定事业、搞定团队、搞定一个系统。如果你什么都不制,你的才华就浪费了。`)

    // 对连体日主来说,最怕的是"被制"
    // 例如庚申日主:四周全是火来克,人生就容易出问题
    const keBy: Record<string, string[]> = {木:['金'],火:['水'],土:['木'],金:['火'],水:['土']}
    const riKeBy = keBy[riWx] || []
    let beiZhiCount = 0
    for (const z of zhis) {
      if (riKeBy.includes(zhiWx(z))) beiZhiCount++
    }
    for (const g of gans) {
      if (g !== gans[2] && riKeBy.includes(wx(g))) beiZhiCount++
    }
    if (beiZhiCount >= 4) {
      r.push(`警告:你是连体日主,但八字里克你的五行力量很强(--${beiZhiCount}次相遇)。你被别人/环境压制得很厉害。你不是没本事,是你缺少发力的条件。需要大运来救你。`)
    } else if (beiZhiCount >= 2) {
      r.push(`你的连体日主周围有克制力量(${beiZhiCount}次相遇)。你做事受阻,需要找到"绳子"去应对这些压力。`)
    } else {
      r.push(`你的连体日主没有被严重克制。你制别人的能力比反制你的力量大。你这种人适合当一把手,不适合给人打工。`)
    }
  }

  // [2] 制用结构类型分类
  // 五种类型: 比劫制财 / 官杀制比劫 / 伤食制官杀 / 印制食伤 / 财制印
  let structureType = ''
  let structureDesc = ''

  // 分析各十神的数量
  let bjCount = 0, caiCount = 0, guanCount = 0, ssCount = 0, yinCount = 0
  for (const g of gans) {
    const st = sst(riGan, g)
    if (st === '比劫') bjCount++
    if (st === '财') caiCount++
    if (st === '官杀') guanCount++
    if (st === '食伤') ssCount++
    if (st === '印') yinCount++
  }
  for (const z of zhis) {
    for (const cg of (CANG_GAN[z] || [])) {
      const st = sst(riGan, cg)
      if (st === '比劫') bjCount += 0.3
      if (st === '财') caiCount += 0.3
      if (st === '官杀') guanCount += 0.3
      if (st === '食伤') ssCount += 0.3
      if (st === '印') yinCount += 0.3
    }
  }

  // 判断结构类型 (基于原材料第7章案例)
  // 比劫制财: 比劫≥2 + 财≥1,且比劫能制住财
  if (bjCount >= 2 && caiCount >= 1 && bjCount > caiCount) {
    structureType = '比劫制财'
    structureDesc = '你的八字是"比劫制财"结构--你赚钱的方式不是单打独斗,是带团队、拉帮结派。你得有人,一个人赚不到钱。你的绳子是"人"(兄弟、团队),牛是"钱"。但你也要小心,比劫制财的格局里,分钱永远是个难题。'
  }
  // 官杀制比劫: 官杀≥2 + 比劫≥1
  else if (guanCount >= 2 && bjCount >= 1 && guanCount > bjCount) {
    structureType = '官杀制比劫'
    structureDesc = '你的八字是"官杀制比劫"结构--你是靠权威和规矩管人的命。你的绳子是"规矩和职位",牛是"团队和秩序"。你适合做管理,能在体制内或者大公司发展。你的优势在于能镇住场子。'
  }
  // 伤食制官杀: 食伤≥2 + 官杀≥1
  else if (ssCount >= 2 && guanCount >= 1 && ssCount > guanCount) {
    structureType = '伤食制官杀'
    structureDesc = '你的八字是"伤食制官杀"结构--你是靠技术和专业能力吃饭的。你的绳子是"技术/才华",牛是"地位/职位"。你不是那种阿谀奉承的人,你靠真本事说话。越是在靠专业说话的地方,你越有价值。'
  }
  // 财制印: 财≥2 + 印≥1
  else if (caiCount >= 2 && yinCount >= 1 && caiCount > yinCount) {
    structureType = '财制印'
    structureDesc = '你的八字是"财制印"结构--你是做生意、搞经营的命。你的绳子是"钱/资源",牛是"品牌/平台"。你是现实驱动型,一切以收益为准。不适合做纯粹的学术或公益。'
  }
  // 印制食伤: 印≥2 + 食伤≥1
  else if (yinCount >= 2 && ssCount >= 1 && yinCount > ssCount) {
    structureType = '印制食伤'
    structureDesc = '你的八字是"印制食伤"结构--你是靠学习和积累取胜的人。你的绳子是"知识/阅历",牛是"创意/表达"。你不轻易出手,一出手就是成熟的方案。你适合做顾问、教育、智库类工作。'
  }

  if (structureType) {
    r.push(structureDesc)
  }

  // [3] 制得干净 vs 不干净
  // 制得干净=绳子一党非常纯粹,没有杂质
  // 判断方法:看天干是否出自同一个库,且十神方向一致
  let allSame = true
  let firstKu = ''
  for (const g of gans) {
    const k = BEST_YIN_KU[g] || ''
    if (!firstKu) firstKu = k
    else if (k !== firstKu) { allSame = false; break }
  }

  if (allSame && firstKu) {
    r.push(`你的八字天干全出${firstKu}库--这叫"制得干净"。你的格局大,因为你的能量聚焦不分散。你做事专注、目标明确,这辈子不走弯路。但也要注意,太干净了也意味着太轴,一条路走到黑,不会变通。`)

    // 大格局案例参考
    const cleanMap: Record<string, string> = {
      '辰':'辰库出：戊辰戊午戊戌癸亥(实业家)级别',
      '戌':'戌库出：庚辰乙酉癸卯庚申(央行行长)级别的潜力',
      '丑':'丑库出：丙午巳申癸丑壬辰(总统)级别的潜力',
      '未':'未库出：己未癸酉丁巳丁未(大官)级别的潜力'
    }
    if (cleanMap[firstKu]) {
      r.push(`参考:你这种干净结构,有${cleanMap[firstKu]}`)
    }
  } else {
    r.push(`你的八字天干出库不一--"制得不纯"。你的人生分散,想做的事情太多。什么都想做但什么都不精。你要做的是减法:选一件事坚持下去,不要所有赛道都占着。`)
  }

  // [4] 坐下官杀是否作为制
  const riZhi = zhis[2]
  const riZhiMain = (CANG_GAN[riZhi] || [''])[0]
  const riZhiSt = sst(riGan, riZhiMain)
  if (riZhiSt === '官杀') {
    // 看坐下的官杀能不能制到别人
    const ke: Record<string, string[]> = {
      '子':['午','巳'],'丑':['午','巳','未'],'寅':['申','酉'],
      '卯':['酉','申'],'辰':['戌','未'],'巳':['申','亥'],
      '午':['子','亥'],'未':['子','亥'],'申':['寅','卯'],
      '酉':['卯','寅'],'戌':['辰','丑'],'亥':['巳','午']
    }
    let nengZhi = false
    for (const z of zhis) {
      if (z !== riZhi && (ke[riZhi]||[]).includes(z)) { nengZhi = true; break }
    }
    if (nengZhi) {
      r.push(`你坐下的${riZhi}(官杀)制住了别人--你不会被欺负。你有管理天赋,别人不服你不行。但被管的那些人会觉得你太严了。`)
    } else {
      r.push(`你坐下的${riZhi}(官杀)没有制住别人--你的原则和规矩虽然在,但执行不了。要么你心太软,要么条件不允许你管人。你不是不能管,是缺少施展的舞台。`)
    }
  }

  if (r.length === 0) {
    r.push('你的八字制用结构不太明显。你的人生不需要特定的"工具和猎物",随遇而安,来什么接什么。')
  }

  return r
}

function wangDian(ss: string): string {
  const m: Record<string,string> = {
    '印':'你这辈子追的是归属感和内心安定。',
    '财':'你这辈子追的是钱。做什么都用"能不能赚钱"衡量。',
    '官杀':'你这辈子追的是事业。要地位要名声。',
    '食伤':'你这辈子追的是自由。要开心不委屈。',
    '比劫':'你这辈子离不开朋友,做事要有人陪。'
  }
  for (const [k,v] of Object.entries(m)) { if (ss.includes(k)) return v }
  return ''
}

// ════════════════════════════════════════════════════════════
//  控制权排序体系(生>根>库>合>刑冲破害>制)
// ════════════════════════════════════════════════════════════

function controlPowerAnalysis(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riZhi = zhis[2]
  const riWx = wx(riGan)
  const riMain = (CANG_GAN[riZhi] || [''])[0]
  const riSt = sst(riGan, riMain)
  const posNames = ['年','月','日','时']

  let maxPower = -1
  let powerLabel = ''

  const shengMap: Record<string, string[]> = {木:['火'],火:['土'],土:['金'],金:['水'],水:['木']}
  const shengWx = shengMap[riWx] || []
  for (let i = 0; i < zhis.length; i++) {
    if (shengWx.includes(zhiWx(zhis[i]))) {
      const pos = posNames[i]
      if (i === 2) {
        r.push(`你${pos}地支${zhis[i]}生你(日主)—这是最稳的控制权。你的核心能力是自己长出来的,别人拿不走。你不需要靠关系、不需要求人,靠自己的本事就能吃饭。`)
        maxPower = 5
        powerLabel = '生'
      }
    }
  }

  if (maxPower < 5) {
    const roots = ROOT_MAP[riWx] || []
    for (let i = 0; i < zhis.length; i++) {
      if (roots.includes(zhis[i])) {
        const pos = posNames[i]
        if (i < 2) {
          r.push(`你的根在${pos}(${zhis[i]})—根在外面。你得在外面找存在感,社会关系是你的底气。自己在家里反而没有话语权。`)
        } else {
          r.push(`你的根在${pos}(${zhis[i]})—根在自己家。你不需要靠外面的人,自己主心骨在。但也要注意,根太强容易被自己的执念困住。`)
        }
        maxPower = 4
        powerLabel = '根'
        break
      }
    }
  }

  if (maxPower < 4) {
    const kuZhi = ['辰','戌','丑','未']
    for (const z of zhis.slice(2)) {
      if (kuZhi.includes(z)) {
        r.push(`你家里有${z}库—有家底有资源。但库不开等于没有,你得等大运或流年来冲开。你有底气,但底气=不用。`)
        maxPower = 3
        powerLabel = '库'
        break
      }
    }
  }

  if (maxPower < 3) {
    for (const z of zhis) {
      if (LIU_HE[riZhi] === z) {
        r.push(`你的配偶宫被${z}合—你的控制权要靠商量。你不适合独断,得跟人商量着来。一个人做决定容易翻车。`)
        maxPower = 2
        powerLabel = '合'
        break
      }
    }
  }

  if (maxPower < 2) {
    for (const z of zhis) {
      if (z === riZhi) continue
      const co=evalChongOrder(riZhi,z,zhis[1],zhis)
      if (co) {
        r.push(`你的配偶宫被${co}—你的控制权靠冲突和较劲获得。你不争没人给你,你争了也不一定稳。这辈子要学会在斗争中求生存。`)
        maxPower = 1
        powerLabel = '冲'
        break
      }
      if (LIU_CHUAN[riZhi] === z) {
        r.push(`你的配偶宫被${z}穿—你的控制权靠暗劲获得。你不声张但心里有数,用软钉子让人就范。周围的人觉得你温柔,但亲近的人知道你骨子硬。`)
        maxPower = 1
        powerLabel = '穿'
        break
      }
    }
  }

  if (maxPower < 1) {
    const keMap: Record<string, string[]> = {木:['金'],火:['水'],土:['木'],金:['火'],水:['土']}
    const riKeBy = keMap[riWx] || []
    for (let i = 0; i < zhis.length; i++) {
      if (riKeBy.includes(zhiWx(zhis[i]))) {
        const pos = posNames[i]
        r.push(`你被${pos}柱${zhis[i]}制住了—你在家里外面的位置都比较被动。不是你没能力,是你缺少发力的条件。建议你选一个稳定平台,别单干。`)
        maxPower = 0
        powerLabel = '制'
        break
      }
    }
  }

  if (powerLabel) {
    r.push(`控制权总评:你目前的控制模式靠"${powerLabel}"。${powerLabel === '生' ? '这是最高级别的控制,你的高度取决于你的专业深度。' : powerLabel === '根' ? '你的底盘靠社会关系,维护好人脉是你的核心任务。' : powerLabel === '库' ? '你有资源但不会用。冲开库比积累更重要。' : powerLabel === '合' ? '你一个人撑不起来,找到合适的合伙人比你一个人强十倍。' : powerLabel === '冲' ? '你的人生是在对抗中前进的。别怕冲突,怕的是逃避。' : powerLabel === '穿' ? '你适合做幕后操盘,别站在聚光灯下。' : '你现在不适合做决策者,先积累再谈做主。'}`)
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  日主特性分析
// ════════════════════════════════════════════════════════════

function dayMasterNature(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riGZ = gans[2] + zhis[2]

  if (riGZ === '己巳') {
    r.push('你是己巳日—巳火里的庚金是你的伤官,丙火是正印。表面温柔(己土)内心倔强(庚金藏干)。你有才华但容易想太多。你给人的第一印象温和好说话,但处久了别人会发现你骨子里有主意得很。你是典型的"外柔内刚"。巳火是变色龙,你有时候热情有时候冷淡,连你自己都搞不清自己想要什么。')
  } else if (riGZ === '己亥') {
    r.push('你是己亥日—亥水里的壬水是你的正财。你这一生跟钱有缘,但也为钱所累。你很务实,做事先看值不值。但你的八字缺火(印),意味着你缺少"包装"和"靠山"。你做事习惯靠自己,但有时候太实在了反而吃亏。你最需要的是一个能帮你"撑场子"的人。')
  }

  if (riGZ === '乙未') {
    r.push('你是乙未日—未是乙木的库,你能藏能收。你不是那种什么都往外说的人,心里有自己的算盘。未里藏着丁火(食神)、己土(偏财),你有手艺也有赚钱的路子,但都不显山露水。你适合做幕后操控的角色,不太适合站在前头当话事人。')
  } else if (riGZ === '乙卯') {
    r.push('你是乙卯日—乙木坐卯木,自坐禄。根在自己家,你这个人有自己的主见,不太容易被别人带偏。但坐禄也意味着"自我"太强,你会不自觉地用自己的标准去衡量别人。你要警惕的是:你觉得对的,不一定别人也觉得对。')
  }

  if (riGZ === '丁卯') {
    r.push('你是丁卯日—卯木生丁火,印在你脚下。你聪明、思维活跃、学东西快。但卯木也是偏印,偏印太重的人容易钻牛角尖。你最大的问题不是能力不够,是想得太多做得太少。你的执行力跟不上你的想法,这一点得注意。')
  } else if (riGZ === '丁亥') {
    r.push('你是丁亥日—亥水是丁火的官杀。你对自己要求高,有完美主义倾向。做事追求极致,但活得太累。亥水里的壬水是正官、甲木是正印,你其实适合吃公家饭或在大平台做事,太自由的环境反而让你没有安全感。')
  }

  if (riGZ === '甲子') {
    r.push('你是甲子日—子水是甲木的正印。你有才华、有文化底蕴。子水纯净,你做人比较纯粹,不是那种耍心眼的人。但你缺土(财)和火(食伤),在赚钱这件事上不够灵活。你适合做文化教育类的工作,不太适合经商。')
  } else if (riGZ === '甲戌') {
    r.push('你是甲戌日—戌土是甲木的偏财。你有生意头脑,但对钱的事很敏感。戌里的辛金是正官,你有管理才能。但同时戌也是火库,你内心有火一样的热情,但被戌土盖住了。你需要一个契机让内心的火燃起来。')
  }

  if (riGZ === '戊子') {
    r.push('你是戊子日—子水是戊土的偏财。你有赚钱的头脑,但财在配偶宫,你的财运跟伴侣有很大关系。另一半要么帮你赚钱,要么花钱让你头疼。你这个人表面稳重大气(戊土),内心其实也在算账(子水偏财)。')
  } else if (riGZ === '戊戌') {
    r.push('你是戊戌日—戊土坐戌土,自坐库。你有威望、有气场,适合当领导。戌为火库,你的内在有火一样的能量。但你最怕的是被未土冲—大运或流年遇到未,戌库打开,好事坏事一起来。你的人生大起大落是注定的。')
  }

  if (riGZ === '癸巳') {
    r.push('你是癸巳日—巳火是癸水的正财。巳是变色龙,你这个人表面冷静(癸水),内心热情(巳火)。你做事有计划,但不喜欢被约束。巳里的丙火是正财、庚金是正印,你是既有赚钱能力又有学习能力的人。但巳申合会让你的计划突然改变,你的人生充满"意外"。')
  }

  if (riGZ === '辛巳') {
    r.push('你是辛巳日—自合。巳火里的丙火是你的正官,你对自己有要求、追求体面。但辛巳自合,你太在意别人怎么看你,活的累。你表面云淡风轻,心里在意得很。巳火变色龙的特性让你有时候很热情,有时候冷得像冰。')
  }

  if (r.length === 0) {
    r.push(`你的日柱是${riGZ}—这个组合有自己的特点,但更重要的是看你整个八字四柱的配合,单看日柱只是参考。`)
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  企业视角分析
// ════════════════════════════════════════════════════════════

function enterpriseAnalysis(riGan: string, gans: string[], zhis: string[]): string[] {
  const r: string[] = []
  const posNames = ['年','月','日','时']
  const riWx = wx(riGan)

  const yearSS = sst(riGan, gans[0])
  if (yearSS === '印') {
    r.push('年上印—你的企业有文化底蕴。适合做教育、咨询、品牌类的生意。政策的支持主要在资质和背书方面。')
  } else if (yearSS === '财') {
    r.push('年上财—你生在经商的家庭或环境中。从小不缺钱但也缺精神层面的引导。你适合做贸易、金融、实体类的生意。')
  } else if (yearSS === '官杀') {
    r.push('年上官杀—你天生跟体制和政策打交道。做跟政府、大平台相关的项目是你的路子。政策的变化对你影响大,你要时刻关注大方向。')
  } else if (yearSS === '食伤') {
    r.push('年上食伤—你适合做技术驱动或创意驱动的企业。产品创新是你的核心竞争力,但管理不是你的长项。')
  } else if (yearSS === '比劫') {
    r.push('年上比劫—你的企业一开始靠团队和兄弟。合伙创业是你入行的方式,但分钱的事要提前说清楚。')
  }

  const monthSS = sst(riGan, gans[1])
  const monthZhi = zhis[1]
  if (monthSS === '财') {
    r.push(`你所在的市场是"钱驱动"的。在这个行业,谁有钱谁说了算。你的企业要围绕"赚钱"来设计产品。`)
  } else if (monthSS === '官杀') {
    r.push(`你所在的市场是"规则驱动"的。这个行业吃的是牌照、资质、关系。没有门槛你反而做不起来。`)
  } else if (monthSS === '印') {
    r.push(`你所在的市场是"品牌驱动"的。在这个行业,口碑和信任比钱重要。你的企业要舍得在品牌上投入。`)
  } else if (monthSS === '食伤') {
    r.push(`你所在的市场是"技术驱动"的。产品更新快,你得不断学习才能跟得上。`)
  } else if (monthSS === '比劫') {
    r.push(`你所在的市场竞争激烈。大家都在抢同一块蛋糕,你能不能活下来看你的差异化。`)
  }

  const riZhi = zhis[2]
  const riMain = (CANG_GAN[riZhi] || [''])[0]
  const riSt = sst(riGan, riMain)
  if (riSt === '印') {
    r.push('你自己当老板的模式是"总觉得自己是对的"。你喜欢定战略、定方向,但执行细节不是你操心的。你需要一个执行力强的合伙人。')
  } else if (riSt === '财') {
    r.push('你自己当老板的模式是"赚钱第一"。你做的每一个决定都在算帐。你的企业赚钱效率高,但留不住有情怀的人。')
  } else if (riSt === '官杀') {
    r.push('你自己当老板的模式是"规矩第一"。你管得严,下面的人怕你。企业发展稳定,但创新不足。你得学会适当放手。')
  } else if (riSt === '食伤') {
    r.push('你自己当老板的模式是"自由第一"。你不喜欢繁文缛节,团队氛围轻松。但你的公司在制度上容易出漏洞。')
  } else if (riSt === '比劫') {
    r.push('你自己当老板的模式是"兄弟第一"。你跟团队称兄道弟,关系好但权威不够。你说了算的时候没人听,出了事你背锅。')
  }

  const hourGan = gans[3]
  const hourZhi = zhis[3]
  const hourSS = sst(riGan, hourGan)
  if (hourSS === '印') {
    r.push(`你的员工偏文职,稳定但效率不高。适合做内勤和后台支持,不适合冲在一线。`)
  } else if (hourSS === '财') {
    r.push(`你的员工业绩导向,执行力强。但他们对钱敏感,钱不到位就走人。你的企业要建立好激励机制。`)
  } else if (hourSS === '官杀') {
    r.push(`你的员工有纪律性,但流动性也大。对管理层的要求高,管不好容易出问题。`)
  } else if (hourSS === '食伤') {
    r.push(`你的员工有创意有想法,但不好管。他们需要自由发挥的空间,管太死就跑了。适合创意型公司。`)
  } else if (hourSS === '比劫') {
    r.push(`你的员工跟你是"兄弟"关系。好的一面是忠诚敢拼,坏的一面是没有规矩,容易抱团。`)
  }

  const hourGanWx = wx(hourGan)
  const riSheng: Record<string, string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const productWx = riSheng[riWx] || ''
  if (wx(hourGan) === productWx) {
    r.push('你的时干和食伤五行一致—你的产品方向是对的,你的产出跟市场需求匹配。不用大改方向,继续优化就行。')
  } else {
    r.push(`你的时干是${hourGan}(${wx(hourGan)}),而你生的五行是${productWx}—你的产品方向和市场需求的匹配度不高。建议你看看市场上什么赚钱,别光凭自己的喜好做产品。`)
  }

  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const co=evalChongOrder(zhis[i],zhis[j],zhis[1],zhis)
      if (co) {
        r.push(`${posNames[i]}柱${posNames[j]}柱之间存在${co}关系—企业内部的这两个部门/层级之间存在天然冲突。这不是管理能解决的,你需要从组织架构上分开他们。`)
      }
      if (LIU_CHUAN[zhis[i]] === zhis[j]) {
        r.push(`${posNames[i]}柱${zhis[i]}穿${posNames[j]}柱${zhis[j]}—企业里有些矛盾是"说不清道不明"的。两个人表面没事,私下里互相较劲。你作为老板要心里有数。`)
      }
    }
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  深度人性分析
// ════════════════════════════════════════════════════════════

function deepHumanInsight(riGan: string, pills: {gan:string;zhi:string}[], gender: string): string[] {
  const r: string[] = []
  const zhis = pills.map(p => p.zhi)
  const gans = pills.map(p => p.gan)
  const riZhi = zhis[2]
  const riWx = wx(riGan)

  // [0] 通根连体日主人性提示(v6新增)
  const riGZ = gans[2] + zhis[2]
  if (TONG_GEN_LIAN_TI.includes(riGZ)) {
    r.push(`你是通根连体日主(${riGZ})—你的人生观是"我有用就有价值"。你闲不下来,一闲着就心慌。你的存在感来自于"搞定事情":搞定一个项目、搞定一个团队、搞定一段关系。但你也要警惕——如果你搞不定自己,你会把自己逼得太紧。`)
  }

  // [1] 阳气火 vs 物质火
  const hasYang = zhis.some(z=>['午','戌'].includes(z)) || gans.some(g=>['丙','戊'].includes(g))
  const hasMaterial = zhis.some(z=>['卯','巳'].includes(z)) || gans.some(g=>['乙','丁'].includes(g))
  if (hasYang && hasMaterial) {
    r.push('你的八子里既有阳气又有物质—你不是纯粹的人。对外讲排场讲面子(阳气),私底下精打细算(物质)。"包装"对你来说是本能,不是故意造假。')
  } else if (hasYang && !hasMaterial) {
    r.push('你的八字偏阳气—你做人做事要名要脸。面子比里子重要,精神追求大于物质追求。')
  } else if (!hasYang && hasMaterial) {
    r.push('你的八字偏物质—你做人务实,看重实际利益。不会为了面子做傻事。但你有时候活得太"算",少了点人情味。')
  }

  // [2] 借根深度心理
  const roots = ROOT_MAP[riWx]||[]
  const homeRoots = zhis.slice(2).filter(z=>roots.includes(z))
  const outRoots = zhis.slice(0,2).filter(z=>roots.includes(z))
  if (homeRoots.length === 0 && outRoots.length > 0) {
    r.push('你是借根的人。借根的人有四个性格特点需要你警惕:第一、别人对你好你就加倍对他好,很容易被人情绑架;第二、你没主见,别人说什么你都觉得有道理,最容易被人洗脑;第三、你怕欠人情,别人帮你一次你就记一辈子,活得累;第四、你息事宁人,宁愿自己吃小亏也不愿跟人起冲突,结果吃亏吃大了才翻脸。')
  }

  // [3] 土塌影响性格
  const hasTu = zhis.some(z=>['辰','戌','丑','未'].includes(z))
  const hasShui = zhis.some(z=>['亥','子'].includes(z))
  const hasMu = zhis.some(z=>['寅','卯'].includes(z))
  if (hasTu && hasShui && hasMu) {
    const hasHomeMu = zhis.slice(2).some(z=>['寅','卯'].includes(z))
    if (hasHomeMu) {
      r.push('你的性格里有"稳定器"—外面越乱你越稳。你不怕问题,怕的是没问题。别人眼中的"危机"在你看来是机会。')
    }
  }

  // [4] 寅巳穿心理
  if (zhis.includes('寅') && zhis.includes('巳')) {
    r.push('你的八子有寅巳穿—寅木想拿巳火里的东西(金火土),巳火想拿寅木里的东西(木火)。表面客气实则互相利用。你在人际关系中常陷入"对方对我好但我总觉得哪里不对"的微妙状态。')
  }
  if (zhis.includes('丑') && zhis.includes('午')) {
    r.push('丑午穿—以爱的名义管制对方。你的感情模式里,管对方=爱对方。你越在乎一个人就越想管他,但你管他的方式让人窒息。')
  }
  if (zhis.includes('子') && zhis.includes('未')) {
    r.push('子未穿—你内心想证明自己(子水),但现实里总被什么压着(未土)。你活的纠结,想做大事又不敢放开做。')
  }

  // [5] 比劫的相处心理学
  let bjMonth = false
  for (const g of gans) { if (isBJ(ss(riGan, g))) { bjMonth = true; break } }
  if (bjMonth) {
    r.push('你的朋友圈里总有人找你倾诉倒苦水—因为比劫找你,食伤生了你。你是个好的倾听者,但也最容易变成别人的"情绪垃圾桶"。你帮别人分析得清,自己的事反而拎不清。')
  }

  // [6] 坐下字的决定权
  const riZhiMain = (CANG_GAN[riZhi] || [''])[0]
  const riZhiSt = sst(riGan, riZhiMain)
  if (riZhiSt === '财') {
    r.push('最让你焦虑的事跟钱有关。赚不到钱你就坐不住。你做决策的时候,脑子里默认在算"这划不划算"。')
  } else if (riZhiSt === '官杀') {
    r.push('最让你焦虑的事跟地位名声有关。别人怎么看你、你在这个圈子里有没有话语权,这些比钱更能左右你的情绪。')
  } else if (riZhiSt === '印') {
    r.push('最让你焦虑的事是"不被认可"。你希望别人觉得你有料、有层次。别人不承认你你就很难受。')
  } else if (riZhiSt === '食伤') {
    r.push('最让你焦虑的事是"不自由"。被管着、被安排、做不想做的事,你就会暴躁。你需要自己的空间。')
  } else if (riZhiSt === '比劫') {
    r.push('最让你焦虑的事是"被孤立"。你怕一个人的感觉,做事需要有人陪着。')
  }

  return r
}

/* ──── 四柱六亲宫位（星宫同参体系） ────────────── */

/**
 * 男命六亲星对照
 * 偏财=父 正印=母 比肩=兄弟 劫财=姐妹 正财=妻 七杀=子 正官=女
 */
function maleLqXing(ss: string): string {
  const map: Record<string,string> = {
    '偏财':'父亲','正印':'母亲','比肩':'兄弟','劫财':'姐妹/情敌',
    '正财':'原配妻子','七杀':'儿子','正官':'女儿','食神':'儿孙晚辈','伤官':'儿孙晚辈'
  }
  return map[ss] || ''
}
/**
 * 女命六亲星对照
 * 正财=父 偏印=母 比肩=姐妹 劫财=兄弟 正官=夫 七杀=情人/二婚 伤官=子 食神=女
 */
function femaleLqXing(ss: string): string {
  const map: Record<string,string> = {
    '正财':'父亲','偏印':'母亲','比肩':'姐妹/闺蜜','劫财':'兄弟/公公',
    '正官':'原配丈夫','七杀':'情人/偏缘/二婚','伤官':'儿子','食神':'女儿'
  }
  return map[ss] || ''
}
function lqName(shiShen: string, gen: string): string {
  return gen === '男' ? maleLqXing(shiShen) : femaleLqXing(shiShen)
}

function analyzeLiuQin(
  riGan: string,
  pills: {gan:string;zhi:string}[],
  gen: string,
  ss: (r:string,g:string)=>string
): { nianZhu:string[]; yueZhu:string[]; riZhi:string[]; shiZhu:string[]; xingGong:string[]; summary:string[] }
{
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riZhiDz = zhis[2]
  const nGan = gans[0], nZhi = zhis[0]
  const yGan = gans[1], yZhi = zhis[1]
  const sGan = gans[3], sZhi = zhis[3]
  const nSS = ss(riGan, nGan)
  const ySS = ss(riGan, yGan)
  const sSS = ss(riGan, sGan)
  const Pos = ['年','月','日','时'] as const
  const ncMap: Record<string,string[]> = {
    '子':['癸'],'丑':['己','癸','辛'],'寅':['甲','丙','戊'],
    '卯':['乙'],'辰':['戊','乙','癸'],'巳':['丙','庚','戊'],
    '午':['丁','己'],'未':['己','丁','乙'],'申':['庚','壬','戊'],
    '酉':['辛'],'戌':['戊','辛','丁'],'亥':['壬','甲']
  }
  const nianZhu: string[] = []
  const yueZhu: string[] = []
  const riZhiOut: string[] = []
  const shiZhu: string[] = []
  const xingGong: string[] = []
  const summary: string[] = []

  // 年柱：祖上宫（年干=祖父/外公/父亲/祖上男性，年支=祖母/外婆/母亲/祖上女性）
  nianZhu.push(`年柱【${nGan}${nZhi}】祖上宫、祖辈宫、早年原生宫（0-16岁童年根基）`)
  const nLq = lqName(nSS, gen)
  if (nLq) nianZhu.push(`年干 ${nGan} = ${nSS}（=${nLq}）——代表祖父/外公/父亲/祖上男性、祖业、早年环境`)
  else nianZhu.push(`年干 ${nGan} = ${nSS}`)
  nianZhu.push(`年支 ${nZhi} = 祖母/外婆/母亲/祖上女性、根基家底`)

  // 月柱：父母宫、兄弟宫、门户宫
  yueZhu.push(`月柱【${yGan}${yZhi}】父母宫·兄弟宫·门户宫（16-32岁原生家庭—青年求学、离家前家庭运）`) 
  yueZhu.push(`月干 ${yGan} = 父亲/兄长/家族男性/事业早期贵人`)
  yueZhu.push(`月支 ${yZhi} = 母亲/姐妹/同辈亲友/家庭内部关系`)
  const yLq = lqName(ySS, gen)
  if (yLq) {
    yueZhu.push(`月干 ${yGan} = ${ySS}（${yLq}）`)
    xingGong.push(`★ 月干 ${yGan}（${ySS}=${yLq}）在父母兄弟宫（门户）`)
  for (let i = 0; i < gans.length; i++) {
    const pSS = ss(riGan, gans[i])
    if (pSS === '比肩' || pSS === '劫财') {
      if (Pos[i] === '月') yueZhu.push(`★ 月干 ${gans[i]}是${pSS}——兄弟姐妹/同辈朋友透出在门户宫`)
    }
  }
  }

  // 日柱：自身宫+夫妻宫（日干=命主本人，日支=原配配偶/婚姻伴侣/内心知己）
  riZhiOut.push(`日柱【${riGan}${riZhiDz}】自身宫+夫妻宫（32-48岁—中年成家立业，一生运势重心）`)
  riZhiOut.push(`日干【${riGan}】= 你（命主本人），所有六亲以此为中心`)
  riZhiOut.push(`日支【${riZhiDz}】夫妻宫 = 原配配偶/伴侣/婚后家庭/内心知己`)
  riZhiOut.push(`日支逢冲刑合害则婚姻不顺、夫妻争吵、离异分居`)
  const riCang = ncMap[riZhiDz] || []
  if (riCang.length > 0) {
    const desc = riCang.map(c => `${c}（${ss(riGan, c)}）`).join('、')
    riZhiOut.push(`日支 ${riZhiDz} 藏干：${desc}`)
    for (const c of riCang) {
      const cSS = ss(riGan, c)
      const cLq = lqName(cSS, gen)
      if (cLq) {
        riZhiOut.push(`  藏干 ${c} = ${cSS}（配偶星=${cLq}）坐在夫妻宫——星入本宫，配偶缘厚。`)
        xingGong.push(`★ 日支 ${riZhiDz} 藏 ${c}（${cSS}=${cLq}）坐在夫妻宫——婚姻核心`)
      } else {
        riZhiOut.push(`  藏干 ${c} = ${cSS}，藏在夫妻宫构成配偶心性。`)
      }
    }
  }

  // 时柱：子女宫、晚辈宫、晚年归宿宫
  shiZhu.push(`时柱【${sGan}${sZhi}】子女宫·晚辈宫·晚年归宿宫（48岁后—晚年养老、子女陪伴）`)
  shiZhu.push(`时干 ${sGan} = 儿子/外孙/徒弟/晚辈男性/晚年事业`)
  shiZhu.push(`时支 ${sZhi} = 女儿/孙女/下属/晚辈女性/晚年居所/寿运`)
  const sLq = lqName(sSS, gen)
  if (sLq) {
    shiZhu.push(`时干 ${sGan} = ${sSS}（${sLq}）`)
    xingGong.push(`★ 时干 ${sGan}（${sSS}=${sLq}）在子女宫`)
  } else {
    shiZhu.push(`时干 ${sGan} = ${sSS}`)
  }

  // 总览
  summary.push('━━━ 四柱六亲宫位总览 ━━━')
  summary.push(`年柱 ${nGan}${nZhi} · 祖上宫——0-16岁 童年根基`)
  summary.push(`月柱 ${yGan}${yZhi} · 父母兄弟宫——16-32岁 原生家庭+同辈社交`)
  summary.push(`日柱 ${riGan}${riZhiDz} · 自身宫+夫妻宫——32-48岁 一生重心`)
  summary.push(`时柱 ${sGan}${sZhi} · 子女宫——48岁后 晚年归宿`)
  if (xingGong.length > 0) {
    summary.push('')
    summary.push('━━━ 星宫同参（六亲星位置） ━━━')
    summary.push(...xingGong)
  }
  return { nianZhu, yueZhu, riZhi: riZhiOut, shiZhu, xingGong, summary }
}


// ════════════════════════════════════════════════════════════
//  v8 P0-1: 关系链引擎(BFS多跳推理) 
//  R1:找桥梁——A→B无直接关系,找C
//  BFS搜索从日主到目标十神的最短路径,最大3步
// ════════════════════════════════════════════════════════════

function bfsRelationChain(riGan: string, pills: {gan:string;zhi:string}[], gender: string): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)

  // 构建关系邻接表：每个字能通过什么关系到达另一个字
  // 关系类型: 生(SHENG),克(KE),合(HE),冲(CHONG),穿(CHUAN),刑(XING),库(KU),同根(TG)
  interface Edge { target: string; relation: string; desc: string }
  const adj: Map<string, Edge[]> = new Map()

  function addEdge(from: string, to: string, rel: string, desc: string) {
    if (from === to) return
    if (!adj.has(from)) adj.set(from, [])
    adj.get(from)!.push({ target: to, relation: rel, desc })
  }

  const allChars = [...gans, ...zhis]
  const wxMap: Record<string, string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}
  const sheng: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const ke: Record<string,string> = {木:'土',土:'水',水:'火',火:'金',金:'木'}

  // 生关系
  for (const c of allChars) {
    const wxC = wxMap[c] || ''
    const shengTo = sheng[wxC]
    const keTo = ke[wxC]
    for (const d of allChars) {
      if (c === d) continue
      const wxD = wxMap[d] || ''
      if (wxD === shengTo) addEdge(c, d, '生', `${c}(${wxC})生${d}(${wxD})—你生他`)
      if (wxD === keTo) addEdge(c, d, '克', `${c}(${wxC})克${d}(${wxD})—你制他`)
    }
  }

  // 合冲穿刑
  for (const c of allChars) {
    for (const d of allChars) {
      if (c === d) continue
      if (!'子丑寅卯辰巳午未申酉戌亥'.includes(c) || !'子丑寅卯辰巳午未申酉戌亥'.includes(d)) continue
      if (LIU_HE[c] === d) addEdge(c, d, '合', `${c}合${d}—亲密关系`)
      if (LIU_CHONG[c] === d) addEdge(c, d, '冲', `${c}冲${d}—对抗关系`)
      if (LIU_CHUAN[c] === d) addEdge(c, d, '穿', `${c}穿${d}—暗斗关系`)
      if (SAN_XING[c] === d) addEdge(c, d, '刑', `${c}刑${d}—较劲关系`)
    }
  }

  // 库关系：某字入某库
  const ruKu: Record<string,string[]> = {亥:['辰'],巳:['戌'],申:['丑'],寅:['未'],辰:['辰'],戌:['戌'],丑:['丑'],未:['未']}
  for (const c of allChars) {
    const kuTargets = ruKu[c] || []
    for (const d of allChars) {
      if (kuTargets.includes(d)) addEdge(c, d, '入库', `${c}入${d}墓—被收藏/压制`)
    }
  }

  // 目标十神分析：找出与日主关系最密切的"关键桥梁"
  const riWx = wxMap[riGan] || ''
  // 要找：财(赚钱路径)、官杀(事业路径)、食伤(技术路径)、印(学习路径)、比劫(社交路径)
  const paths: {label:string; target: string; steps: {via:string;rel:string;desc:string}[]; score: number}[] = []

  // 尝试所有目标字
  for (const target of allChars) {
    if (target === riGan || target === zhis[2]) continue  // 跳过日主自己

    // BFS搜索
    const visited = new Set<string>()
    const queue: {node:string; path:{via:string;rel:string;desc:string}[]; depth:number}[] = []
    queue.push({node: riGan, path: [], depth: 0})
    visited.add(riGan)
    let foundPath: {via:string;rel:string;desc:string}[] | null = null

    while (queue.length > 0) {
      const cur = queue.shift()!
      if (cur.depth >= 4) continue

      const edges = adj.get(cur.node) || []
      for (const e of edges) {
        if (visited.has(e.target)) continue
        const newPath = [...cur.path, {via: `${cur.node}→${e.target}`, rel: e.relation, desc: e.desc}]
        if (e.target === target) {
          foundPath = newPath
          break
        }
        visited.add(e.target)
        queue.push({node: e.target, path: newPath, depth: cur.depth + 1})
      }
      if (foundPath) break
    }

    if (foundPath) {
      const st = sst(riGan, target)
      const label = st || wxMap[target] || ''
      const isHome = ['日','时'].some((_,i)=> i>=2 && (gans[i]===target || zhis[i]===target))
      paths.push({
        label: `${target}(${label})`,
        target,
        steps: foundPath,
        score: (isHome ? 5 : 2) + (foundPath.length <= 2 ? 3 : 0) + (['生','合','根'].includes(foundPath[0].rel) ? 2 : 0)
      })
    }
  }

  // 排序取top3
  paths.sort((a,b) => b.score - a.score)
  const topPaths = paths.slice(0, 3)

  if (topPaths.length > 0) {
    r.push(`━━━ 关系链引擎(BFS多跳推理) ━━━`)
    r.push(`从日主${riGan}出发搜索整个命局：`)
    for (const p of topPaths) {
      const stepsStr = p.steps.map(s => s.desc).join(' → ')
      r.push(`📍 ${p.label}: ${stepsStr}`)
    }

    // 综合解读
    const best = topPaths[0]
    const bestType = sst(riGan, best.target)
    r.push('')
    if (bestType === '财') {
      r.push(`核心关系链指向${best.target}(${bestType})——你赚钱的路径不是直接的,需要通过中间环节。你的财富模型是"绕弯子"型,不是直来直去的。`)
    } else if (bestType === '官杀') {
      r.push(`核心关系链指向${best.target}(${bestType})——你的事业成就需要分步走。你不是一步登天的人,是通过关系、平台、合作一步步爬上去的。`)
    } else if (bestType === '食伤') {
      r.push(`核心关系链指向${best.target}(${bestType})——你的技术和才华需要通过中间载体(产品或团队)才能变现。你不是纯粹的专家,你是转化型人才。`)
    } else if (bestType === '印') {
      r.push(`核心关系链指向${best.target}(${bestType})——你的底蕴和学识需要通过媒介人(导师或平台)才能发挥作用。你缺的不是能力,是桥梁。`)
    } else {
      r.push(`核心关系链指向${best.target}(${bestType})——你的八字中最重要的关系不是直接作用,而是通过中间人/中间事连接。`)
    }

    if (topPaths.length >= 2) {
      const second = topPaths[1]
      r.push('')
      r.push(`第二关系链:${second.label}。当第一条路径受阻时,这是你的备用方案。你的八字有回旋余地。`)
    }
  } else {
    r.push(`从日主${riGan}出发没有找到有效的关系链——你的命局比较"净",做什么事都比较直接,不需要绕弯子。但也要注意:太直接了也意味着没有退路。`)
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  v8 P0-2: 大运评估四步法
//  四步: 原局有/无 + 家里家外 + 控制力 + 生好字/坏字
// ════════════════════════════════════════════════════════════

function daYunFourStep(
  riGan: string, pills: {gan:string;zhi:string}[],
  dg: string, dz: string, gender: string
): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riWx = wx(riGan)
  const posNames = ['年','月','日','时']

  r.push(`━━━ ${dg}${dz}运 ━━━`)

  // 第一步: 原局有/无
  const hasGenInChart = isGanInChart(dg, gans, zhis)
  const hasZhiInChart = zhis.includes(dz)
  if (hasGenInChart && hasZhiInChart) {
    r.push(`${dg}${dz}这组干支,你原局就带着。这叫"道上运"——你走在自己熟悉的路上。这十年你左右逢源,做什么都顺。能借到家里日支的力量。`)
  } else if (hasGenInChart || hasZhiInChart) {
    r.push(`${dg}${dz}这组干支,你原局只有一半——要么天干熟要么地支熟。这叫"半生半熟"。这十年你在熟悉的领域做新的事,别完全换赛道。`)
  } else {
    r.push(`${dg}${dz}这组干支,你原局没有——这是外来运。方向对了赚钱,方向错了翻车。这十年你得借别人的船出海,别自己造船从头来。`)
  }

  // 第二步: 家里家外控制（生>合>穿>冲>刑 多层级）
  let homeCtrl = false, homeType = ''
  const ht: Record<string, string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
  const shengMap2: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const dWx2 = wx(dg)
  const riZhi2 = zhis[2]
  for (const hg of gans.slice(2)) {
    if (shengMap2[dWx2] === wx(hg)) { homeCtrl = true; homeType = '生'; break }
  }
  if (!homeCtrl) {
    for (const hz of zhis.slice(2)) {
      if (shengMap2[dWx2] === ZHI_WU_XING[hz]) { homeCtrl = true; homeType = '生'; break }
    }
  }
  if (!homeCtrl) {
    for (const hg of gans.slice(2)) {
      if (ht[dg + hg] || ht[hg + dg]) { homeCtrl = true; homeType = '合'; break }
    }
  }
  if (!homeCtrl) {
    for (const hz of zhis.slice(2)) {
      if (LIU_HE[hz] === dz || LIU_HE[dz] === hz) { homeCtrl = true; homeType = '合'; break }
    }
  }
  if (!homeCtrl) {
    for (const hz of zhis.slice(2)) {
      if (LIU_CHUAN[hz] === dz || LIU_CHUAN[dz] === hz) { homeCtrl = true; homeType = '穿'; break }
    }
  }
  if (!homeCtrl) {
    for (const hz of zhis.slice(2)) {
      if (LIU_CHONG[hz] === dz || LIU_CHONG[dz] === hz) { homeCtrl = true; homeType = '冲'; break }
    }
  }
  if (!homeCtrl) {
    for (const hz of zhis.slice(2)) {
      if (SAN_XING[hz] === dz || SAN_XING[dz] === hz) { homeCtrl = true; homeType = '刑'; break }
    }
  }
  if (!homeCtrl && dz === zhiKu(riZhi2)) {
    homeCtrl = true; homeType = '根印'
  }
  const strengthMap: Record<string,string> = {
    '生':'这十年大运的五行直接生你家里的字——这叫"送上门"的好运。不光你有主导权,而且是好事主动来找你。你什么都不用做,好运自然来。',
    '根印':'这十年大运的地支是你日支的"根"——你感觉找到了自己的底盘。做什么都有底气,不再是飘着的状态。适合做长期规划、沉淀下来。',
    '合':'这十年大运跟你家合上了——你有商量权。你们是合伙关系,谁也绕不开谁。想成就大事必须跟你商量。',
    '穿':'这十年大运跟你家穿上了——对方以"为你好"的名义跟你打交道。表面客气,私下较劲。你要擦亮眼睛,别人说为你好不一定真为你好。',
    '冲':'这十年大运冲了你家里——动静大、变化多。冲也不全是坏事,冲了房子就是换房,冲了工作就是换岗。关键看你能不能接住这个变。',
    '刑':'这十年大运跟你家刑上了——互相较劲互相学。你跟外面的关系微妙,既想合作又在暗自较劲。合作要谨慎,钱要算清楚。'
  }
  if (homeCtrl) {
    r.push(`${dg}${dz}跟你家里是'${homeType}'的关系。${strengthMap[homeType]||'你有主导权。'}`)
  } else {
    r.push(`${dg}${dz}跟你家里没有直系关系——参与但不主导。这十年你要借别人的船出海。这个运的字从哪来的,你就往那个方向找。`)
  }

  // 第三步: 归属权层级——大运的字跟日主是什么关系?
  // 教材R3: 想得到库里的东西→找能制这个字的工具
  // 教材S2: 控制权层级=我生的>合>制>刑冲破害
  const dWx = wx(dg)
  const shengMap: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const keMap: Record<string,string> = {木:'土',土:'水',水:'火',火:'金',金:'木'}
  let ownership = '无', ownDetail = ''
  // 第一层: 日主生大运（日主控制大运）
  if (shengMap[riWx] === dWx) {
    ownership = '我生'
    ownDetail = '日主生大运的字——你掌控这部运。你想做什么就能做成什么,因为主动权在你手上。这十年你是指挥官。'
  }
  // 第二层: 大运生日主（大运主动给你）
  if (!ownership || ownership === '无') {
    if (shengMap[dWx] === riWx) {
      ownership = '生我'
      ownDetail = '大运的生来生日主——你是被滋养的。这十年不用费力,好事自动找上门。你做好接的准备就行。'
    }
  }
  // 第三层: 天干五合（合=商量得来,不看力量）
  if (ownership === '无') {
    for (const hg of gans.slice(2)) {
      if (ht[dg + hg] || ht[hg + dg]) { ownership = '合'; ownDetail = '大运的天干跟你家里的天干有合——你们是合作关系。不是谁控制谁,是互相需要。好好商量,都能得到。'; break }
    }
  }
  // 第四层: 日主持有大运的库（大运字从日主库出）
  if (ownership === '无') {
    const riKu = zhiKu(zhis[2])
    if (riKu && zhis.includes(riKu)) {
      ownership = '库控'
      ownDetail = '大运的字出自你日支的库——你家里有它的根。这十年虽然外面的人来找你办事,但你说了算,因为它的根在你手上。'
    }
  }
  // 第五层: 大运克日主（需要看力量）
  if (ownership === '无') {
    if (keMap[dWx] === riWx) {
      const monthZhi = zhis[1]
      const monthWx = ZHI_WU_XING[monthZhi]
      // 看大运是否得月令
      const dayunInPower = (shengMap[monthWx] === dWx) || (dWx === monthWx)
      if (dayunInPower) {
        ownership = '克我强'
        ownDetail = '大运克你,且大运五行得月令——它比你强。这十年你比较被动,外面的大环境压着你。不是你不行,是时机没到。先守,等机会。'
      } else {
        ownership = '克我弱'
        ownDetail = '大运虽然克你,但它不得月令——能克你但克不深。有压力但有分寸。这十年你辛苦一点,但能扛住。'
      }
    }
  }
  // 第六层: 日主克大运（日主可以控制）
  if (ownership === '无') {
    if (keMap[riWx] === dWx) {
      const monthZhi = zhis[1]
      const monthWx = ZHI_WU_XING[monthZhi]
      const riInPower = (shengMap[monthWx] === riWx) || (riWx === monthWx)
      if (riInPower) {
        ownership = '我克强'
        ownDetail = '你克大运,且你得月令——你能扛住这十年的压力。虽然辛苦,但你能从中赚到钱、得到成长。辛苦是值得的。'
      } else {
        ownership = '我克弱'
        ownDetail = '你克大运,但不得月令——你硬扛。能扛但会累,建议少折腾。' 
      }
    }
  }
  if (ownership === '无') {
    ownDetail = '大运的字跟日主没有直接生克制化关系——你只能借。这十年你不是主导方,是跟随者。建议找比你强的合作,借力打力。'
  }
  r.push(`${dg}${dz}跟你是'${ownership}'的关系。${ownDetail}`)

  // 第四步: 大运生到了谁？——看大运干支生家里的字
  const riZhi3 = zhis[2]
  const riGan2 = gans[2]
  let homeFed = '', homeFedDesc = ''
  const homeGoodWords: Record<string,string> = {
    '正印':'稳定和认同','偏印':'钻研和灵感','比肩':'真朋友','劫财':'合作伙伴',
    '食神':'创意','伤官':'作品','正财':'收入','偏财':'投资回报',
    '正官':'地位','七杀':'突破'
  }
  const shengMap3: Record<string,string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const dWx3 = wx(dg)
  const dZhiWx3 = ZHI_WU_XING[dz]

  // 收集所有被生的字及其十神
  const fedResults: {tenShen:string; desc:string; weight:number}[] = []
  for (let hi = 2; hi < 4; hi++) {
    const hGan = gans[hi], hZhi = zhis[hi]
    // 检查天干
    if (shengMap3[dWx3] === wx(hGan) || shengMap3[dZhiWx3] === wx(hGan)) {
      const ts = ss(riGan, hGan)
      if (!fedResults.some(r => r.tenShen === ts)) {
        const w = (shengMap3[dWx3] === wx(hGan) && shengMap3[dZhiWx3] === wx(hGan)) ? 5 : 3
        fedResults.push({tenShen: ts, desc: homeGoodWords[ts]||'', weight: w})
      }
    }
    // 检查地支
    if (shengMap3[dWx3] === ZHI_WU_XING[hZhi] || shengMap3[dZhiWx3] === ZHI_WU_XING[hZhi]) {
      const ts2 = sst(riGan, hZhi)
      if (!fedResults.some(r => r.tenShen === ts2)) {
        const w2 = (shengMap3[dWx3] === ZHI_WU_XING[hZhi] && shengMap3[dZhiWx3] === ZHI_WU_XING[hZhi]) ? 5 : 2
        fedResults.push({tenShen: ts2, desc: homeGoodWords[ts2]||'', weight: w2})
      }
    }
  }
  // 按权重和十神优先级: 印>财>食伤>官杀>比劫
  const tsPriority: Record<string,number> = {
    '正印':10,'偏印':9,'正财':8,'偏财':7,
    '食神':6,'伤官':5,'正官':4,'七杀':3,
    '比肩':2,'劫财':1
  }
  fedResults.sort((a,b) => (b.weight + (tsPriority[b.tenShen]||0)) - (a.weight + (tsPriority[a.tenShen]||0)))
  if (fedResults.length > 0) {
    homeFed = fedResults[0].tenShen
    homeFedDesc = fedResults[0].desc
  }
  if (homeFed && homeFedDesc) {
    r.push(`${dg}${dz}的五行生了你家的${homeFed}——送你东西了。这十年你在${homeFedDesc}方面会有收获,不用太费力。`)
  } else {
    r.push(`${dg}${dz}的五行没生到你家里的字——大运没带礼物来。不代表坏事,只是说这十年你等不来现成的好事,每一样都得主动去争取。`)
  }

  // 第五步: 出处追踪——大运的字从原局的哪里来?
  // 教材方法论:R20出处品质决定层次
  const kuZhi: Record<string,string> = {'辰':'木水库','戌':'火金库','丑':'金水库','未':'木火库','寅':'木禄位','申':'金禄位','巳':'火禄位','亥':'水禄位'}
  let originNote = ''
  // 追大运天干出处:看在原局哪个地支能找到同五行藏干
  for (let hi = 0; hi < 4; hi++) {
    const cgs = CANG_GAN[zhis[hi]] || []
    if (cgs.includes(dg)) {
      originNote = `${dg}从${zhis[hi]}(${posNames[hi]}柱)出来——${kuZhi[zhis[hi]]||''}`
      break
    }
  }
  if (!originNote) {
    // 追大运地支出处:看生大运的地支或同库
    for (let hi = 0; hi < 4; hi++) {
      if (shengMap3[ZHI_WU_XING[zhis[hi]]] === ZHI_WU_XING[dz]) {
        originNote = `${dz}受${zhis[hi]}(${posNames[hi]}柱)所生`
        break
      }
    }
  }
  if (!originNote) {
    for (let hi = 0; hi < 4; hi++) {
      if (zhiKu(zhis[hi]) === dz) {
        originNote = `${dz}是${zhis[hi]}(${posNames[hi]}柱)的库`
        break
      }
    }
  }
  if (originNote) {
    r.push(`出处在你原局:${originNote}。这个运的能量不是凭空来的——你八字里原本就有这个根。往这个方向找机会,事半功倍。`)
  } else {
    r.push(`出处不在你原局:这个运的字你原局里没有根——能量是外来的。你要完全凭本事吃饭,借别人的船出海。这十年自己造轮子,别等现成的。`)
  }

  // 综合
  let finalVerdict = ''
  const goodSignals = (hasGenInChart ? 1 : 0) + (homeCtrl ? 1 : 0) + 
    ((ownership === '我生' || ownership === '生我' || ownership === '合' || ownership === '库控' || ownership === '我克强') ? 1 : 0) +
    (homeFed ? 1 : 0)
  if (goodSignals >= 3) {
    finalVerdict = '这十年是你的强势大运。该冲就冲,别犹豫。你想做什么就去做,老天爷站你这边。'
  } else if (goodSignals >= 2) {
    finalVerdict = '这十年是中等偏上的大运。有机会有挑战。建议稳中求进,别贪大。一步一个脚印,走稳了比走快了重要。'
  } else {
    finalVerdict = '这十年偏弱。以守为主,少折腾多积累。不是你不能干,是时机没到。蛰伏是为了下一跳得更高。'
  }
  r.push('')
  r.push(finalVerdict)

  return r
}

// ════════════════════════════════════════════════════════════
//  v8 P0-3: 两象定一象引擎(双线合论)
//  两条独立路径→同一个结论→可信
// ════════════════════════════════════════════════════════════

function twoSignsEngine(riGan: string, gans: string[], zhis: string[], gender: string): string[] {
  const r: string[] = []
  const riWx = wx(riGan)

  interface Conclusion { text: string; evidence: string[]; paths: string[]; confidence: number }

  const conclusions: Conclusion[] = []

  // ----- 检查点1: 技术赚钱(食伤+财两条线) -----
  let evTech1: string[] = [], evTech2: string[] = []
  // 路径1: 食伤在天干
  for (const g of gans) {
    const st = ss(riGan, g)
    if (st === '食神' || st === '伤官') {
      evTech1.push(`天干${g}是${st}——有技术才华`)
      break
    }
  }
  // 路径1B: 食伤藏支
  for (const z of zhis) {
    for (const cg of (CANG_GAN[z] || [])) {
      const st = ss(riGan, cg)
      if (st === '食神' || st === '伤官') {
        evTech1.push(`地支${z}藏${cg}(${st})——有暗藏的技术根底`)
        break
      }
    }
    if (evTech1.length >= 2) break
  }
  // 路径2: 食伤生财(食伤制财)
  const hourG = gans[3], hourZ = zhis[3]
  const hourSS = ss(riGan, hourG)
  if (hourSS === '食神' || hourSS === '伤官') {
    for (const g of gans) {
      if (ss(riGan, g) === '正财' || ss(riGan, g) === '偏财') {
        evTech2.push(`时干${hourG}(${hourSS})生财星——技术变现路径`)
        break
      }
    }
  }
  if (evTech1.length >= 1 && evTech2.length >= 1) {
    conclusions.push({
      text: '你经常靠技术/才华赚钱',
      evidence: [...evTech1, ...evTech2],
      paths: ['食伤透出(有技术)', '时柱+财星(能变现)'],
      confidence: 3
    })
  }

  // ----- 检查点2: 社交型人格(比劫+合两条线) -----
  let evSocial1: string[] = [], evSocial2: string[] = []
  for (const g of gans) {
    const st = ss(riGan, g)
    if (st === '比肩' || st === '劫财') {
      evSocial1.push(`天干${g}是${st}——社交属性强`)
      break
    }
  }
  for (const z of zhis) {
    for (const d of zhis) {
      if (z === d) continue
      if (LIU_HE[z] === d) {
        evSocial2.push(`地支${z}合${d}——有合就有社交`)
        break
      }
    }
    if (evSocial2.length > 0) break
  }
  if (evSocial1.length >= 1 && evSocial2.length >= 1) {
    conclusions.push({
      text: '你是社交型人格,靠关系吃饭',
      evidence: [...evSocial1, ...evSocial2],
      paths: ['比劫透出(有社交)', '地支有合(有连接)'],
      confidence: 3
    })
  }

  // ----- 检查点3: 适合体制/大平台(官印两条线) -----
  let evGuanYin1: string[] = [], evGuanYin2: string[] = []
  let hasGuan = false, hasYin = false
  for (const g of gans) {
    const st = ss(riGan, g)
    if (st === '正官' || st === '七杀') { hasGuan = true; evGuanYin1.push(`天干${g}是${st}——仕途信号`) }
    if (st === '正印' || st === '偏印') { hasYin = true; evGuanYin2.push(`天干${g}是${st}——学历/背书信号`) }
  }
  if (hasGuan && hasYin) {
    conclusions.push({
      text: '你适合体制/大平台发展',
      evidence: [...evGuanYin1, ...evGuanYin2],
      paths: ['官星透出(有管理意愿)', '印星透出(有学习底蕴)'],
      confidence: 4
    })
  }

  // ----- 检查点4: 容易/不容易赚钱(财星+根两条线) -----
  let evMoney1: string[] = [], evMoney2: string[] = []
  let hasCaiGan = false
  for (const g of gans) {
    const st = ss(riGan, g)
    if (st === '正财' || st === '偏财') {
      hasCaiGan = true
      evMoney1.push(`天干${g}是${st}——财星透出`)
      break
    }
  }
  const roots = ROOT_MAP[riWx] || []
  const rootZhis = zhis.filter(z => roots.includes(z))
  if (rootZhis.length >= 2) {
    evMoney2.push(`命局有${rootZhis.length}个根(${rootZhis.join(',')})——根基扎实,赚钱有底气`)
  } else if (rootZhis.length === 0) {
    evMoney2.push('命局无根——赚钱辛苦')
  }

  if (hasCaiGan && rootZhis.length >= 2) {
    conclusions.push({
      text: '你有赚钱的能力和底气',
      evidence: [...evMoney1, ...evMoney2],
      paths: ['财星透出(有机会)', '根多(有底气)'],
      confidence: 3
    })
  }

  // 排序输出
  conclusions.sort((a,b) => b.confidence - a.confidence)

  if (conclusions.length > 0) {
    r.push(`━━━ 两象定一象引擎(双线合论) ━━━`)
    for (const c of conclusions) {
      r.push(`📍 ${c.text} (置信度:${c.confidence}/5)`)
      r.push(`  证据:${c.evidence.join('; ')}`)
      r.push(`  路径:${c.paths.join(' × ')}`)
    }
    r.push('')
    r.push(`两象定一象的核心逻辑:单条证据可能是巧合,两条独立路径指向同一结论,可信度翻倍。`)
  } else {
    r.push(`命局没有明显的"两条线指向同一结论"特征——你的情况比较综合,需要结合多模块综合判断。`)
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  v8 P0-4: 控制权三级归属(出处>生>控制)
//  出处(原局来源) → 生(谁生谁) → 控制(谁说了算)
// ════════════════════════════════════════════════════════════

function controlLevelThree(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riWx = wx(riGan)
  const riZhi = zhis[2]

  r.push(`━━━ 控制权三级归属 ━━━`)
  r.push(`从日主${riGan}出发,三级判断谁真正说了算:`)

  // 一级: 出处(原局来源)——能量从哪里来
  const shengMap: Record<string,string[]> = {木:['水'],火:['木'],土:['火'],金:['土'],水:['金']}
  const riShengFrom = shengMap[riWx] || []  // 生日主的五行
  let chuChu = ''
  let chuChuDesc = ''
  for (const z of zhis) {
    if (riShengFrom.includes(zhiWx(z))) {
      chuChu = z
      chuChuDesc = `你日主${riGan}(${riWx})的能量来自${z}(${zhiWx(z)})——${z}是你的源头`
      break
    }
  }
  if (!chuChu) {
    for (const g of gans) {
      if (g !== riGan && riShengFrom.includes(wx(g))) {
        chuChu = g
        chuChuDesc = `你日主${riGan}(${riWx})的能量来自天干${g}(${wx(g)})——${g}是你的源头`
        break
      }
    }
  }
  if (!chuChu) {
    for (const z of zhis) {
      const cgs = CANG_GAN[z] || []
      for (const cg of cgs) {
        if (riShengFrom.includes(wx(cg))) {
          chuChu = z
          chuChuDesc = `你日主${riGan}(${riWx})的能量来自地支${z}藏干${cg}——暗中的靠山`
          break
        }
      }
      if (chuChu) break
    }
  }

  if (chuChu) {
    r.push('')
    r.push(`【一级·出处】${chuChuDesc}`)
    const chuPos = ['年','月','日','时'][zhis.indexOf(chuChu)] || '藏'
    if (chuPos === '年') {
      r.push(`  出处在家外(年柱)——你的核心资源来自社会关系、祖业、大环境。`)
    } else if (chuPos === '月') {
      r.push(`  出处在家门(月柱)——你的核心资源来自家庭、朋友、社交圈。`)
    } else if (chuPos === '日' || chuPos === '时') {
      r.push(`  出处在家里(日/时)——你的核心资源来自自己或家庭内部,你是自主型。`)
    }
  } else {
    r.push(`【一级·出处】没有明确的能量来源——你属自强型,不靠外力。`)
  }

  // 二级: 生(谁被生)——你的能量用在谁身上
  const riShengTo = {木:'火',火:'土',土:'金',金:'水',水:'木'}[riWx] || ''
  let shengTarget = ''
  let shengTargetDesc = ''
  for (const z of zhis) {
    if (zhiWx(z) === riShengTo) {
      shengTarget = z
      shengTargetDesc = `你日主${riGan}(${riWx})生${z}(${zhiWx(z)})——你的能量用在${z}上`
      break
    }
  }
  if (!shengTarget) {
    for (const g of gans) {
      if (g !== riGan && wx(g) === riShengTo) {
        shengTarget = g
        shengTargetDesc = `你日主${riGan}(${riWx})生天干${g}(${wx(g)})——你的能量用在天干${g}上`
        break
      }
    }
  }

  if (shengTarget) {
    r.push('')
    r.push(`【二级·生】${shengTargetDesc}`)
    const shengSt = ss(riGan, shengTarget.includes('子丑寅卯辰巳午未申酉戌亥') ? (CANG_GAN[shengTarget]||[''])[0] : shengTarget)
    if (shengSt === '食神' || shengSt === '伤官') {
      r.push(`  你生的是食伤——你的能量用在技术、创意、表达上。你是产出型人才。`)
    } else if (shengSt === '正财' || shengSt === '偏财') {
      r.push(`  你生的是财——你的能量用在赚钱上。你是务实型人才。`)
    } else {
      r.push(`  你的能量用在${shengSt}相关的事上。`)
    }
  }

  // 三级: 控制(谁克谁)——谁说了算
  const keMap: Record<string,string> = {木:'土',火:'金',土:'水',金:'木',水:'火'}
  const keByMap: Record<string,string> = {木:'金',火:'水',土:'木',金:'火',水:'土'}
  const riKe = keMap[riWx] || ''      // 日主克的五行
  const riKeBy = keByMap[riWx] || ''  // 克日主的五行

  let controlTarget = ''
  let controlBy = ''
  for (const z of zhis) {
    if (zhiWx(z) === riKe) { controlTarget = z; break }
  }
  for (const z of zhis) {
    if (zhiWx(z) === riKeBy) { controlBy = z; break }
  }

  if (controlTarget) {
    r.push('')
    r.push(`【三级·控制】你克${controlTarget}(${zhiWx(controlTarget)})——你在控制别人/外部事物`)
    const controlSt = ss(riGan, (CANG_GAN[controlTarget]||[''])[0])
    if (controlSt === '财') {
      r.push(`  你克的是财——你能控制钱、管理财务。你是管钱的人。`)
    } else if (controlSt === '官杀') {
      r.push(`  你克的是官杀——你能控制局面、管理团队。你是管事的人。`)
    }
  } else if (controlBy) {
    r.push('')
    r.push(`【三级·控制】${controlBy}(${zhiWx(controlBy)})克你——你被别人/环境控制`)
    const controlBySt = ss(riGan, (CANG_GAN[controlBy]||[''])[0])
    if (controlBySt === '官杀') {
      r.push(`  被官杀克——你在体制内/规则下做事。规矩是你的框架也是你的枷锁。`)
    }
  } else {
    r.push(`【三级·控制】没有明显的控制关系——你的命局比较自由,谁也管不了你太多。`)
  }

  // 总评
  r.push('')
  r.push(`控制权三级归属的核心逻辑:出处决定能量质量,生流向决定使用方式,控制决定最终话语权。`)
  if (chuChu) {
    r.push(`你的能量有明确来源——不会"凭空消失"。你做事有后劲。`)
  } else {
    r.push(`你的能量来源不明确——容易"三分钟热度"。你得找到真正能让你持续投入的事。`)
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  v8 P0-5: 制用结构四元化(正制/反制/互制/不制)+事业模式
//  基于50轮深研的制用结构深度剖析
// ════════════════════════════════════════════════════════════

function zhiYongFour(riGan: string, gans: string[], zhis: string[], gender: string): string[] {
  const r: string[] = []
  const riWx = wx(riGan)
  const riZhi = zhis[2]

  r.push(`━━━ 制用结构四元化分析 ━━━`)
  r.push(`基于绳子(工具)和牛(猎物)的理论,判断你的制用模式:`)

  // 构建五行克关系
  const keMap: Record<string,string> = {木:'土',土:'水',水:'火',火:'金',金:'木'}
  const keByMap: Record<string,string> = {木:'金',土:'木',水:'土',火:'水',金:'火'}
  const riKe = keMap[riWx] || ''
  const riKeBy = keByMap[riWx] || ''

  // 统计各十神的干支力量
  function countTenGod(ri: string, gList: string[], zList: string[]): Record<string, number> {
    const counts: Record<string, number> = {印:0,财:0,官杀:0,食伤:0,比劫:0}
    for (const g of gList) {
      const st = sst(ri, g)
      if (st === '印') counts['印'] += 2
      else if (st === '财') counts['财'] += 2
      else if (st === '官杀') counts['官杀'] += 2
      else if (st === '食伤') counts['食伤'] += 2
      else if (st === '比劫') counts['比劫'] += 2
    }
    for (const z of zList) {
      const zWx = zhiWx(z)
      if (zWx === keMap[riWx]) counts['财'] += 1       // 日主克 = 财
      else if (zWx === keByMap[riWx]) counts['官杀'] += 1  // 克日主 = 官杀
      else if (zWx === riWx) counts['比劫'] += 1        // 同 = 比劫
      // 生克关系映射到印/食伤
      else if (sst(ri, (CANG_GAN[z]||[''])[0]) === '印') counts['印'] += 0.5
      else if (sst(ri, (CANG_GAN[z]||[''])[0]) === '食伤') counts['食伤'] += 0.5
    }
    return counts
  }

  const tg = countTenGod(riGan, gans, zhis)

  // ---- 判断四元化类型 ----
  // 正制: 我克的东西被我控制(日主制财/日主制官杀)——主动出击
  // 反制: 克我的东西反被我利用(官杀被食伤制/财被比劫制)——被动转主动
  // 互制: 双方互相牵制(力量相当)——动态平衡
  // 不制: 没有明显的制用关系——随遇而安

  let zhiType = ''
  let zhiDesc = ''
  let businessModel = ''

  // 比劫≥2 且 财≥1 → 反制(比劫制财)
  if (tg['比劫'] >= 2 && tg['财'] >= 1 && tg['比劫'] > tg['财']) {
    zhiType = '反制'
    zhiDesc = '你的制用模式是"反制"——通过团队/社交去控制财富。你不是单打独斗,是通过合伙人、团队、关系网去获取资源。'
    businessModel = '你的事业模式:靠人赚钱。你是"平台型"创业者,你的价值在于连接人而不是自己动手。'
  }
  // 食伤≥2 且 官杀≥1 → 正制(食伤制官杀)
  else if (tg['食伤'] >= 2 && tg['官杀'] >= 1 && tg['食伤'] > tg['官杀']) {
    zhiType = '正制'
    zhiDesc = '你的制用模式是"正制"——用技术/才华去获取地位。你靠真本事吃饭,用专业能力撬动社会资源。'
    businessModel = '你的事业模式:靠技术赚钱。你是"专家型"人才,你的价值在于你的专业深度。'
  }
  // 财≥2 且 印≥1 → 反制(财制印)
  else if (tg['财'] >= 2 && tg['印'] >= 1 && tg['财'] > tg['印']) {
    zhiType = '反制'
    zhiDesc = '你的制用模式是"反制"(财制印)——用金钱/资源去控制品牌和平台。你是资本驱动型,一切以ROI为准。'
    businessModel = '你的事业模式:靠资本运作。你是"投资人"思维,你和别人最大的区别是:你做任何事都先算账。'
  }
  // 印≥2 且 食伤≥1 → 正制(印制食伤)
  else if (tg['印'] >= 2 && tg['食伤'] >= 1 && tg['印'] > tg['食伤']) {
    zhiType = '正制'
    zhiDesc = '你的制用模式是"正制"(印制食伤)——用知识和阅历去管理创意。你是成熟型人才,不轻易出手,一出手就是成熟方案。'
    businessModel = '你的事业模式:靠积累和经验吃饭。你是"顾问型",你的价值在于你的判断力。'
  }
  // 官杀≥2 且 比劫≥1 → 互制(官杀制比劫,但力量相当)
  else if (tg['官杀'] >= 2 && tg['比劫'] >= 1) {
    // 判断是官杀压比劫还是旗鼓相当
    if (tg['官杀'] > tg['比劫'] * 1.5) {
      zhiType = '正制'
      zhiDesc = '你的制用模式是"正制"(官杀制比劫)——用规则和权威管人。你是管理型人才。'
      businessModel = '你的事业模式:靠权威吃饭。你是"管理者",你的价值在于能镇住场子。'
    } else {
      zhiType = '互制'
      zhiDesc = '你的制用模式是"互制"——你和周围的力量相互牵制。你不是绝对说一不二的人,但也绝不是任人摆布的人。'
      businessModel = '你的事业模式:需要平衡各方势力。你适合做"协调者"而不是"独裁者"。'
    }
  }
  // 力量均衡或都不明显
  else {
    // 检查是否有任何一方明显
    const maxCount = Math.max(...Object.values(tg))
    const minCount = Math.min(...Object.values(tg))
    if (maxCount - minCount <= 1.5) {
      zhiType = '互制'
      zhiDesc = '你的制用模式是"互制"——八字中各路力量比较均衡,没有一家独大。你的人生没有明确的"猎物",你会随环境变化不断调整目标。'
      businessModel = '你的事业模式:适应力强但缺少聚焦。你适合做"多面手",你的价值在于你什么都能接。'
    } else {
      zhiType = '不制'
      zhiDesc = '你的制用模式是"不制"——你的八字没有形成明确的制用结构。你的人生不需要特定的工具和猎物,来什么接什么。'
      businessModel = '你的事业模式:随遇而安。你不是那种会被一个目标绑架的人,你的弹性是你的优势。'
    }
  }

  r.push('')
  r.push(`类型:${zhiType}`)
  r.push(zhiDesc)
  r.push('')
  r.push(`事业模式:${businessModel}`)

  // 制得干净还是不干净(来自原zhiYongEvaluate的增强)
  const bestKu = BEST_YIN_KU[riGan] || ''
  let allSame = true, firstKu = ''
  for (const g of gans) {
    const k = BEST_YIN_KU[g] || ''
    if (!firstKu) firstKu = k
    else if (k !== firstKu) { allSame = false; break }
  }
  if (allSame && firstKu && firstKu === bestKu) {
    r.push('')
    r.push(`制得干净:天干全出${firstKu}库——能量聚焦,你做事专注目标明确。适合一条路走到黑。`)
  } else {
    r.push('')
    r.push(`制得分散:天干出库不一——你兴趣广泛但容易分散。要做减法。`)
  }

  // 制用结构总结
  r.push('')
  r.push(`制用四元化的核心:知道了你的"绳子"(工具)和"牛"(猎物),就明白了你这辈子在"制"什么。`)
  if (zhiType === '正制') {
    r.push(`你适合主动出击、主导局面。别犹豫,你是猎人。`)
  } else if (zhiType === '反制') {
    r.push(`你在被动中寻找机会。别着急,你是"反弹型"人才,越压你越强。`)
  } else if (zhiType === '互制') {
    r.push(`你在平衡中前进。别极端,你是需要合作的人。`)
  } else {
    r.push(`你随遇而安,来什么接什么。别有执念,你是灵活的人。`)
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  v8 P0-6: 借根7层逻辑
//  借根≠不自信,有社会属性/十神属性/商业模式/边界感等完整层级
// ════════════════════════════════════════════════════════════

function jieGenAnalysis(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riWx = wx(riGan)
  const riZhi = zhis[2]
  const posNames = ['年','月','日','时']
  const rootMapAll = ROOT_MAP[riWx] || []

  // 找日主的根
  const ownRoots: {zhi:string; pos:number; posName:string}[] = []
  for (let i = 0; i < zhis.length; i++) {
    if (rootMapAll.includes(zhis[i])) {
      ownRoots.push({zhi: zhis[i], pos: i, posName: posNames[i]})
    }
  }

  if (ownRoots.length === 0) {
    r.push(`━━━ 借根分析(7层逻辑) ━━━`)
    r.push(`你的八字没有日主${riGan}(${riWx})的直接根——你是"无根"型。`)
    r.push('')
    r.push(`【第一层·无根本质】你凡事要"借"。自己没有底盘,需要从外面找依靠。这不是坏事,反而是你的动力来源——什么样的人需要借根?有追求的人。`)

    // 第二层: 借什么?  看日主周围最亲近的五行
    r.push('')
    r.push(`【第二层·借什么】`)
    // 看日支(配偶宫)的五行
    const rzWx = zhiWx(riZhi)
    if (rzWx !== riWx) {
      r.push(`  你配偶宫${riZhi}是${rzWx}——你最容易在${rzWx}相关的领域借到"根"(伴侣、合作伙伴)。`)
    }
    // 看月令
    const yueZhi = zhis[1]
    const yueWx = zhiWx(yueZhi)
    if (yueWx !== riWx) {
      r.push(`  你月令${yueZhi}是${yueWx}——你在${yueWx}相关的社交圈/家庭中借到根基。`)
    }

    // 第三层: 借根的品质(原局R20:出处品质决定层次)
    r.push('')
    r.push(`【第三层·借根的品质】`)
    const bestKu = BEST_YIN_KU[riGan] || ''
    if (bestKu && zhis.includes(bestKu)) {
      r.push(`  你的印库${bestKu}在原局——借的根是高质量的。你能借到"有体系、有底蕴"的东西,不是随便什么都借。`)
    } else {
      r.push(`  你的印库${bestKu}不在原局——借的根偏"随缘"。你遇到什么人就借什么势,品质取决于你的社交圈。`)
    }

    // 第四层: 借根的十神属性
    r.push('')
    r.push(`【第四层·十神属性】`)
    const rzMain = (CANG_GAN[riZhi] || [''])[0]
    const rzSS = sst(riGan, rzMain)
    if (rzSS === '官杀') {
      r.push(`  你借的是"势"——你通过跟随有地位的人获得根基。你是追随者但不平庸,因为你挑人。`)
    } else if (rzSS === '印') {
      r.push(`  你借的是"认同"——你通过被认可获得根基。你不是在找能力,你是在找归属感。`)
    } else if (rzSS === '财') {
      r.push(`  你借的是"资源"——你通过利益分配获得根基。你很清楚:一切都是交易。`)
    } else if (rzSS === '食伤') {
      r.push(`  你借的是"舞台"——你通过展示才华获得根基。你需要观众,需要被看到。`)
    } else {
      r.push(`  你借的是"人"——你通过社交关系获得根基。你是人在哪里根就在哪里。`)
    }

    // 第五层: 借根的商业模式
    r.push('')
    r.push(`【第五层·商业模式】`)
    r.push(`  你适合做"轻资产"型生意——不需要大量资本投入,你的核心资产是人和关系。`)
    r.push(`  你不适合做重资产/独自完成的事情——你没有"原生底盘",借来的根就是你的底盘。`)

    // 第六层: 借根的边界感
    r.push('')
    r.push(`【第六层·边界感】`)
    r.push(`  借根的人最怕的不是没根,是借了别人的根忘了还。你的核心课题:在依赖人和保持独立之间找到平衡。`)
    r.push(`  借来的根≠你自己的根。借的永远是借的,你得有"离开也能活"的底气。`)

    // 第七层: 大运补根
    r.push('')
    r.push(`【第七层·大运补根】`)
    for (const z of zhis) {
      if (rootMapAll.includes(z)) {
        r.push(`  当大运遇到${z}的时候,你终于有了自己的根——这是你"独立"的十年。把握好。`)
        break
      }
    }

  } else {
    // 有根的情况
    r.push(`━━━ 借根分析(7层逻辑) ━━━`)
    r.push(`你有根——${ownRoots.map(rr => `${rr.posName}柱${rr.zhi}`).join('、')}`)
    r.push('')
    r.push(`你有自己的根,但你要看的是"借出去的根"——你的根有没有被人家借走。`)

    // 看天干透出的十神是否与本根相合
    const jieRootSeen = new Set<string>()
    for (const rr of ownRoots) {
      const rootKey = rr.zhi
      if (jieRootSeen.has(rootKey)) continue
      jieRootSeen.add(rootKey)
      if (LIU_HE[rr.zhi] === zhis[0]) {
        r.push(`你的根${rr.zhi}被年柱合走——你的根在社会关系上。别人借了你的力。你得管好你的资源。`)
      }
    }
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  v8 P0-7: 原局有无判断+全局标记
//  标记每个干支的"原局有/原局无"状态,影响大运流年评估
// ════════════════════════════════════════════════════════════

function yuanJuCheck(riGan: string, gans: string[], zhis: string[], gender: string): string[] {
  const r: string[] = []
  const allChars = [...gans, ...zhis]
  const riWx = wx(riGan)

  r.push(`━━━ 原局有/无全局判断 ━━━`)

  // 四大维度:财官印比食伤的"原局有/无"
  interface YuanJuItem { name: string; has: boolean; source: string; desc: string }
  const items: YuanJuItem[] = []

  // 检查财
  let caiSource: string[] = []
  for (const g of gans) {
    const st = ss(riGan, g)
    if (st === '正财' || st === '偏财') caiSource.push(`天干${g}=${st}`)
  }
  for (const z of zhis) {
    for (const cg of (CANG_GAN[z] || [])) {
      if (sst(riGan, cg) === '财') caiSource.push(`地支${z}藏${cg}=财`)
    }
  }
  items.push({name: '财', has: caiSource.length > 0, source: caiSource.join('; '), desc: '赚钱能力/财运'})

  // 检查官杀
  let guanSource: string[] = []
  for (const g of gans) {
    const st = ss(riGan, g)
    if (st === '正官' || st === '七杀') guanSource.push(`天干${g}=${st}`)
  }
  for (const z of zhis) {
    for (const cg of (CANG_GAN[z] || [])) {
      if (sst(riGan, cg) === '官杀') guanSource.push(`地支${z}藏${cg}=官杀`)
    }
  }
  items.push({name: '官杀', has: guanSource.length > 0, source: guanSource.join('; '), desc: '事业/地位/压力'})

  // 检查印
  let yinSource: string[] = []
  for (const g of gans) {
    const st = ss(riGan, g)
    if (st === '正印' || st === '偏印') yinSource.push(`天干${g}=${st}`)
  }
  for (const z of zhis) {
    for (const cg of (CANG_GAN[z] || [])) {
      if (sst(riGan, cg) === '印') yinSource.push(`地支${z}藏${cg}=印`)
    }
  }
  items.push({name: '印', has: yinSource.length > 0, source: yinSource.join('; '), desc: '学习/背书/靠山'})

  // 检查食伤
  let ssSource: string[] = []
  for (const g of gans) {
    const st = ss(riGan, g)
    if (st === '食神' || st === '伤官') ssSource.push(`天干${g}=${st}`)
  }
  for (const z of zhis) {
    for (const cg of (CANG_GAN[z] || [])) {
      if (sst(riGan, cg) === '食伤') ssSource.push(`地支${z}藏${cg}=食伤`)
    }
  }
  items.push({name: '食伤', has: ssSource.length > 0, source: ssSource.join('; '), desc: '技术/才华/创意'})

  // 检查比劫
  let bjSource: string[] = []
  for (const g of gans) {
    const st = ss(riGan, g)
    if (st === '比肩' || st === '劫财') bjSource.push(`天干${g}=${st}`)
  }
  for (const z of zhis) {
    for (const cg of (CANG_GAN[z] || [])) {
      if (sst(riGan, cg) === '比劫') bjSource.push(`地支${z}藏${cg}=比劫`)
    }
  }
  items.push({name: '比劫', has: bjSource.length > 0, source: bjSource.join('; '), desc: '社交/朋友/竞争'})

  // 输出表格
  for (const item of items) {
    if (item.has) {
      r.push(`✅ ${item.name}→原局有。${item.desc}。来源:${item.source}`)
    } else {
      r.push(`❌ ${item.name}→原局无。${item.desc}缺失。大运流年遇到${item.name}的干支时才是你的财运/官运/学习期。`)
    }
  }

  // 综合解读:缺什么、补什么
  const missing = items.filter(i => !i.has).map(i => i.name)
  const present = items.filter(i => i.has).map(i => i.name)

  r.push('')
  r.push(`原局有:${present.join('、')}`)
  r.push(`原局无:${missing.join('、') || '无(十神俱全)'}`)

  if (missing.length === 0) {
    r.push(`你的命局十神俱全——什么都有但什么都不突出。你的人生没有明显的"短板",但也没有"致命优势"。`)
  } else if (missing.length === 1) {
    r.push(`你只缺${missing[0]}——补上这一个,你的命局就完整了。大运走到${missing[0]}相关的干支就是你人生的转折点。`)
  } else if (missing.length === 2) {
    r.push(`你缺${missing.join('和')}——这两个关键环节会在你人生中大运流年遇到时才触发。你的八字不是静态的,是"等待被补充"的动态结构。`)
  } else {
    r.push(`你缺${missing.join('、')}——这些缺失意味着你的人生需要靠外部力量补全。你不是一个"完整"的人,但正因为缺,你才有动力去追求。`)
  }

  // 实战应用:原局有无决定大运好坏
  r.push('')
  r.push(`实战应用(原局有无的核心价值):`)
  r.push(`- 大运遇到原局有的字 = 道上运,顺风顺水`)
  r.push(`- 大运遇到原局无的字 = 外来运,要么爆发要么翻车`)
  r.push(`- 原局缺的字在大运出现 = 补上了短板,但第一次用不熟,需要适应期`)
  r.push(`- 原局有的字在大运消失(被冲合) = 你的根基被动摇,要小心`)

  return r
}

export default analyzeJudgment
