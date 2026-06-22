/**
 * bazi-deep-enhance.ts — 九宫八字深层分析补丁
 *
 * 源自九宫八字深层分析知识库
 * 补充 六合人性拆解、十神宫位心性、五行根基特性、换象、三会
 *      大运流年断事、比劫分析、贵人分析、干支自合精深
 *
 * 与 bazi-deep.ts 配合使用，作为扩展分析模块
 */

import type { PillarInfo } from './bazi-engine'
import { wxM, ssM } from './bazi-engine'

// ── 地支藏干 ──
const CANG_GAN: Record<string, string[]> = {
  '子':['癸'],'丑':['己','癸','辛'],'寅':['甲','丙','戊'],'卯':['乙'],
  '辰':['戊','乙','癸'],'巳':['丙','庚','戊'],'午':['丁','己'],'未':['己','丁','乙'],
  '申':['庚','壬','戊'],'酉':['辛'],'戌':['戊','辛','丁'],'亥':['壬','甲']
}

// ── 六合换象（最亲密换象） ──
const HUAN_XIANG: Record<string, string> = {
  '子丑':'癸酉','寅亥':'壬寅','卯戌':'甲戌','辰酉':'癸酉','巳申':'丙申','午未':'丁卯'
}

// ── 六合人性拆解（深层） ──
const LIU_HE_REN_XING: Record<string, string[]> = {
  '子丑': [
    '子丑合：丑土克子水但有相同癸水。丑土想让子水听话（给面子/荣誉），子水想得到事业和能力认可。',
    '丑土为主：给员工要夸奖荣誉，金日主和员工打成一片，木日主教技术，戊子日主放权给比劫管。',
    '子水为主：想得到事业不想被管。壬子日主管员工要放权不可过度约束。丙子日主员工会夸老板要权力。',
    '甲子日主会不停给员工上课但员工已有想法不愿被干预。戊子日主以结果为导向要求员工出成绩。',
  ],
  '寅亥': [
    '寅亥合：亥水生寅木，壬丙冲暗藏。亥水控制寅木自由（旺时控制/弱时关心），寅木希望被认可夸赞。',
    '以亥水为主：嘘寒问暖事事操心。辛巳/辛亥日主喜欢打听比劫的事。己亥日主要求朋友听自己的。',
    '以寅木为主：弱时妥协旺时反控。亥水在旺点给钱就开心（食伤生财）。亥水合伙人要定期分红吃喝。',
    '戊寅日主一片财（寅多），对结果执着要掌控全局。庚寅日主抵触应酬。',
  ],
  '卯戌': [
    '卯戌合：卯木生戌土火，但无共同藏干最难同频。卯木控制欲强（表里都要控），戌土很难认可卯木。',
    '卯木为主：管你就是对你好(合克)。月卯日戌最痛苦——卯木要求太高戌土达不到。卯木不罢休要赢。',
    '戌土为主：让卯木先做到再要求。很难相信卯木，要求以结果为导向。戌土想法大但越做越小。',
    '丙寅日主卯戌合，母亲管教严格（坤造）。乙卯日主禄合财，做事亲力亲为关心朋友。',
  ],
  '辰酉': [
    '辰酉合：辰土生酉金（乙辛冲），无共同藏干很难同频。辰土教育酉金挑毛病，酉金不服反制。',
    '辰土为主：以结果为导向专挑酉金不喜欢的说。不要要求同频，各自完成目标即可。',
    '酉金为主：认为辰土的一切是自己给的。辰土夸赞认可就开心。希望辰土体谅帮自己。',
  ],
  '巳申': [
    '巳申合：巳火克申金，有共同戊土庚金（同频基础），但壬丙冲谁也不服谁。最终相互妥协。',
    '巳火为主：认为申金和自己想法一致。说一个条件申金也说一个。巳火最吃软。',
    '申金为主：希望巳火不要变太多又希望会变通。总认为巳火不如自己。会先卖惨诉苦。',
  ],
  '午未': [
    '午未合：午火生未土，有共同丁火己土，唯一相互生的六合。最容易达成共识好相处。',
    '午火为主：自来熟喜欢奉献没有私心。和未土聊过往，需要认可才生。',
    '未土为主：认为午火帮自己是理所应当。不分家里家外。想改造午火变成自己。会觉得午火不如自己。翻旧账。',
  ],
}

