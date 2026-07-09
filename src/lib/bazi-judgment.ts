/**
 * bazi-judgment.ts - 九宫八字实战断事层 v6
 *
 * 主入口文件：导入各子模块并统一导出
 *
 * 子模块：
 *   bazi-judgment-shared.ts     — 常量、查找表、工具函数
 *   bazi-judgment-decade.ts     — 大运/流年/婚姻专项判断
 *   bazi-judgment-analysis.ts   — 各领域深度分析函数
 *   bazi-judgment-insight.ts    — 深度洞察引擎(v8 P0系列)
 */

// ──── 导入共享常量/工具 ────
import {
  WU_XING, CANG_GAN, KU_MAP, ROOT_MAP, ZHI_WU_XING, ZHI_NATURE, WX_NATURE, PEI_OU_CHAR,
  LIU_HE, LIU_CHONG, LIU_CHUAN, SAN_XING, HE_REN, SAN_XING_MEANING, ZI_HE_MEANING,
  ZUO_YONG_BEN_ZHI, GAN_JIA_ZI_QIN_QING, SI_KU_PIN_ZHI, SAN_HUI, SAN_HE, ZI_HE,
  TONG_GEN_LIAN_TI, TAO_HUA_MAP, TAO_HUA_POS, GAN_BODY_ORGAN, WU_XING_SICK, WU_XING_ORGAN,
  SHENG_CYCLE, KE_CYCLE, CHONG_SAME_PAIRS, BEST_YIN_KU, WAN_WU,
  WX_SEASON, STRONG_ROOTS, MEDIUM_ROOTS,
  wx, zhiWx, zhiKu, ss, sst, isCai, isGuan, isYin, isSS, isBJ,
  getFlowGZ, isGanInChart, wxStrength,
  evalZhiPower, isSameTypeChong, evalChongOrder, evalChongCan,
  bodyStrength, bodyAndSeasonAnalysis, tenGodMeaning, pref,
} from './bazi-judgment-shared'

// ──── 导入大运/流年函数 ────
import {
  daYunJudgeV2,
  flowYearV2,
  wanHun,
  liHun,
  jieHun,
  daYunFourStep,
} from './bazi-judgment-decade'

// ──── 导入深度分析函数 ────
import {
  lifeLabels, twoSignsJudge, rootHouseNarr,
  healthV3, parentV2, childrenV2, caiXi, guanSha,
  xiJiGod, tenGodDetailAnalysis, analyzeFriendMode,
  analyzeSpouseDynamic, analyzeChildrenRelation, analyzeTechAbility,
  analyzeMoneyMindset, analyzeCareerLevel, analyzeTombWarehouse,
  zhiYongEvaluate, wangDian, controlPowerAnalysis, dayMasterNature,
  enterpriseAnalysis, deepHumanInsight, maleLqXing, femaleLqXing, lqName,
  analyzeLiuQin, bfsRelationChain,
} from './bazi-judgment-analysis'

// ──── 导入深度洞察引擎 ────
import {
  twoSignsEngine,
  controlLevelThree,
  zhiYongFour,
  jieGenAnalysis,
  yuanJuCheck,
} from './bazi-judgment-insight'

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
        // 100轮打磨：6组穿的性格特征
        const chuanChar: Record<string,string> = {
          '子未':'你对外面总是笑眯眯的客气，但亲近你的人知道你骨子里有控制欲。表面为你好，实际在索取资源。',
          '卯辰':'你洞察力很强，看人看事很准。不得到不放弃，但你让步的时候对方反而没边界感。',
          '丑午':'你热情霸道，想要什么就主动出击。对方比较保守被动，你们之间总有一个带头一个跟着。',
          '寅巳':'你目标感很强，做事情不惜消耗健康。对方精力被你耗得不行，你自己也不轻松。',
          '申亥':'你特别能说，不光是嘴上说——你是那种潜移默化改变别人思想的人。对方容易被你带节奏。',
          '酉戌':'你做事不留余地，断人后路。对方被你搞到失去根本，但你自己也会因此树敌不少。',
          '':'你这人对外面总是笑眯眯的客气，但亲近你的人知道你骨子里有控制欲。表面为你好，实际要你接受条件。'
        }
        const cKey = zhis[hi] + zhis[hj]
        charNarr.push(`${zhis[hi]}${zhis[hj]}穿——${chuanChar[cKey] || chuanChar['']}`)
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

  // ──── 通用去重：对每个 narr 数组去重（字符串完全相同或一个被另一个包含） ────
  const dedup = (arr: string[]): string[] => {
    const out: string[] = []
    for (const s of arr) {
      const trimmed = s.trim()
      if (!trimmed) continue
      // 如果已有条目包含此句或与此句完全相同，跳过
      let isDuplicate = false
      for (const existing of out) {
        if (existing === trimmed || existing.includes(trimmed) || trimmed.includes(existing)) {
          isDuplicate = true
          break
        }
      }
      if (!isDuplicate) out.push(trimmed)
    }
    return out
  }

  return {
    labels: dedup(labels), charNarr: dedup(charNarr), careerNarr: dedup(careerNarr), wealthNarr: dedup(wealthNarr), marriageNarr: dedup(marriageNarr),
    parentNarr: dedup(parentNarrResult), childrenNarr: dedup(childrenNarrResult),
    healthNarr: dedup(healthNarrResult), prefNarr: dedup(prefNarrResult),
    biJieNarr: ['比劫分析集成在标签和两象定一象中'],
    daYunNarr: dedup(daYunNarr), flowYearNarr: dedup(flowYearNarr), wanHunNarr: dedup(wanHunNarr), jieHunNarr: dedup(jieHunNarr), liHunNarr: dedup(liHunNarr),
    twoSignsNarr: dedup(twoSignsResult), rootHouseNarr: dedup(rootHouseResult),
    friendModeNarr: dedup(friendModeResult),
    spouseDynamicNarr: dedup(spouseDynamicResult),
    childrenRelationNarr: dedup(childrenRelationResult),
    liuqinGong: liuqinResult,
    techAbilityNarr: dedup(techAbilityResult),
    moneyMindsetNarr: dedup(moneyMindsetResult),
    careerLevelNarr: dedup(careerLevelResult),
    tombWareNarr: dedup(tombWareResult),
    deepHumanNarr: dedup(deepHumanResult),
    controlPowerNarr: dedup(controlPowerResult),
    dayMasterNarr: dedup(dayMasterResult),
    enterpriseNarr: dedup(enterpriseResult),
    zhiYongNarr: dedup(zhiYongResult),
    tenGodDetailNarr: dedup(tenGodDetailResult),
    bodySeasonNarr: dedup(bodySeasonResult),
    bfsRelationNarr: dedup(bfsRelationChain(riGan, pills, gender)),
    daYunFourStepNarr: currentDaYunGan && currentDaYunZhi
      ? dedup(daYunFourStep(riGan, pills, currentDaYunGan, currentDaYunZhi, gender))
      : ['请提供当前大运干支。'],
    twoSignsEngineNarr: dedup(twoSignsEngine(riGan, gans, zhis, gender)),
    controlLevelNarr: dedup(controlLevelThree(riGan, pills)),
    zhiYongFourNarr: dedup(zhiYongFour(riGan, gans, zhis, gender)),
    jieGenNarr: dedup(jieGenAnalysis(riGan, pills)),
    yuanJuCheckNarr: dedup(yuanJuCheck(riGan, gans, zhis, gender))
  }
