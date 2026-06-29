// ═════════════════════════════════════════
//  各领域深度分析函数
// ═════════════════════════════════════════
import { WU_XING, CANG_GAN, KU_MAP, ROOT_MAP, ZHI_WU_XING, ZHI_NATURE, WX_NATURE, PEI_OU_CHAR,
  LIU_HE, LIU_CHONG, LIU_CHUAN, SAN_XING, HE_REN, SAN_XING_MEANING, ZI_HE_MEANING,
  ZUO_YONG_BEN_ZHI, GAN_JIA_ZI_QIN_QING, SI_KU_PIN_ZHI, SAN_HUI, SAN_HE, ZI_HE,
  TONG_GEN_LIAN_TI, TAO_HUA_MAP, TAO_HUA_POS, GAN_BODY_ORGAN, WU_XING_SICK, WU_XING_ORGAN,
  SHENG_CYCLE, KE_CYCLE, CHONG_SAME_PAIRS, BEST_YIN_KU, WAN_WU,
  WX_SEASON, STRONG_ROOTS, MEDIUM_ROOTS,
  wx, zhiWx, zhiKu, ss, sst, isCai, isGuan, isYin, isSS, isBJ,
  getFlowGZ, isGanInChart, wxStrength,
  evalZhiPower, isSameTypeChong, evalChongOrder, evalChongCan,
  bodyStrength, bodyAndSeasonAnalysis, tenGodMeaning, pref
} from './bazi-judgment-shared'