// ── 十神宫位心性（月柱/时柱） ──
const SHI_SHEN_MONTH: Record<string, string> = {
  '食神':'月柱食神：喜欢和朋友吃喝玩乐看热闹，对未知有探索欲。共情能力强（食神感同身受）。',
  '伤官':'月柱伤官：思维敏捷灵感多，孤傲偏激。想法多什么都敢尝试。会八卦有善心。',
  '正财':'月柱正财：喜欢直接给答案不废话。出手大方，用钱解决事。和异性关系好易得好感。',
  '偏财':'月柱偏财：和正财类似但更有冒险精神。出手大方。希望被朋友认可有义气。',
  '正官':'月柱正官：身边易出小人（尤其七杀）。心性不稳变化快。要么不做要么做完美。怕麻烦。',
  '七杀':'月柱七杀：比正官更易招小人。行动力强但易冲动。记仇。要求高甚至完美主义。',
  '正印':'月柱正印：喜欢培训学习新东西。人际关系好。容易相信人被利用。无边界感爱打探。在意别人看法。',
  '偏印':'月柱偏印：比正印更重视技术钻研。善良但易被骗。在意他人评价。有收集癖。',
  '比肩':'月柱比肩：四处有朋友。不会看不起任何人。观察朋友喜好。实践型不爱空学。',
  '劫财':'月柱劫财：比比肩更善社交。竞争意识强。为朋友出头。喜欢被关注。',
}

const SHI_SHEN_HOUR: Record<string, string> = {
  '食神':'时柱食神：喜欢自己研究动手做出来有满足感。挑剔认为不够完美。沉浸在自己世界。对朋友很好。',
  '伤官':'时柱伤官：受委屈自我消化安慰。先让自己开心。受不了就逃离。共情能力小于食神（更理智）。',
  '正财':'时柱合财：迟早自己干不长期打工。对钱财欲望不算大更看重才华。目标坚定不轻易改变。',
  '偏财':'时柱偏财：投资创业倾向强。做事有目标。失败也不放弃另想办法。重才华轻钱财。',
  '正官':'时柱正官：脾气时好时坏捉摸不定。有危机意识。喜欢出去逛。胆小怕神鬼。擅长观察环境。',
  '七杀':'时柱七杀：比正官更明显。不安全感强。直觉灵验（坏事预感）。',
  '正印':'时柱正印：自信不被打倒。内心强大靠自己。对面子不太在意（不触底线）。沉得住气。能保守秘密。',
  '偏印':'时柱偏印：比正印更执着。技术型人才。能坚持底线。可靠的朋友。冷静有标准。',
  '比肩':'时柱比肩：自娱自乐。认定一个人就对他好到极致。顽强自我意识难被改变。',
  '劫财':'时柱劫财：对比肩更执着于人际关系。愿意付出但不求回报。',
}

// ── 五行日主根基特性 ──
const WU_XING_RI_ZHU: Record<string, string> = {
  '木':'木日主在地支根基中最多的是财（辰未），所以木日主做事以结果为导向。其次是印（亥中木气/辰中印库），希望得到认可。',
  '火':'火日主在地支最多的是食伤（自由），所以追求自由。火需要木生，所以比其他日主更缺乏安全感、要面子。',
  '土':'土日主在地支最多的是比劫，所以在乎比劫认可、想得多、包容、内耗。土旺无固定原则，随遇而安，随环境改变状态。',
  '金':'金日主在地支最多的是印（面子），经常抹不开面子不会拒绝。其次是官杀（戌/巳），对自己要求高、约束多。辛酉庚子庚申日主给人严肃感。',
  '水':'水日主在地支最多的是官杀（事业追求），金水一家，自我要求高、约束大、对事业有追求。',
}

