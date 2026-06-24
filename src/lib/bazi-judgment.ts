/**
 * bazi-judgment.ts - 九宫八字实战断事层 v5
 *
 * 基于九宫高度分析体系 + 29条实战推理规则
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
// 六合人性(03-六合人性拆解)
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

const SAN_HUI: Record<string,string[]> = {'寅':['寅','卯','辰'],'巳':['巳','午','未'],'申':['申','酉','戌'],'亥':['亥','子','丑']}
const SAN_HE: Record<string,string[]> = {'寅':['寅','午','戌'],'巳':['巳','酉','丑'],'申':['申','子','辰'],'亥':['亥','卯','未']}

// 九组自合(R22)
const ZI_HE: string[] = ['辛巳','癸巳','甲午','己亥','壬午','戊子','丙戌','壬戌','丁亥']

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
  // 先看四柱天干
  if (gans.includes(gan)) return true
  // 再看地支藏干
  for (const z of zhis) {
    if ((CANG_GAN[z]||[]).includes(gan)) return true
  }
  return false
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

  // 食伤生财
  let hasSS = false, hasCai = false
  for (const g of gans) { const st = ss(riGan,g); if(isSS(st)) hasSS=true; if(isCai(st)) hasCai=true }
  if (hasSS && hasCai) l.push('🏷️ 八字标签:食伤生财--靠技术/口才/才华吃饭。路子对了赚钱不难。')

  // 官印相生
  let hasGuan = false, hasYin = false
  for (const g of gans) { const st = ss(riGan,g); if(isGuan(st)) hasGuan=true; if(isYin(st)) hasYin=true }
  if (hasGuan && hasYin) l.push('🏷️ 八字标签:官印相生--适合体制/管理岗。能做成事。')

  // 比劫夺财
  let biCount = 0, caiCount = 0
  for (const g of gans) { const st = ss(riGan,g); if(isBJ(st)) biCount++; if(isCai(st)) caiCount++ }
  if (biCount >= 3 && caiCount <= 1) l.push('🏷️ 八字标签:比劫夺财--朋友多花钱快。注意别合伙别担保。')

  // 财旺从商
  if (caiCount >= 2) l.push('🏷️ 八字标签:财旺型--适合做生意/做投资。')

  // 官杀混杂
  let guanCount = 0
  for (const g of gans) { if(isGuan(ss(riGan,g))) guanCount++ }
  if (guanCount >= 2 && gender === '女') l.push('🏷️ 八字标签:官杀混杂--感情上容易有选择困难。建议晚婚。')

  // 印旺耗身
  let yinCount = 0
  for (const g of gans) { if(isYin(ss(riGan,g))) yinCount++ }
  if (yinCount >= 3) l.push('🏷️ 八字标签:印旺耗身--想得多做得少。别内耗,学再多不如动手。')

  // 自合=自信(R22)
  for (const z of zhis) {
    const pos = ['年','月','日','时']
    if (ZI_HE.includes(gans[zhis.indexOf(z)] + z)) {
      l.push(`🏷️ 八字标签:自合型--自己会把自己说得很厉害。自信足。`)
    }
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

  // 根=住的地方(纯结论)
  for (let i = 0; i < zhis.length; i++) {
    if (roots.includes(zhis[i])) {
      const riKu = zhiKu(zhis[2])
      const posKu = zhiKu(zhis[i])
      if (riKu && posKu && riKu === posKu) {
        r.push(`精神上有安全感,住的地方对你很重要。`)
      } else if (i === 0) {
        r.push(`精神上依赖外面,不是本地命。`)
      }
    }
  }

  // 换根=换地方(R9)
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
  // 检查大运的字是否在原局的家里(日时柱)且被家外(年月)合
  for (let i = 2; i < 4; i++) {  // 家里
    if (gans[i] === dg && zhis[i] === dz) {
      // 检查家外是否有字合这个
      for (let j = 0; j < 2; j++) {
        if (LIU_HE[zhis[i]] === zhis[j] || LIU_HE[zhis[j]] === zhis[i]) {
          r.push(`大运来了你${posNames[i]}柱的${dg}${dz}--被${posNames[j]}柱的${zhis[j]}合了(R14:家里字出来被家外合)。家外的人对你的东西有想法--要防着点。`)
        }
      }
    }
  }

  // [4] 信心与运气逆向
  r.push('提醒一句--信心十足时反而要谨慎(可能是坏运前的感觉)。信心不足时反而要大胆(可能是转运起点)。')

  // [5] 婚姻宫
  if (LIU_CHONG[riZhi] === dz) r.push(`大运${dz}冲了你夫妻宫--这十年感情容易波动。`)
  if (LIU_HE[riZhi] === dz) r.push(`大运${dz}合了你夫妻宫--这十年感情上有大变化。`)

  // [6] 弱点的字不喜出来 + 大运好坏四象限
  // 找出最弱五行
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
  // 大运好坏四象限
  // 大运好坏四象限--内部参考,不输出

  // [7] 五行生克
  const sheng: Record<string,string[]> = {'木':['火'],'火':['土'],'土':['金'],'金':['水'],'水':['木']}
  const dWx = wx(dg)
  if (dWx && riWx) {
    if ((sheng[dWx]||[]).includes(riWx)) r.push(`${dg}(${dWx})生${riGan}(${riWx})--这步运能借力。`)
    else if ((sheng[riWx]||[]).includes(dWx)) r.push(`${dg}(${dWx})被${riGan}(${riWx})生--这步运你付出多。`)
  }

  return r
}

// ──── 流年断事(含R5 R16)════════════════════

function flowYearV2(ri: string, pills: {gan:string;zhi:string}[],
  year: number, gender: string): string[] {
  const r: string[] = []
  const gans = pills.map(p=>p.gan)
  const zhis = pills.map(p=>p.zhi)
  const riZhi = zhis[2]
  const yearZhi = zhis[0]
  const [fg, fz] = getFlowGZ(year)

  // R5: 流年来源(含藏干)
  if (isGanInChart(fg, gans, zhis)) {
    r.push(`${year}年(${fg}${fz})--这一年在道上,原局有根。`)
  } else {
    r.push(`${year}年(${fg}${fz})--这一年别瞎折腾,不是你的频道。`)
  }

  // 十神还原
  const fss = sst(ri, fg)
  if (fss === '财') r.push('今年关注钱的事。')
  if (fss === '官杀') r.push('今年工作压力大。')
  if (fss === '印') r.push('今年适合学习进修。')
  if (fss === '食伤') r.push('今年想法多。注意冲动。')
  if (fss === '比劫') r.push('今年朋友多应酬多。')

  // R16: 食伤=说话,流年食伤年注意口头承诺
  if (fss === '食伤') r.push('今年注意口头承诺--说多了容易给自己挖坑。')

  // 地支关系
  if (LIU_CHONG[riZhi] === fz) r.push(`流年${fz}冲你配偶宫--注意感情波动。`)
  if (LIU_HE[riZhi] === fz) r.push(`流年${fz}合你配偶宫--感情有变化。`)
  if (LIU_CHUAN[riZhi] === fz) r.push(`流年${fz}穿你配偶宫--注意隐性矛盾。`)

  // 桃花
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
  for (const v of z) { if (v===rz) continue; if (LIU_CHONG[rz]===v) {r.push('婚姻宫被冲--晚婚能化解。');break} }
  if (r.length===0) r.push('没有明显的晚婚倾向。')
  return r
}

function liHun(ri: string, pills: {gan:string;zhi:string}[], gen: string): string[] {
  const r: string[] = []; const z = pills.map(p=>p.zhi); const rz = z[2]; const g = pills.map(p=>p.gan)
  let hasGen = false
  for (const v of z) { if (v===rz) continue; if (LIU_CHUAN[rz]===v) {r.push('婚姻宫被穿--有克服不了的矛盾。');hasGen=true} if (LIU_CHONG[rz]===v) {r.push('婚姻宫被冲--容易动荡。');hasGen=true} }
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

function healthV2(ri: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []; const g = pills.map(p=>p.gan); const z = pills.map(p=>p.zhi)
  const wc: Record<string,number> = {木:0,火:0,土:0,金:0,水:0}
  for (const v of g) wc[wx(v)]++
  for (const v of z) wc[ZHI_WU_XING[v]]++
  const sorted = Object.entries(wc).sort((a,b)=>a[1]-b[1]); const wst = sorted[0]
  // R28: 弱的要修
  if (wst && wst[1] <= 2) {
    r.push(`注意${WU_XING_ORGAN[wst[0]]}(${WU_XING_SICK[wst[0]]})。这是你要后天补的。`)
    const colorM: Record<string,string[]> = {木:['绿','青'],火:['红','紫'],土:['黄','棕'],金:['白','金'],水:['黑','蓝']}
    const cm = colorM[wst[0]]; if (cm) r.push(`平时多穿${cm.join('/')}色的衣服有帮助。`)
  }
  for (let i=0; i<z.length; i++) for (let j=i+1; j<z.length; j++)
    if (LIU_CHONG[z[i]]===z[j]) r.push(`${z[i]}${z[j]}冲--注意${WU_XING_ORGAN[ZHI_WU_XING[z[i]]]}和${WU_XING_ORGAN[ZHI_WU_XING[z[j]]]}保养。`)
  return r
}

// ──── 父母子女 ────

function parentV2(ri: string, pills: {gan:string;zhi:string;gz?:string}[]): string[] {
  const r: string[] = []; const mg = pills[1].gan; const mss = ss(ri,mg)
  // 纯结论
  const rk = zhiKu(pills[2].zhi), mk = zhiKu(pills[1].zhi)
  if (rk && mk && rk===mk) r.push('能借父母的力,关系近。')
  else r.push('自己的事自己扛,父母帮不上太多。')
  return r
}

function childrenV2(ri: string, pills: {gan:string;zhi:string;gz?:string}[]): string[] {
  const r: string[] = []; const hg = pills[3].gan; const hz = pills[3].zhi; const hs = ss(ri,hg)
  // 纯结论
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

function pref(ri: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []; const z = pills.map(p=>p.zhi); const g = pills.map(p=>p.gan)
  const wc: Record<string,number> = {木:0,火:0,土:0,金:0,水:0}
  for (const v of g) wc[wx(v)]++; for (const v of z) wc[ZHI_WU_XING[v]]++
  const sorted = Object.entries(wc).sort((a,b)=>a[1]-b[1]); const wst=sorted[0], wsg=sorted[sorted.length-1]
  if (wsg && wst && wsg[0]!==wst[0]) {
    r.push(`${wsg[0]}最旺--别太执着,要控制欲望。`)
    r.push(`${wst[0]}最弱--后天要补。`)
    const xi: Record<string,string[]> = {木:['水'],火:['木'],土:['火'],金:['土'],水:['金']}
    const ke: Record<string,string> = {木:'金',火:'水',土:'木',金:'火',水:'土'}
    const x = xi[wst[0]]||[], j = ke[wst[0]]
    if (x.length) r.push(`喜${x.join('、')}。`); if (j) r.push(`忌${j}。`)
  }
  // pref 纯结论
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
  techAbilityNarr: string[]
  moneyMindsetNarr: string[]
  careerLevelNarr: string[]
  tombWareNarr: string[]
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

  // 地支特性
  if (ZHI_NATURE[riZhi]) charNarr.push(ZHI_NATURE[riZhi])

  // 地支六合→人性拆解
  for (let hi = 0; hi < zhis.length; hi++) {
    for (let hj = hi + 1; hj < zhis.length; hj++) {
      if (LIU_HE[zhis[hi]] === zhis[hj]) {
        const key = zhis[hi] < zhis[hj] ? zhis[hi] + zhis[hj] : zhis[hj] + zhis[hi]
        if (HE_REN[key]) charNarr.push(HE_REN[key])
      }
    }
  }

  // 月十神(不暴露宫位,直接说性格)
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
  // careerNarr - 纯结论,不暴露推理
  const mss = sst(riGan,monthGan)
  if (mss==='印') careerNarr.push('追求归属感和稳定。看重团队。')
  if (mss==='财') careerNarr.push('追求收入和回报。')
  if (mss==='官杀') careerNarr.push('有野心追求职位。')
  if (mss==='食伤') careerNarr.push('追求自由,适合创意类。')
  if (mss==='比劫') careerNarr.push('需要伙伴,一个人不行。')

  // 年上十神决定命主追求(用户补充:宫位十神驱动论)
  const yearSS = sst(riGan, pills[0].gan)
  if (yearSS === '财') careerNarr.push('年上是财--你这辈子想赚大钱。做什么事都看有没有钱赚。')
  if (yearSS === '食伤') careerNarr.push('年上是食伤--你这辈子想法大、创意多。适合做产品和技术。')
  if (yearSS === '官杀') careerNarr.push('年上是官杀--你这辈子想干大事业。要地位要名声。')
  if (yearSS === '印') careerNarr.push('年上是印--有高级学历或体面工作。对精神和层次有追求。')
  if (yearSS === '比劫') careerNarr.push('年上是比劫--身边有牛逼的贵人,社会最顶层有朋友。')

  let hG=false, hY=false
  for (const g of gans) { const st=ss(riGan,g); if (isGuan(st)) hG=true; if (isYin(st)) hY=true }
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
  for (const z of zhis) { if (z===riZhi) continue; if (LIU_HE[riZhi]===z) marriageNarr.push('配偶宫被合。'); if (LIU_CHONG[riZhi]===z) marriageNarr.push('配偶宫被冲。'); if (LIU_CHUAN[riZhi]===z) marriageNarr.push('配偶宫被穿。') }
  if (gender==='男') { marriageNarr.push('男命--以财为妻。');marriageNarr.push(...caiXi(riGan,pills))
    const th = TAO_HUA_MAP[yearZhi]; if (th && zhis.includes(th)) marriageNarr.push(`桃花(${th})在${posNames[zhis.indexOf(th)]}柱--${TAO_HUA_POS[zhis.indexOf(th)]}`)
  } else { marriageNarr.push('女命--以官杀为夫。');marriageNarr.push(...guanSha(riGan,pills))
    const th = TAO_HUA_MAP[yearZhi]; if (th && zhis.includes(th)) marriageNarr.push(`桃花(${th})在${posNames[zhis.indexOf(th)]}柱--${TAO_HUA_POS[zhis.indexOf(th)]}`)
  }

  // ──── 其他 ────
  const parentNarrResult = parentV2(riGan, pills)
  const childrenNarrResult = childrenV2(riGan, pills)
  const healthNarrResult = healthV2(riGan, pills)
  const prefNarrResult = pref(riGan, pills)
  const twoSignsResult = twoSignsJudge(riGan, pills, gender)
  const rootHouseResult = rootHouseNarr(riGan, pills)
  const friendModeResult = analyzeFriendMode(riGan, pills)
  const spouseDynamicResult = analyzeSpouseDynamic(riGan, pills, gender)
  const childrenRelationResult = analyzeChildrenRelation(riGan, pills)
  const techAbilityResult = analyzeTechAbility(riGan, pills)
  const moneyMindsetResult = analyzeMoneyMindset(riGan, pills)
  const careerLevelResult = analyzeCareerLevel(riGan, pills, gender)
  const tombWareResult = analyzeTombWarehouse(riGan, pills, gender)

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
    techAbilityNarr: techAbilityResult,
    moneyMindsetNarr: moneyMindsetResult,
    careerLevelNarr: careerLevelResult,
    tombWareNarr: tombWareResult
  }
}

// ──── 深度朋友相处分析(基于西安案例3,5,6)════════════════════

function analyzeFriendMode(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const posNames = ['年','月','日','时']

  const bjIndices: number[] = []
  for (let i = 0; i < gans.length; i++) {
    if (isBJ(ss(riGan, gans[i]))) bjIndices.push(i)
  }

  if (bjIndices.length === 0) {
    r.push('你八字里比劫不多,朋友这块不是你的核心课题。你心里有自己的一小撮人,清清静静的,不需要为了合群去勉强自己。')
    return r
  }

  if (bjIndices.length >= 3) {
    r.push(`你八字里比劫有${bjIndices.length}个,走到哪都容易聚一群人。但你别糊涂--不是每个叫你"兄弟"的人,都真的靠得住。`)
  } else {
    r.push(`你八字里比劫就${bjIndices.length}个,朋友不多但你心里有数。能进你圈子的人,都是你精挑细选过的。`)
  }

  // 比劫的"帽子"(看支的主气藏干的十神类别)
  for (const idx of bjIndices) {
    const bjGan = gans[idx]
    const bjZhi = zhis[idx]
    const pos = posNames[idx]
    const mainCang = (CANG_GAN[bjZhi] || [''])[0]
    const hat = sst(riGan, mainCang)

    if (hat === '印') {
      r.push(`你${pos}柱${bjGan}${bjZhi}这个朋友,戴"印帽子"--他要面子有层次,做事讲体面。你跟他相处千万别驳他面子,吃软不吃硬的主。`)
    } else if (hat === '财') {
      r.push(`你${pos}柱${bjGan}${bjZhi}这个朋友,戴"财帽子"--现实得很,凡事看结果看价值。你能给他带来好处他就是兄弟,你拖他后腿他翻脸比翻书快。`)
    } else if (hat === '官杀') {
      r.push(`你${pos}柱${bjGan}${bjZhi}这个朋友,戴"官杀帽子"--嘴上啥都敢说,真到有风险的事他往后缩。喝酒聊天找他行,一起扛事别指望。`)
    } else if (hat === '食伤') {
      r.push(`你${pos}柱${bjGan}${bjZhi}这个朋友,戴"食伤帽子"--技术型,手上真有活儿。你们聊技术项目很投缘,但别让他碰钱的事。`)
    } else {
      r.push(`你${pos}柱${bjGan}${bjZhi}这个朋友--跟你一个德性,又帮你又跟你抢。`)
    }
  }

  // 同库 vs 不同库 + 借根共根深度(第19轮)
  if (bjIndices.length >= 2) {
    let allSame = true
    let firstV = ''
    for (const idx of bjIndices) {
      const v = zhiKu(zhis[idx])
      if (!firstV) firstV = v
      else if (v !== firstV) { allSame = false; break }
    }
    if (allSame && firstV) {
      r.push(`你心里会觉得"他们跟我想的一样",完全不设防。你们从同一个库里出--这叫"共根",亲兄弟才有的底子。这些人关键时刻能帮到你,但你也别太依赖,人心会变。`)
    } else {
      r.push('平时称兄道弟没问题,利益面前你得多留个心眼。真到有风险的时候,他们先想的是自己怎么脱身。')
    }
  }

  // 边界感
  let allFromOne = true
  let firstKu = ''
  for (const g of gans) {
    const k = BEST_YIN_KU[g] || ''
    if (!firstKu) firstKu = k
    else if (k !== firstKu) { allFromOne = false; break }
  }
  if (allFromOne && firstKu) {
    r.push(`你的八字天干全出${firstKu},天地一气,你这个人没有边界感。别人的事就是自己的事,自己的东西也随便给人用。讲义气是好事,但分不清"你的我的"早晚会吃亏。`)
  }

  // 自合=自信(R22)
  for (const idx of bjIndices) {
    if (ZI_HE.includes(gans[idx] + zhis[idx])) {
      r.push(`你${posNames[idx]}柱的${gans[idx]}${zhis[idx]}这个朋友是自合--特别自信甚至自负。跟他聊天你会发现他不停在夸自己证明自己,嘴上从来不输。你要习惯他这样,别跟他较真。`)
    }
  }

  // 地支行业标签
  for (const idx of bjIndices) {
    const z = zhis[idx]
    if (z === '巳') r.push(`你${posNames[idx]}柱${gans[idx]}${z}这朋友--身上有网络/技术属性,大概率搞互联网、IT或新媒体。`)
    if (z === '酉') r.push(`你${posNames[idx]}柱${gans[idx]}${z}这朋友--身上有金融/精密属性。可能在金融会计行业,或者做事特别较真。`)
    if (z === '申') r.push(`你${posNames[idx]}柱${gans[idx]}${z}这朋友--有平台/法律属性。可能在大平台公司或者做法律相关。`)
  }

  return r
}

// ──── 深度夫妻相处分析(基于西安案例3,4,8)══════════════

function analyzeSpouseDynamic(riGan: string, pills: {gan:string;zhi:string}[], gender: string): string[] {
  const r: string[] = []
  const zhis = pills.map(p => p.zhi)
  const gans = pills.map(p => p.gan)
  const riZhi = zhis[2]
  const posNames = ['年','月','日','时']

  // 配偶宫坐什么
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

  // 配偶宫被冲/合/穿
  for (const z of zhis) {
    if (z === riZhi) continue
    if (LIU_CHONG[riZhi] === z) {
      r.push(`你的配偶宫${riZhi}被${z}冲了--你俩性格一开始就有冲突点。刚在一起的时候吵得厉害,慢慢学会了各退一步。这种关系不能强求对方改变,你得学会包容不同点。`)
    }
    if (LIU_HE[riZhi] === z) {
      r.push(`你的配偶宫${riZhi}被${z}合了--你们的感情不是纯粹的二人世界,总有外力介入。父母、朋友、工作关系,总有人掺合你们的事。你们的问题常常是"外人怎么看"而不是"我们怎么想"。`)
    }
    if (LIU_CHUAN[riZhi] === z) {
      r.push(`你的配偶宫${riZhi}被${z}穿了--有一种说不清的别扭。你觉得不是什么大不了的事,但你另一半心里一直扎着一根刺。这种矛盾最磨人--说出来好像小题大做,不说又一直在那。`)
    }
  }

  // 太极点转换
  r.push('我再从你另一半的角度给你说说--')
  for (const z of zhis) {
    if (z === riZhi) continue
    if (LIU_CHUAN[riZhi] === z) {
      if ((riZhi === '子' && z === '未') || (riZhi === '未' && z === '子')) {
        r.push(`就说${riZhi}${z}穿这个细节:按你的角度看,你是为了孩子的事在管(子水为太极=管孩子)。但换成你另一半的视角,他/她觉得你在故意找事、让他/她下不来台。一个"管孩子"的事,你俩看到的是完全不同的画面。这就是夫妻矛盾的根源--同一件事,不同太极点,结论全反。`)
      }
    }
  }

  // 配偶的品质（根与出处）第8轮扩展
  const spCang = CANG_GAN[riZhi] || []
  for (const cg of spCang) {
    const cgKu = BEST_YIN_KU[cg] || ''
    if (cgKu && zhis.includes(cgKu)) {
      r.push(`你配偶宫里的${cg}从${cgKu}出——根正。你另一半是跟你"共根"的关系，同一个源头的。人品靠得住，不是那种来去匆匆的路人。你们相处起来轻松，因为他/她骨子里跟你是一路人。`)
    } else if (cgKu) {
      r.push(`你配偶宫里${cg}的根在外头——你另一半是"借根"的命。他/她骨子里需要别人的认可、需要别人帮衬。你跟他/她过日子，要多给面子多鼓励。他/她不是故意不靠谱，是先天缺乏安全感。`)
    }
  }

  // 夫星/妻星在合局中还是在被制中（第22轮深度+第8轮女命坐下官杀）
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
          r.push(`你的夫星${fuGan}被${g}合走了——你老公的注意力不完全在你身上。可能有工作上的事、朋友的事占了很大部分。他不是不爱你，是他心里有事没说。`)
          break
        }
      }
      if (fuPos === 2) {
        r.push('夫星坐在你自己的家里——这个婚姻你说了算。你能管住他，他翻不出你的手心。但别管太死，男人要面子。')
      } else if (fuPos < 2) {
        r.push('夫星在外面（年月）——你老公有他自己的世界。工作圈、朋友圈，你有的时候觉得跟他隔了一层。这种婚姻要给空间，别追着查岗。')
      }
    }
    // 女命坐下官杀（第8轮核心）
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
        r.push(`你坐下的${riZhi}（官杀）能管住外面的字——你是能管人的女人。婚姻里你说了算的多，你老公在你的世界里转悠。你是女强人型的感情模式。`)
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
        r.push('妻星坐在你自己的家里——老婆的钱归你管，家里的事你说了算。但也意味着老婆的钱也是你的钱，她的问题也是你的问题。')
      } else if (qiPos < 2) {
        r.push('妻星在外面——老婆有自己赚钱的渠道。你们各自经济独立，但花钱的事得商量着来。')
      }
    }
  }

  // 吵架模式
  for (const z of zhis) {
    if (z === riZhi) continue
    for (const cg of spCang) {
      const cgWx = wx(cg)
      const zWx = zhiWx(z)
      const ke: Record<string, string> = {木:'金',火:'水',土:'木',金:'火',水:'土'}
      if (ke[cgWx] === zWx) {
        r.push(`你们吵架的模式是:你另一半(${cg}属性)做了决定或说了什么,然后被${z}(${zWx})这边给否了。他/她会觉得"你总是跟我对着干"。其实不是针对他/她,是你们看问题的角度本来就不一样。`)
      }
    }
  }

  return r
}

// ──── 深度子女关系分析(基于西安案例3,6,8)══════════════

function analyzeChildrenRelation(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riZhi = zhis[2]
  const hg = gans[3]
  const hz = zhis[3]
  const hs = ss(riGan, hg)

  // 时柱十神决定相处基调
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

  // 子未穿 - 太极点转换
  if ((riZhi === '子' && hz === '未') || (riZhi === '未' && hz === '子')) {
    r.push(`你管孩子管教育,但从孩子的角度,他觉得你在干涉他。你好心管他,他觉得你烦。`)
  }

  // 同库 vs 不同库
  const rk = zhiKu(riZhi)
  const hk = zhiKu(hz)
  if (rk && hk && rk === hk) {
    r.push(`跟孩子关系亲密,你会以身作则。你说的道理自己先做到,孩子也服你。`)
  } else {
    r.push(`多少有点代沟。你理解不了现在的孩子在想什么,孩子也嫌你老土。沟通上要多花心思。`)
  }

  // 子女宫的地支特性
  const hMainCang = (CANG_GAN[hz] || [''])[0]
  const hSt = sst(riGan, hMainCang)
  if (hSt === '比劫') {
    r.push(`孩子宫坐比劫--孩子跟你像兄弟一样。他/她想要的是"跟你站在一起"的感觉,而不是被你管着。`)
  } else if (hSt === '印') {
    r.push(`孩子宫坐印--孩子爱学习爱琢磨,你们可以互相讨论问题。他/她喜欢跟你交流想法,这种亲子关系很健康。`)
  } else if (hSt === '财') {
    r.push(`孩子宫坐财--孩子从小就对自己拥有的东西很在意。他/她会管自己的零花钱、管自己的东西。你在这方面不用太操心。`)
  }

  // 时柱藏干被冲
  for (const cg of (CANG_GAN[hz] || [])) {
    const cgWx = wx(cg)
    for (const z of zhis) {
      if (z === hz) continue
      const zWx = zhiWx(z)
      const ke: Record<string, string> = {木:'金',火:'水',土:'木',金:'火',水:'土'}
      if (ke[cgWx] === zWx) {
        r.push(`你子女宫里的${cg}被${z}冲到了--孩子在外面闯荡的时候可能不太省心。跟同学同事的关系、在外面的事情,你得留心点。`)
      }
    }
  }

  return r
}

// ──── 技术能力深度评估(基于西安案例1,2,5,6)════════════

function analyzeTechAbility(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riWx = wx(riGan)

  // 收集食伤(透干+藏干)
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

  // 食伤的出处决定品质
  for (const si of ssInfo) {
    const ssGan = si.gan
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
          r.push(`你的${ssGan}从${cgKu}出--这库偏印,你的技术有底蕴,是真正学进去的东西,不是花架子。`)
        } else {
          r.push(`你的${ssGan}从${cgKu}出--这库偏比劫,你的技术偏表面功夫,够用但不深入。要成为专家还得再磨一磨。`)
        }
      } else {
        r.push(`你的技术悟性不错,但缺少系统沉淀。你学东西很快,但深度不够。`)
      }
    }
  }

  // 食伤旺相程度(看月令是否生食伤)
  const monthZhi = zhis[1]
  const monthWx = zhiWx(monthZhi)
  const riWxVal = riWx
  const ssWx: Record<string, string> = {木:'火',火:'土',土:'金',金:'水',水:'木'}
  const ssWxVal = ssWx[riWxVal] || ''
  const sheng: Record<string, string[]> = {木:['火'],火:['土'],土:['金'],金:['水'],水:['木']}
  if (ssWxVal && (sheng[monthWx]||[]).includes(ssWxVal)) {
    r.push(`月令${monthZhi}(${monthWx})生你的食伤(${ssWxVal})--你技术处于旺相状态。你对自己的手艺有追求,精益求精,容不得马虎。`)
  } else if (ssWxVal) {
    r.push(`月令${monthZhi}(${monthWx})对你的食伤(${ssWxVal})不算生助--你的技术平平,够用但不算拔尖。要多花时间在专业上磨练。`)
  }

  // 食伤是否受制/被合
  const ht: Record<string, string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
  for (const si of ssInfo) {
    for (const g of gans) {
      if (g === si.gan) continue
      if (ht[si.gan + g] || ht[g + si.gan]) {
        r.push(`你的${si.gan}(食伤)被${g}合走了--你有技术但发挥不出来。不是能力不行,是时机不对或者被其他事情牵制住了。`)
      }
    }
    for (const z of zhis) {
      if (z === si.zhi) continue
      if (LIU_CHONG[z] === si.zhi || LIU_CHONG[si.zhi] === z) {
        r.push(`你的${si.gan}对应的地支${si.zhi}被${z}冲了--技术这条路不太平,你要经历磨练才能出彩。遇到的挫折都是在帮你磨刀。`)
      }
    }
  }

  // 食伤+财 = 靠技术变现;食伤+官杀 = 靠技术拿地位
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

  // 巳火=网络/技术标签
  if (zhis.includes('巳') || gans.includes('丙') || gans.includes('丁')) {
    r.push('你的八字里有巳火或者丙丁火--你跟互联网、网络技术有缘分。你的技术方向可能跟数字化、网络相关。')
  }

  return r
}

// ──── 赚钱心态深度分析(基于西安案例2,5,7)══════════════

function analyzeMoneyMindset(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const posNames = ['年','月','日','时']

  // 找财星位置
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

  // 财星位置决定花钱态度
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

  // 财被合 = 想赚轻松钱
  const ht: Record<string, string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
  if (caiFound && caiGan) {
    for (const g of gans) {
      if (g === caiGan) continue
      if (ht[g + caiGan] || ht[caiGan + g]) {
        r.push(`你的财星${caiGan}被${g}合了--你想赚轻松钱、快钱。别人说有个好项目来钱快,你就容易上头。你这种心态特别容易被忽悠,合伙做生意要格外小心,合财的人必须自己亲自盯着。`)
      }
    }
  }

  // 弱财
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

  // 原局有财 vs 无财
  if (caiFound) {
    r.push('你八字里财星是透出来的--你对钱这件事在道上,知道自己该赚什么钱、不该赚什么钱。能掌控自己的财务状况。')
  } else {
    r.push('你八字里没有透出财星--财来财去留不住。你赚钱靠运气,花钱靠心情。建议你有钱先买固定资产或存定期,别放手里,放手里就会花掉。')
  }

  // 比劫夺财
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

  // 合财心态
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
//  50轮深度--新增:官运层次判定(第46轮完整链路)
// ════════════════════════════════════════════════════════════

function analyzeCareerLevel(
  riGan: string, pills: {gan:string;zhi:string}[], gender: string
): string[] {
  const r: string[] = []
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const posNames = ['年','月','日','时']
  const riZhi = zhis[2]

  // [1] 年上十神 = 背景(非追求)
  const yearSS = sst(riGan, gans[0])
  if (yearSS === '官杀') r.push('家里有做官的路子--这是吃公家饭的底子。')
  else if (yearSS === '印') r.push('家里有文化底蕴、有体面人--社会资源不愁。')
  else if (yearSS === '比劫') r.push('家里有能人--亲戚朋友中有人混得不错。')
  else if (yearSS === '财') r.push('家里经济条件不错--从小不缺钱。')
  else if (yearSS === '食伤') r.push('家里有手艺传承--耳濡目染有技术底子。')

  // [2] 坐下官杀制别人 = 管理能力(第8轮核心)
  const riZhiMain = (CANG_GAN[riZhi] || [''])[0]
  const riZhiSt = sst(riGan, riZhiMain)
  let sitGuanNengLi = false
  if (riZhiSt === '官杀') {
    // 看坐下的官杀能否制别人--制月令或制年柱
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

  // [3] 宫位定级别(第1轮+第46轮)
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

  // 级别判断优先级:年 > 月 > 日 > 时
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
    // 官星在藏干
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

  // [4] 绳子牛结构(第5轮+第46轮)
  // 判断绳子(功神/手段)和牛(目标)
  // 简化版:月令+时支的能量方向 = 绳子;被制的地支 = 牛
  const monthZhi = zhis[1]
  const hourZhi = zhis[3]
  const sheng: Record<string, string[]> = {木:['火'],火:['土'],土:['金'],金:['水'],水:['木']}
  const ke: Record<string, string[]> = {木:['土'],火:['金'],土:['水'],金:['木'],水:['火']}
  const monthWx = zhiWx(monthZhi)
  const hourWx = zhiWx(hourZhi)
  const riWx = wx(riGan)

  // 绳子 = 命主自己的团队/手段方向
  // 牛 = 命主想得到的
  if (riZhiSt === '官杀' || riZhiSt === '印') {
    r.push('坐下的力量是你的绳子--管人的能力是你最大的武器。')
  }
  if (riZhiSt === '财') {
    r.push('坐下的力量是你的牛--你这辈子围着钱转。钱是你的目标也是你的牵绊。')
  }
  if (riZhiSt === '食伤') {
    r.push('坐下的力量是你的绳子--技术能力是你最大的底气。')
  }

  // [5] 墓库开闭(第4轮+第48轮)
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

  // [6] 反局风险(第14轮+第48轮)
  // 天干无合 = 最怕大运合主
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

  // [7] 比劫争官(第37轮)
  let bjCount = 0
  for (const g of gans) { if (isBJ(ss(riGan, g))) bjCount++ }
  if (bjCount >= 2 && hasGuanOnYear) {
    r.push('比劫多且官在年上--同事竞争激烈。你上面有人下面也有人盯着你。靠资历稳扎稳打,别走歪门邪道。')
  }

  return r
}

// ════════════════════════════════════════════════════════════
//  50轮深度--新增:墓库开闭分析(第4轮+第15轮+第48轮)
// ════════════════════════════════════════════════════════════

function analyzeTombWarehouse(
  riGan: string, pills: {gan:string;zhi:string}[], gender: string
): string[] {
  const r: string[] = []
  const zhis = pills.map(p => p.zhi)
  const gans = pills.map(p => p.gan)

  // 找出所有墓库地支
  const kus = ['辰','戌','丑','未']
  const kuInChart: string[] = []
  for (const z of zhis) { if (kus.includes(z)) kuInChart.push(z) }

  // 辰戌丑未各自的含义(第4轮扩展)
  const kuMeaning: Record<string, string> = {
    '辰':'水库(藏着戊乙癸)--主教育、池塘、包容万象。辰是万物之库,能量最大。',
    '戌':'火库(藏着戊辛丁)--主政府、互联网、房地产、光明。戌藏辛金可以脆金,能量大但偏燥。',
    '丑':'金库(藏着己癸辛)--主阴暗、部队、刀枪、黑社会。丑晦火力度极强,一个丑可晦六个巳。',
    '未':'木库(藏着己丁乙)--主医药、农作物、花草。未脆金克水,未戌都是燥土。'
  }

  for (const ku of kuInChart) {
    if (kuMeaning[ku]) r.push(`八字有${ku}库--${kuMeaning[ku]}`)
  }

  // 检测开库
  // 辰戌冲 = 开库;丑未冲 = 开库;丑未戌三刑 = 开库(第4轮)
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
        r.push(`${zhis[i]}${zhis[j]}冲--库门被冲开了。库里的能量可以用了。`)
      }
      // 丑未戌三刑(三个都有才算)
      const hasChou = zhis.includes('丑'), hasWei = zhis.includes('未'), hasXu = zhis.includes('戌')
      if (hasChou && hasWei && hasXu) {
        r.push('丑未戌三刑齐全--这是最强开库方式。库门大开,能量倍数释放。你的人生大起大落,但学到的东西也多。')
      }
    }
  }

  // 检测闭库(六合闭库:卯戌合闭戌库,辰酉合闭辰库等)
  const heCloseMap: Record<string, string> = {'卯':'戌','戌':'卯','辰':'酉','酉':'辰','丑':'子','子':'丑','未':'午','午':'未','寅':'亥','亥':'寅','巳':'申','申':'巳'}
  for (const hz of zhis) {
    const target = heCloseMap[hz]
    if (target && zhis.includes(target) && ['辰','戌','丑','未'].includes(target)) {
      r.push(`${hz}合${target}--${target}库被合闭了。库门关着,里面的东西等于没有,要用得等到大运冲开。`)
    }
  }

  // 巳火变色龙检测(第13轮)
  if (zhis.includes('巳')) {
    const hasChou = zhis.includes('丑')
    const hasYou = zhis.includes('酉')
    const hasShen = zhis.includes('申')

    if (hasChou && hasYou) {
      r.push('巳酉丑三合--巳火跟酉丑一起变了金,不再当火用。本来是火性的一面被压制了,变成金的工具。你的性格里有些时候会突然变得特别实际、理性,跟平时的热情判若两人--这是巳火变色龙的特性。')
    } else if (hasShen) {
      // 巳申只出现两个,看火金力量
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

  // 丑晦火检测(第4轮)
  if (zhis.includes('丑') && zhis.some(z => ['巳','午'].includes(z))) {
    const hasSi = zhis.includes('巳'), hasWu = zhis.includes('午')
    const count = (hasSi ? 1 : 0) + (hasWu ? 1 : 0)
    r.push(`丑去晦${hasSi?'巳':''}${hasWu?'午':''}火--一个丑可以晦六个火。这${count}个火被丑土压着,你的热情和动力被现实压住了。有劲使不出来。`)
  }

  // 入墓检测
  // 日主最怕入墓(第48轮:入墓=身体受限制)
  const riZhi = zhis[2]
  const riWx = wx(gans[2])
  const kuForGan: Record<string, string[]> = {
    '木':['未'],'火':['戌'],'土':['辰','戌'],'金':['丑'],'水':['辰']
  }
  const targetKu = (kuForGan[riWx] || [])
  for (const z of zhis) {
    if (targetKu.includes(z) && z !== riZhi) {
      r.push(`日主${gans[2]}(${riWx})被${z}墓收--身体或精神上容易受束缚。大运走入库的时候,人生低谷,做什么都压抑。`)
    }
  }

  if (r.length === 0) {
    r.push('命局没有明显的墓库--人生起伏不大,稳定型。不需要经历大苦大难就能过好自己的日子。')
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

export default analyzeJudgment