export function lifeLabels(riGan: string, pills: {gan:string;zhi:string}[], gender: string): string[] {
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

  // 比劫夺财（含藏干+宫位判定）
  // 教材:比劫合了家里的字才会破财。年上月上的比劫一般不直接破财。比劫在年上=国家/贵人层面,不跟日主竞争
  let biCount = 0, caiCount = 0
  // 家里(日时柱)的财星
  let homeCaiG = '', homeCaiZ = ''
  for (const g of gans) { const st = ss(riGan,g); if(isBJ(st)) biCount++; if(isCai(st)) caiCount++ }
  for (const z of zhis) {
    for (const c of (CANG_GAN[z]||[])) {
      const cst = sst(riGan, c)
      if(isBJ(cst)) biCount++
      if(isCai(cst)) {
        caiCount++
        // 家里的财星标记
        if (z === zhis[2] || z === zhis[3]) homeCaiZ = z
      }
    }
  }
  // 检查日时柱是否透财星
  for (let hi = 2; hi < 4; hi++) {
    if (isCai(ss(riGan, gans[hi]))) homeCaiG = gans[hi]
  }
  
  // 检查:家外(年月)的比劫是否合家里的财星
  let biJieDuoCai = false
  const ht: Record<string, string> = {'甲己':'合','乙庚':'合','丙辛':'合','丁壬':'合','戊癸':'合'}
  for (let hi = 0; hi < 2; hi++) {
    if (isBJ(ss(riGan, gans[hi]))) {
      // 年/月天干是比劫,看它是否合家里天干的财
      if (homeCaiG && (ht[gans[hi] + homeCaiG] || ht[homeCaiG + gans[hi]])) {
        biJieDuoCai = true; break
      }
    }
  }
  if (!biJieDuoCai) {
    // 检查家外地支是否合家里地支的财
    for (let hi = 0; hi < 2; hi++) {
      if (homeCaiZ && LIU_HE[zhis[hi]] === homeCaiZ) {
        // 家外地支合家里财星地支
        const hiMain = (CANG_GAN[zhis[hi]]||[''])[0]
        if (isBJ(sst(riGan, zhis[hi]))) biJieDuoCai = true
        break
      }
    }
  }

  if (biJieDuoCai) {
    l.push('🏷️ 八字标签:比劫夺财--家外的比劫合了你家里的财星。不是你所有朋友都坑你,但跟你走得最近、合得最来的那几个,你得留个心眼:关系越好利益越要算清。')
  } else if (biCount >= 3 && caiCount <= 1) {
    l.push('🏷️ 八字标签:比劫多--朋友多花钱快。跟朋友相处注意尺度,别合伙别担保。')
  }

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

export function twoSignsJudge(riGan: string, pills: {gan:string;zhi:string}[], gender: string): string[] {
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

export function rootHouseNarr(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
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
export function healthV3(ri: string, pills: {gan:string;zhi:string}[]): string[] {
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

  // 𓆙 第五步：十神维度修正（100轮打磨：印=底子、比劫=手脚、食伤=心情）
  const mainSS = sst(ri, (CANG_GAN[z[2]]||[''])[0])
  const allGSS = g.map(g => ss(ri, g))
  const allZSS = z.map(zz => ss(ri, (CANG_GAN[zz]||[''])[0]))
  const allSS = [...allGSS, ...allZSS]
  const step5YinCount = allSS.filter(s => ['正印','偏印'].includes(s)).length
  const step5BijieCount = allSS.filter(s => ['比肩','劫财'].includes(s)).length
  const step5ShishangCount = allSS.filter(s => ['食神','伤官'].includes(s)).length
  
  r.push('')
  r.push('━━━ 十神维度修正健康 ━━━')
  if (step5YinCount >= 3) {
    r.push('【印旺】你的身体底子好，有先天福荫。体质偏保守——小病不容易好但大病不太会得。注意不要因为天生底子好就熬身体。')
  } else if (step5YinCount <= 1) {
    r.push('【印弱】你的身体底子一般,没有太多先天储备。要特别重视保养和体检,别人抗过去的病你可能扛不过去。')
  }
  if (step5BijieCount >= 3) {
    r.push('【比劫多】手脚利落、能跑能跳。体力型工作比较适合你,但注意受伤——比劫也主手脚外伤。')
  } else if (step5BijieCount <= 1) {
    r.push('【比劫少】你不太善于用体力解决问题,也不爱运动。手脚偏懒,关节容易僵硬。')
  }
  if (step5ShishangCount >= 4) {
    r.push('【食伤过旺】心情影响身体——你焦虑、想太多的时候身体就会出问题。你的病大多是情绪病,肠胃、睡眠跟心情直接挂钩。')
  } else if (step5ShishangCount >= 2) {
    r.push('【食伤适中】你是心情影响身体的那种人——高兴的时候吃嘛嘛香,心情不好就胃不舒服。')
  }
  // 日主治病策略
  r.push(`【日主${ri}】你的治病策略: ${step5YinCount >= 3 ? '底子好,随它去恢复。' : '不要硬扛,积极就医。'}${step5BijieCount >= 2 ? '动起来,运动是最好的药。' : '养为主,修心养性。'}${step5ShishangCount >= 3 ? '先调心情再调身体,情绪通了病就好一半。' : '身体问题就是身体问题,别乱联想到心情上。'}`)

  // 𓆙 第六步：养生总结
  r.push('')
  r.push('💡 先天体质参考——宫位定位置，五行看脏腑，刑冲找隐患，十神看抗病能力和致病原因。具体以实际身体为准。')

  return r
}

// ──── 父母子女 ────

export function parentV2(ri: string, pills: {gan:string;zhi:string;gz?:string}[]): string[] {
  const r: string[] = []; const mg = pills[1].gan; const mss = ss(ri,mg)
  const rk = zhiKu(pills[2].zhi), mk = zhiKu(pills[1].zhi)
  if (rk && mk && rk===mk) r.push('能借父母的力,关系近。')
  else r.push('自己的事自己扛,父母帮不上太多。')
  return r
}

export function childrenV2(ri: string, pills: {gan:string;zhi:string;gz?:string}[]): string[] {
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

export function caiXi(ri: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []; let found = false
  for (let i=0; i<4; i++) { const s=ss(ri,pills[i].gan); if (isCai(s)) {found=true} }
  if (!found) for (let i=0; i<4; i++) { for (const cg of CANG_GAN[pills[i].zhi]||[]) { if (isCai(ss(ri,cg))) {found=true;break} } if (found) break }
  if (!found) r.push('财来财去,不容易存住钱。')
  return r
}

export function guanSha(ri: string, pills: {gan:string;zhi:string}[]): string[] {
  const r: string[] = []; let found = false
  for (let i=0; i<4; i++) { const s=ss(ri,pills[i].gan); if (isGuan(s)) {found=true} }
  if (!found) for (let i=0; i<4; i++) { for (const cg of CANG_GAN[pills[i].zhi]||[]) { if (isGuan(ss(ri,cg))) {found=true;break} } if (found) break }
  if (!found) r.push('事业上缺乏外力推动。')
  return r
}

/**
 * 旺相休囚死表: 月支 → 各五行节令状态
 */
export function xiJiGod(ri: string, gans: string[], zhis: string[], tenGod: string): '喜神'|'忌神'|'中性' {
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
export function tenGodDetailAnalysis(ri: string, pills: {gan:string;zhi:string}[], gender: string, body: '身强'|'身弱'|'身中和'): string[] {
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

export function analyzeFriendMode(riGan: string, pills: {gan:string;zhi:string}[], ss: (r:string,g:string)=>string): string[] {
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

export function analyzeSpouseDynamic(riGan: string, pills: {gan:string;zhi:string}[], gender: string): string[] {
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

export function analyzeChildrenRelation(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
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
    r.push(`你跟孩子关系亲,你带的头正,孩子也服你管教。`)
  } else {
    r.push(`你跟孩子多少有点代沟,你理解不了他/她想的什么,孩子也嫌你老土。多听他说,少教育他。`)
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
      const childKey = z + '->' + cg
      // 同一个年被多个藏干冲到只输出一次
      if (ke[cgWx] === zWx && !childSeen.has(childKey) && !childSeen.has(z + '->*')) {
        childSeen.add(z + '->*')
        childSeen.add(childKey)
        r.push(`子女宫的${hz}被${z}冲到了--孩子在外面跟人相处不太平,跟同学同事的关系你得留心点。`)
      }
    }
  }

  return r
}

// ──── 技术能力深度评估 ═══════════════════

export function analyzeTechAbility(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
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

export function analyzeMoneyMindset(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
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

export function analyzeCareerLevel(
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

export function analyzeTombWarehouse(
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

export function zhiYongEvaluate(
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

export function wangDian(ss: string): string {
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

export function controlPowerAnalysis(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
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

export function dayMasterNature(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
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

export function enterpriseAnalysis(riGan: string, gans: string[], zhis: string[]): string[] {
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

export function deepHumanInsight(riGan: string, pills: {gan:string;zhi:string}[], gender: string): string[] {
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
export function maleLqXing(ss: string): string {
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
export function femaleLqXing(ss: string): string {
  const map: Record<string,string> = {
    '正财':'父亲','偏印':'母亲','比肩':'姐妹/闺蜜','劫财':'兄弟/公公',
    '正官':'原配丈夫','七杀':'情人/偏缘/二婚','伤官':'儿子','食神':'女儿'
  }
  return map[ss] || ''
}
export function lqName(shiShen: string, gen: string): string {
  return gen === '男' ? maleLqXing(shiShen) : femaleLqXing(shiShen)
}

export function analyzeLiuQin(
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

export function bfsRelationChain(riGan: string, pills: {gan:string;zhi:string}[], gender: string): string[] {
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