// ── 日主各类根的最佳借根 ──
const BEST_ROOT: Record<string, string> = {
  '火日主':'未土/戌土/寅木',
  '木日主':'辰土/未土/亥水',
  '土日主':'巳火(午火)/戌土/未土',
  '金日主':'丑土/戌土',
  '水日主':'丑土/辰土/申金',
}

// ── 三会 ──
const SAN_HUI: Record<string, {desc:string; goal:string}> = {
  '寅卯辰': {desc:'寅卯辰三会木局 — 一致性去克辰土。目的明确：库代表要做的事和目标。', goal:'辰土（财/官杀库）'},
  '巳午未': {desc:'巳午未三会火局 — 一致性去生未土。目的明确团结一致。', goal:'未土（印/食伤库）'},
  '申酉戌': {desc:'申酉戌三会金局 — 一致性被年上生。有共同目标。', goal:'戌土（印/财库）'},
  '亥子丑': {desc:'亥子丑三会水局 — 一致性被年上克。最想做官杀方面的事。', goal:'丑土（官杀/印库）'},
}

// ── 干支自合详解（追求方向） ──
const ZI_HE_DETAIL: Record<string, string> = {
  '甲午':'甲己合（合财）— 一生追求财富和成果。甲己合的人是求财最执着的。',
  '丙戌':'丙辛合（合财/官杀）— 追求名利双收。合的是戌土中的辛金(财)和丁火(印)。',
  '丁亥':'丁壬合（合官杀/财）— 追求事业和权力。对官杀有执念。',
  '戊子':'戊癸合（合财）— 追求财富和结果。戊子日主最务实。',
  '己亥':'甲己合（合官杀/财）— 追求事业认可和财富。甲己合官杀更明显。',
  '辛巳':'丙辛合（合官杀/财）— 追求权力和财富。辛巳日主意愿强烈。',
  '壬午':'丁壬合（合财/官杀）— 追求财富和事业成就。',
  '壬戌':'丁壬合（合财/印）— 追求财富和名声。壬戌自合印库。',
  '癸巳':'戊癸合（合官杀）— 追求事业地位和稳定。',
  '庚辰':'乙庚合（合印/财）— 追求知识和财富结合。',
  '乙巳':'乙庚合（合财/官杀）— 追求财富和事业。',
}

// ── 比劫类型 ──
function describeBiJie(riGan: string, pills: PillarInfo[]): string[] {
  const r: string[] = []
  const monthP = pills[1]
  const monthGan = monthP.gan
  const monthSS = ssM[riGan]?.[monthGan] || ''
  const monthZhi = monthP.zhi

  if (ssM[riGan]?.[monthGan] === '比肩' || ssM[riGan]?.[monthGan] === '劫财') {
    const biType = monthSS
    r.push(`月干为${biType} → ${biType === '比肩' ? '比肩为用：志同道合的朋友多' : '劫财为用：朋友虽多需防破财'}`)
  }

  // 比劫宫合了家里什么
  const riZhi = pills[2].zhi
  const lhPairs = ['子丑','寅亥','卯戌','辰酉','巳申','午未']
  for (const pair of lhPairs) {
    const p1 = pair[0], p2 = pair[1]
    if ((monthZhi === p1 && riZhi === p2) || (monthZhi === p2 && riZhi === p1)) {
      r.push(`比劫宫${monthZhi}合了日支${riZhi} — 比劫会惦记命主家里的东西，需注意。`)
    }
  }
  return r
}

