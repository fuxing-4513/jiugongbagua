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
}

export default analyzeJudgment
