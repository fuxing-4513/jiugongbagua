// ═════════════════════════════════════════
//  深度洞察引擎(v8 P0系列)
// ═════════════════════════════════════════
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
import {
  xiJiGod, tenGodDetailAnalysis, analyzeFriendMode,
  analyzeSpouseDynamic, analyzeChildrenRelation, analyzeTechAbility,
  analyzeMoneyMindset, analyzeCareerLevel, analyzeTombWarehouse,
  zhiYongEvaluate, wangDian, controlPowerAnalysis, dayMasterNature,
  enterpriseAnalysis, deepHumanInsight, maleLqXing, femaleLqXing, lqName,
  analyzeLiuQin, bfsRelationChain,
} from './bazi-judgment-analysis'

export function twoSignsEngine(riGan: string, gans: string[], zhis: string[], gender: string): string[] {
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

export function controlLevelThree(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
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

export function zhiYongFour(riGan: string, gans: string[], zhis: string[], gender: string): string[] {
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

export function jieGenAnalysis(riGan: string, pills: {gan:string;zhi:string}[]): string[] {
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

export function yuanJuCheck(riGan: string, gans: string[], zhis: string[], gender: string): string[] {
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