// ── 贵人分析 ──
function describeGuiRen(riGan: string, pills: PillarInfo[]): string[] {
  const r: string[] = []
  const yearP = pills[0]
  const yearZhi = yearP.zhi
  const monthP = pills[1]
  const monthZhi = monthP.zhi
  const riZhi = pills[2].zhi
  const hourZhi = pills[3].zhi

  // 年上贵人分析
  r.push(`年柱${yearP.gz}代表贵人/大领导。年上能量大力量小。`)

  // 检查年上是否有共根
  const allZhi = [yearZhi, monthZhi, riZhi, hourZhi]
  const kuZhi = ['辰','戌','丑','未']
  for (const kz of kuZhi) {
    if (yearZhi === kz) {
      // 检查其他地支是否也有这个库或共享气
      const count = allZhi.filter(z => z === kz).length
      if (count >= 2) {
        r.push(`年上与家里共根${kz} — 有贵人帮助，共根亲密度高。`)
      } else {
        // 检查日主是否借根于年上
        r.push(`年上${kz}${kz === '辰'?'水库':kz === '戌'?'火库':kz === '丑'?'金库':'木库'}，但未与家里共根，需大运流年填实才能贵人相助。`)
      }
    }
  }

  // 检查年上字与家里是否有刑冲破害合的关系
  const yearRiPairs = [yearZhi + riZhi, riZhi + yearZhi]
  const liuHePairs = ['子丑','寅亥','卯戌','辰酉','巳申','午未']
  const chongPairs = ['子午','丑未','寅申','卯酉','辰戌','巳亥']
  const chuanPairs = ['子未','丑午','寅巳','卯辰','酉戌','申亥']
  
  for (const pair of liuHePairs) {
    if (yearRiPairs.includes(pair)) {
      r.push(`年支${yearZhi}与日支${riZhi}相合 — 贵人亲密度高，可直接得到年上贵人帮助。`)
    }
  }
  for (const pair of chongPairs) {
    if (yearRiPairs.includes(pair)) {
      r.push(`年支${yearZhi}与日支${riZhi}相冲 — 与年上贵人关系不顺畅，需借助他人。`)
    }
  }

  return r
}

// ── 大运流年基础框架 ──
function describeDaYunFramework(riGan: string, birthYear: number, pills: PillarInfo[]): string[] {
  const r: string[] = []
  const yearP = pills[0]
  const monthP = pills[1]
  const riZhi = pills[2].zhi
  const hourP = pills[3]
  
  r.push('大运看法核心要点：')
  r.push('1. 大运看控制权 — 大运的字是谁控制的？年上/月上/家里？')
  r.push('2. 大运的字能否生到命主家里？生了家里好字就好，坏了坏字就不好。')
  r.push(`3. 月令${monthP.zhi}是全局力量最大点，大运以月令为基准定旺相休囚死。`)
  r.push(`4. 时支${hourP.zhi}是另一个旺点，影响内心世界。`)
  r.push('5. 年上的字出来的大运最危险（能量大力量小），容易冲动投资。')
  r.push('6. 信心十足时大概率是坏运（急于求成）；信心不足时大概率是好运（稳中求进）。')
  r.push('')
  r.push('流年看法核心要点：')
  r.push('1. 以流年和原局为主。看流年这两个字跟原局的作用关系。')
  r.push('2. 看流年是不是原局的字或原局的换象。')
  r.push('3. 看流年的出处和是谁的（谁能控制）。')
  r.push('4. 谁能控制流年的字——家里控制还是家外控制。')
  r.push('5. 根据流年字的十神还原具体事情。')
  r.push('6. 随着流年不断换太极点，看什么事换什么太极点。')

  return r
}