<<<<<<< Updated upstream
=======

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
  for (const [zhi, info] of Object.entries(ruMu)) {
    if (riZhi === zhi) {
      for (const mu of zhis) {
        if (mu === info.mu) {
          // v6: 分好坏——日主入墓要看入的是什么库
          // 好的入墓=被自己收藏(好事);坏的=被压制
          // 简单判断:辰未为印库(偏吉),丑戌为官杀/比劫库(偏凶)
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
      if (LIU_CHONG[riZhi] === z) {
        r.push(`你的配偶宫被${z}冲—你的控制权靠冲突和较劲获得。你不争没人给你,你争了也不一定稳。这辈子要学会在斗争中求生存。`)
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
    r.push(`月令${monthZhi}是财—你所在的市场是"钱驱动"的。在这个行业,谁有钱谁说了算。你的企业要围绕"赚钱"来设计产品。`)
  } else if (monthSS === '官杀') {
    r.push(`月令${monthZhi}是官杀—你所在的市场是"规则驱动"的。这个行业吃的是牌照、资质、关系。没有门槛你反而做不起来。`)
  } else if (monthSS === '印') {
    r.push(`月令${monthZhi}是印—你所在的市场是"品牌驱动"的。在这个行业,口碑和信任比钱重要。你的企业要舍得在品牌上投入。`)
  } else if (monthSS === '食伤') {
    r.push(`月令${monthZhi}是食伤—你所在的市场是"技术驱动"的。产品更新快,你得不断学习才能跟得上。`)
  } else if (monthSS === '比劫') {
    r.push(`月令${monthZhi}是比劫—你所在的市场竞争激烈。大家都在抢同一块蛋糕,你能不能活下来看你的差异化。`)
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
    r.push(`时柱${hourGan}${hourZhi}是印—你的员工偏文职,稳定但效率不高。适合做内勤和后台支持,不适合冲在一线。`)
  } else if (hourSS === '财') {
    r.push(`时柱${hourGan}${hourZhi}是财—你的员工业绩导向,执行力强。但他们对钱敏感,钱不到位就走人。你的企业要建立好激励机制。`)
  } else if (hourSS === '官杀') {
    r.push(`时柱${hourGan}${hourZhi}是官杀—你的员工有纪律性,但流动性也大。对管理层的要求高,管不好容易出问题。`)
  } else if (hourSS === '食伤') {
    r.push(`时柱${hourGan}${hourZhi}是食伤—你的员工有创意有想法,但不好管。他们需要自由发挥的空间,管太死就跑了。适合创意型公司。`)
  } else if (hourSS === '比劫') {
    r.push(`时柱${hourGan}${hourZhi}是比劫—你的员工跟你是"兄弟"关系。好的一面是忠诚敢拼,坏的一面是没有规矩,容易抱团。`)
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
      if (LIU_CHONG[zhis[i]] === zhis[j]) {
        r.push(`${posNames[i]}柱${zhis[i]}冲${posNames[j]}柱${zhis[j]}—企业内部的这两个部门/层级之间存在天然冲突。这不是管理能解决的,你需要从组织架构上分开他们。`)
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
>>>>>>> Stashed changes
}

export default analyzeJudgment