// ── 日主根基分析 ──
export function analyzeRiZhuGenJi(pills: PillarInfo[], riGan: string): string[] {
  const r: string[] = []
  const riWx = wxM[riGan] || ''
  const riZhi = pills[2].zhi

  // 五行特性
  if (WU_XING_RI_ZHU[riWx]) {
    r.push(`【${riWx}日主特性】${WU_XING_RI_ZHU[riWx]}`)
  }

  // 最佳借根
  const bestRootKey = `${riWx}日主`
  if (BEST_ROOT[bestRootKey]) {
    r.push(`最佳借根：${BEST_ROOT[bestRootKey]}`)
  }

  // 当前地支的根
  const rootZhi: Record<string, string[]> = {
    '火':['寅','巳','午','未','戌'],'木':['寅','卯','辰','未','亥'],
    '土':['寅','辰','巳','午','未','申','戌','丑'],
    '金':['巳','申','酉','戌','丑'],'水':['辰','申','亥','子','丑'],
  }
  const roots = rootZhi[riWx] || []
  const allZhi = pills.map(p => p.zhi)
  const foundRoots = allZhi.filter(z => roots.includes(z))
  if (foundRoots.length > 0) {
    r.push(`命主在地支中的根：${foundRoots.join('、')}`)
  } else {
    r.push(`命主在地支无根，需要大运帮助。`)
  }

  // 共根/借根分析
  const kuRoot: Record<string, string[]> = {
    '火':['戌','未'],'木':['辰','未'],'土':['辰','戌','丑','未'],
    '金':['戌','丑'],'水':['辰','丑'],
  }
  const kuRoots = kuRoot[riWx] || []
  const foundKu = allZhi.filter(z => kuRoots.includes(z))
  if (foundKu.length > 0) {
    for (const k of foundKu) {
      const pos = ['年','月','日','时'][allZhi.indexOf(k)]
      r.push(`${pos}柱${k}是${riWx}的出处 — ${pos === '年' ? '可以借到祖上的力' : pos === '月' ? '可以借到父母的力朋友多' : pos === '日' ? '自己有大本营' : '晚年有福'}`)
    }
  }

  return r
}

// ── 深层六合人性分析 ──
export function analyzeLiuHeRenXing(pills: PillarInfo[], riGan: string): string[] {
  const r: string[] = []
  const zhis = pills.map(p => p.zhi)
  const lhPairs = ['子丑','寅亥','卯戌','辰酉','巳申','午未']

  for (const pair of lhPairs) {
    const a = pair[0], b = pair[1]
    if (zhis.includes(a) && zhis.includes(b)) {
      const desc = LIU_HE_REN_XING[pair] || LIU_HE_REN_XING[b + a]
      if (desc) {
        r.push(`【${a}${b}合】`)
        desc.forEach(d => r.push(d))
      }

      // 换象
      const hx = HUAN_XIANG[pair] || HUAN_XIANG[b + a]
      if (hx) {
        r.push(`最亲密换象：${hx}年。遇此年份关係变动明显。`)
        // 附加换象组合
        const allPairs: Record<string, string[]> = {
          '子丑':['庚子','癸酉','壬申'], '寅亥':['癸卯','壬寅','甲子','乙亥'],
          '卯戌':['甲午','乙巳','丁卯','丙寅'], '辰酉':['癸酉','壬申','辛亥','庚子'],
          '巳申':['丙申','丁酉','庚午','辛巳'], '午未':['甲午','丁卯','乙巳','丙寅'],
        }
        const xPairs = allPairs[pair] || allPairs[b + a]
        if (xPairs) {
          r.push(`全换象：${xPairs.join('、')}`)
        }
      }
    }
  }
  return r
}

// ── 十神宫位心性分析 ──
export function analyzeShiShenGongWei(pills: PillarInfo[], riGan: string): string[] {
  const r: string[] = []
  const monthP = pills[1]
  const hourP = pills[3]
  const monthGan = monthP.gan
  const hourGan = hourP.gan

  const monthSS = ssM[riGan]?.[monthGan] || ''
  const hourSS = ssM[riGan]?.[hourGan] || ''

  if (monthSS && SHI_SHEN_MONTH[monthSS]) {
    r.push(`【月柱十神 — ${monthSS}】${SHI_SHEN_MONTH[monthSS]}`)
  }
  if (hourSS && SHI_SHEN_HOUR[hourSS]) {
    r.push(`【时柱十神 — ${hourSS}】${SHI_SHEN_HOUR[hourSS]}`)
  }

  // 月令十神也判断
  const monthZhiGan = CANG_GAN[monthP.zhi]?.[0] || ''
  if (monthZhiGan) {
    const zhiSS = ssM[riGan]?.[monthZhiGan] || ''
    if (zhiSS && zhiSS !== monthSS) {
      r.push(`月令（${monthP.zhi}）藏干主气为${monthZhiGan}（${zhiSS}），对命主有深层影响。`)
    }
  }

  return r
}

// ── 三会分析 ──
export function analyzeSanHui(pills: PillarInfo[]): string[] {
  const r: string[] = []
  const zhis = pills.map(p => p.zhi)

  // 检查各三会
  const groups: Record<string, string[]> = {
    '寅卯辰':['寅','卯','辰'],
    '巳午未':['巳','午','未'],
    '申酉戌':['申','酉','戌'],
    '亥子丑':['亥','子','丑'],
  }

  for (const [key, elements] of Object.entries(groups)) {
    const found = elements.filter(e => zhis.includes(e))
    if (found.length === 3) {
      const info = SAN_HUI[key]
      if (info) {
        const pos = zhis.indexOf(elements[0])
        const posName = ['年','月','日','时'][pos] || ''
        r.push(`【${key}三会${info.desc}】`)
        r.push(`三会局中${key}俱全，会局在${posName}柱，目标指向${info.goal}。`)
        
        // 看三会中每个字的宫位
        const posNames = ['年', '月', '日', '时']
        for (const e of elements) {
          const idx = zhis.indexOf(e)
          if (idx >= 0) {
            r.push(`  ${e}在${posNames[idx]}柱`)
          }
        }
      }
    } else if (found.length >= 2) {
      const info = SAN_HUI[key]
      const semicolon = found.join('、')
      r.push(`有${semicolon}会${key[0]}方的趋势（缺${elements.filter(e => !found.includes(e)).join('、')}），有共同目标但力量不完整。`)
    }
  }

  return r
}

// ── 比劫分析 ──
export function analyzeBiJie(pills: PillarInfo[], riGan: string): string[] {
  return describeBiJie(riGan, pills)
}

// ── 贵人分析 ──
export function analyzeGuiRen(pills: PillarInfo[], riGan: string): string[] {
  return describeGuiRen(riGan, pills)
}

// ── 大运流年框架 ──
export function analyzeDaYunLiuNian(pills: PillarInfo[], birthYear: number): string[] {
  // Need riGan for 10-spirit analysis
  const riGan = pills[2].gan
  return describeDaYunFramework(riGan, birthYear, pills)
}

// ── 干支自合深层 ──
export function analyzeZiHeDeep(pills: PillarInfo[]): string[] {
  const r: string[] = []
  for (const p of pills) {
    if (ZI_HE_DETAIL[p.gz]) {
      r.push(`【${p.gz}】${ZI_HE_DETAIL[p.gz]}`)
    }
  }
  return r
}

// ── 统一增强分析入口 ──
export interface DeepEnhancedResult {
  riZhuGenJi: string[]
  liuHeRenXing: string[]
  shiShenGongWei: string[]
  sanHui: string[]
  biJie: string[]
  guiRen: string[]
  daYunLiuNian: string[]
  ziHeDeep: string[]
}

export function deepEnhancedAnalysis(
  pills: PillarInfo[],
  riGan: string,
  birthYear: number
): DeepEnhancedResult {
  if (!pills || pills.length < 4) {
    return {
      riZhuGenJi: [], liuHeRenXing: [], shiShenGongWei: [],
      sanHui: [], biJie: [], guiRen: [], daYunLiuNian: [], ziHeDeep: []
    }
  }

  return {
    riZhuGenJi: analyzeRiZhuGenJi(pills, riGan),
    liuHeRenXing: analyzeLiuHeRenXing(pills, riGan),
    shiShenGongWei: analyzeShiShenGongWei(pills, riGan),
    sanHui: analyzeSanHui(pills),
    biJie: describeBiJie(riGan, pills),
    guiRen: describeGuiRen(riGan, pills),
    daYunLiuNian: describeDaYunFramework(riGan, birthYear, pills),
    ziHeDeep: analyzeZiHeDeep(pills),
  }
}

export default deepEnhancedAnalysis
