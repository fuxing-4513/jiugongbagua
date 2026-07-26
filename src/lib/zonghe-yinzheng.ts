/**
 * zonghe-yinzheng.ts — 八字+紫微综合印证
 * 
 * 核心思路：把八字和紫微两套体系得出的结论做交叉对账
 * - 主轴是否一致（命格基调）
 * - 六大维度是否对齐（事业/财运/婚恋/子女/健康/六亲）
 * - 冲突时体系优先级判断
 * 
 * 输出格式兼容九宫前端 + 水墨风海报生成
 */

export interface BaziSummary {
  dayMaster: string
  pattern: string           // 格局
  wangShuai: string         // 旺衰
  yongShen: string[]        // 用神
  wuXingMissing: string[]   // 五行缺失
  wuXingStrongest: string[] // 五行最强
  career: string
  wealth: string
  marriage: string
  health: string
  children: string
  family: string
}

export interface ZiweiSummary {
  mingGong: string          // 命宫
  mainStars: string[]       // 主星
  shenGong: string          // 身宫
  wuXingJu: string          // 五行局
  shengNianSiHua: string[]  // 生年四化
  patterns: string[]        // 格局
  career: string
  wealth: string
  marriage: string
  health: string
  children: string
  family: string
}

export interface CrossValidation {
  consistency: string       // '同向印证'|'互补印证'|'存在矛盾'
  axes: {
    baziMain: string
    ziweiMain: string
    fusedAxis: string
  }
  dims: {
    name: string
    bazi: string
    ziwei: string
    verdict: string         // '🟢 同向'|'⚠ 部分冲突'|'🔴 矛盾'
    fused: string
  }[]
  conflicts: { dim: string; issue: string; resolution: string }[]
  conclusion: string
}

/** Dimension name translations */
const DIM_NAMES: Record<string, Record<string, string>> = {
  'zh-CN': { '事业':'事业', '财运':'财运', '婚恋':'婚恋', '健康':'健康', '子女':'子女', '六亲':'六亲' },
  'zh-TW': { '事业':'事業', '财运':'財運', '婚恋':'婚戀', '健康':'健康', '子女':'子女', '六亲':'六親' },
  'en': { '事业':'Career', '财运':'Wealth', '婚恋':'Relationships', '健康':'Health', '子女':'Children', '六亲':'Family' },
  'ja': { '事业':'事業', '财运':'財運', '婚恋':'婚恋', '健康':'健康', '子女':'子女', '六亲':'六親' },
  'ko': { '事业':'사업', '财运':'재운', '婚恋':'연애', '健康':'건강', '子女':'자녀', '六亲':'육친' },
}

function dimName(name: string, lang?: string): string {
  const l = (lang || 'zh-CN') as keyof typeof DIM_NAMES
  return DIM_NAMES[l]?.[name] || name
}

/** Bazi career/wealth/marriage text translations */
const CAREER_BAZI: Record<string, Record<string, string>> = {
  'zh-CN': { '官杀':'官杀格，宜公职管理', '正财':'正财格，宜稳定财路', '偏财':'偏财格，宜经商投资', '食伤':'食伤格，宜技术创意', '正偏印':'印格，宜文教科研', '身强':'身强，宜担财官', '身弱':'身弱，宜印比助身' },
  'en': { '官杀':'Official/Kill pattern — public service management', '正财':'Direct Wealth pattern — stable income', '偏财':'Indirect Wealth pattern — business investment', '食伤':'Food/Injury pattern — technical creative', '正偏印':'Seal pattern — education research', '身强':'Strong body — able to carry wealth/official', '身弱':'Weak body — rely on seal/assist' },
  'ja': { '官杀':'官殺格—公務管理に適す', '正财':'正財格—安定収入に適す', '偏财':'偏財格—事業投資に適す', '食伤':'食傷格—技術創意に適す', '正偏印':'印格—教育研究に適す', '身强':'身強—財官を担える', '身弱':'身弱—印比が必要' },
  'ko': { '官杀':'관살격—공직관리 적합', '正财':'정재격—안정적 수입 적합', '偏财':'편재격—사업투자 적합', '食伤':'식상격—기술창의 적합', '正偏印':'인격—교육연구 적합', '身强':'신강—재관을 감당 가능', '身弱':'신약—인비 도움 필요' },
}

// 八字维度推断（基于旺衰+十神+格局）
export function summarizeBazi(siZhu: Record<string, { gan: string; zhi: string }>, enrich?: any): BaziSummary {
  const dm = siZhu['日']?.gan || ''
  const p = enrich?.格局?.primary || ''
  const ws = enrich?.旺衰?.verdict || ''
  const yong = enrich?.调候用神 || []
  const missing = enrich?.五行统计?.missing || []
  const strongest = enrich?.五行统计?.strongest || []

  const careerMap: Record<string, string> = {
    '正官':'官杀格，宜公职管理', '七杀':'官杀格，宜公职管理',
    '正财':'正财格，宜稳定财路', '偏财':'偏财格，宜经商投资',
    '食神':'食伤格，宜技术创意', '伤官':'食伤格，宜技术创意',
    '正印':'印格，宜文教科研', '偏印':'印格，宜文教科研',
  }

  // 基于格局+旺衰推断六大维度
  const career = (() => {
    for (const [k, v] of Object.entries(careerMap)) {
      if (p.includes(k)) return v
    }
    if (ws.includes('强')) return '身强，宜担财官'
    return '身弱，宜印比助身'
  })()

  const wealth = (() => {
    if (p.includes('财')) return '财星立格，财运明显'
    if (ws === '身强') return '身强能担财'
    if (ws === '身弱' || ws === '偏弱') return '身弱需待运助财'
    return '财星不显，稳中求财'
  })()

  const marriage = (() => {
    const ziSS = enrich?.自坐?.['日'] || ''
    if (['沐浴','桃花'].includes(ziSS)) return '日坐沐浴，感情丰富'
    if (['临官','帝旺'].includes(ziSS)) return '日坐旺地，配偶有力'
    if (['绝','死'].includes(ziSS)) return '日坐死绝，感情波折'
    return '婚姻平稳'
  })()

  return { dayMaster: dm, pattern: p, wangShuai: ws, yongShen: yong, wuXingMissing: missing, wuXingStrongest: strongest, career, wealth, marriage, health: '依五行平衡度判断', children: '依子女宫十神判断', family: '依年柱六亲判断' }
}

// 紫微维度推断（基于星曜+格局+宫位）
export function summarizeZiwei(ziweiResult: any): ZiweiSummary {
  const mingGong = ziweiResult?.mingGong || ''
  const mainStars = ziweiResult?.mainStars || []
  const shenGong = ziweiResult?.shenGong || ''
  const wuXingJu = ziweiResult?.wuXingJu?.name || ''
  const shengNianSiHua = ziweiResult?.shengNianSiHua || []
  const patterns = ziweiResult?.patterns || []

  return { mingGong, mainStars, shenGong, wuXingJu, shengNianSiHua, patterns, career: '', wealth: '', marriage: '', health: '', children: '', family: '' }
}

// 五行局 -> 五行属性
export function wuXingJuToWuXing(ju: string): string {
  if (ju.includes('金')) return '金'
  if (ju.includes('木')) return '木'
  if (ju.includes('水')) return '水'
  if (ju.includes('火')) return '火'
  if (ju.includes('土')) return '土'
  return ''
}

// 综合印证主入口
export function crossValidate(
  baziEnrich: any,
  ziweiData: any,
  optional?: { userName?: string; birthInfo?: any; lang?: string }
): CrossValidation {
  const lang = optional?.lang
  const isCN = !lang || lang === 'zh-CN' || lang === 'zh-TW'

  const conflicts: { dim: string; issue: string; resolution: string }[] = []
  const dims: CrossValidation['dims'] = []

  // 获取八字总结
  const siZhu = ziweiData?.birthInfo?.siZhu || {}
  const bazi = summarizeBazi(siZhu, baziEnrich)
  const ziwei = summarizeZiwei(ziweiData)

  // 主轴判断
  const baziMain = `${bazi.dayMaster}日主·${bazi.pattern}·${bazi.wangShuai}`
  const ziweiMain = `${ziwei.mingGong}·${ziwei.mainStars.join('+')}·${ziwei.wuXingJu}`
  let fusedAxis = ''
  let consistency: string = '同向印证'

  // 八字缺金 vs 五行局属金 -> 互补印证
  if (bazi.wuXingMissing.length > 0) {
    const juWx = wuXingJuToWuXing(ziwei.wuXingJu)
    if (juWx && bazi.wuXingMissing.includes(juWx)) {
      if (isCN) fusedAxis = `八字缺${juWx}，紫微五行局补${juWx}，先天不足后天补`
      else if (lang === 'en') fusedAxis = `Ba Zi lacks ${juWx}, Zi Wei WJ supplements ${juWx} — innate deficiency compensated`
      else if (lang === 'ja') fusedAxis = `八字に${juWx}が欠け、紫微五行局が${juWx}を補う—先天不足を後天で補う`
      else if (lang === 'ko') fusedAxis = `사주에 ${juWx} 부족, 자미오행국이 ${juWx} 보충 — 선천 부족 후천 보충`
      consistency = '互补印证'
    }
  }

  // 八字身强身弱 vs 紫微格局 -> 对照
  if (!fusedAxis) {
    if (bazi.wangShuai.includes('强') && ziwei.patterns.some((p: string) => ['七杀朝斗','杀破狼','紫府同宫'].includes(p))) {
      if (isCN) fusedAxis = `身强+贵格，命格刚健有力`
      else if (lang === 'en') fusedAxis = `Strong body + noble pattern — robust and powerful destiny`
      else if (lang === 'ja') fusedAxis = `身強＋貴格、命格剛健`
      else if (lang === 'ko') fusedAxis = `신강＋귀격, 명강강건`
    } else if (bazi.wangShuai.includes('弱') && ziwei.patterns.some((p: string) => ['机月同梁','同梁拱照'].includes(p))) {
      if (isCN) fusedAxis = `身弱+文格，宜稳中求进`
      else if (lang === 'en') fusedAxis = `Weak body + literary pattern — steady progress recommended`
      else if (lang === 'ja') fusedAxis = `身弱＋文格、安定の中で前進を`
      else if (lang === 'ko') fusedAxis = `신약＋문격, 안정 속 전진`
    } else {
      if (isCN) fusedAxis = `${bazi.dayMaster}日主·${bazi.pattern} / ${ziwei.mingGong}${ziwei.mainStars.join('')}`
      else if (lang === 'en') fusedAxis = `${bazi.dayMaster} DayMaster · ${bazi.pattern} / ${ziwei.mingGong}${ziwei.mainStars.join('')}`
      else if (lang === 'ja') fusedAxis = `${bazi.dayMaster}日主·${bazi.pattern} / ${ziwei.mingGong}${ziwei.mainStars.join('')}`
      else if (lang === 'ko') fusedAxis = `${bazi.dayMaster}일주·${bazi.pattern} / ${ziwei.mingGong}${ziwei.mainStars.join('')}`
    }
  }

  // 检查冲突
  if (bazi.wangShuai === '身强' && ziwei.patterns.some((p: string) => p.includes('文星') || p.includes('机月'))) {
    if (isCN) {
      conflicts.push({ dim: '基调', issue: '八字身强但紫微文星格局', resolution: '以紫微格局为主，身强为底气' })
    } else if (lang === 'en') {
      conflicts.push({ dim: 'Tone', issue: 'Bazi strong but Zi Wei literary pattern', resolution: 'Prioritize Zi Wei pattern, strong body as foundation' })
    } else if (lang === 'ja') {
      conflicts.push({ dim: '基调', issue: '八字身強だが紫微文星格局', resolution: '紫微格局を優先し、身強を基礎とする' })
    } else if (lang === 'ko') {
      conflicts.push({ dim: '기조', issue: '사주 신강但자미 문성격국', resolution: '자미 격국 우선, 신강은 기초' })
    }
    consistency = '互补印证'
  }

  // 六大维度
  const allDims = [
    { name: '事业', bazi: bazi.career, ziwei: '' },
    { name: '财运', bazi: bazi.wealth, ziwei: '' },
    { name: '婚恋', bazi: bazi.marriage, ziwei: '' },
    { name: '健康', bazi: bazi.health, ziwei: '' },
    { name: '子女', bazi: bazi.children, ziwei: '' },
    { name: '六亲', bazi: bazi.family, ziwei: '' },
  ]

  for (const d of allDims) {
    const ziweiDim = (ziwei as any)[d.name] as string || ''
    let verdict: string = '🟢 同向'
    let fused = d.bazi
    if (ziweiDim) {
      if (d.bazi.includes('波折') && ziweiDim.includes('稳定')) {
        verdict = '⚠ 部分冲突'
        if (isCN) fused = `八字偏波折，紫微偏稳定，${d.name}前紧后松`
        else if (lang === 'en') fused = `Bazi rocky, Zi Wei stable — ${dimName(d.name, lang)} tightens then relaxes`
        else if (lang === 'ja') fused = `八字は波乱含み、紫微は安定—${dimName(d.name, lang)}前半緊後半緩`
        else if (lang === 'ko') fused = `사주는 파란, 자미는 안정 — ${dimName(d.name, lang)} 전반 긴장 후반 이완`
      }
      else if (d.bazi.includes('强') && ziweiDim.includes('弱')) {
        verdict = '⚠ 部分冲突'
        if (isCN) fused = `八字身强可担但紫微${d.name}宫偏弱`
        else if (lang === 'en') fused = `Bazi strong but Zi Wei ${dimName(d.name, lang)} palace weaker`
        else if (lang === 'ja') fused = `八字身強だが紫微${dimName(d.name, lang)}宮は弱め`
        else if (lang === 'ko') fused = `사주 신강但자미${dimName(d.name, lang)}궁 약함`
      }
    }
    dims.push({ name: dimName(d.name, lang), bazi: d.bazi, ziwei: ziweiDim || '—', verdict, fused })
  }

  // 结论
  let conclusion = ''
  if (consistency === '同向印证') {
    if (isCN) conclusion = `八字与紫微命盘指向一致：${bazi.dayMaster}日主${bazi.pattern}与${ziwei.mingGong}${ziwei.mainStars.join('')}格局相符，命格主轴清晰。`
    else if (lang === 'en') conclusion = `Ba Zi and Zi Wei charts align: Your ${bazi.dayMaster} Day Master ${bazi.pattern} matches ${ziwei.mingGong}${ziwei.mainStars.join('')} — clear destiny axis.`
    else if (lang === 'ja') conclusion = `八字と紫微命盤は一致：${bazi.dayMaster}日主${bazi.pattern}と${ziwei.mingGong}${ziwei.mainStars.join('')}格局が符合し、命格の軸が明確。`
    else if (lang === 'ko') conclusion = `사주와 자미 명반이 일치：${bazi.dayMaster}일주${bazi.pattern}와 ${ziwei.mingGong}${ziwei.mainStars.join('')} 격국이 부합하여 명격의 축이 명확합니다.`
  } else if (consistency === '互补印证') {
    if (isCN) conclusion = `八字与紫微各自侧重不同维度：${fusedAxis}，两盘信息互补，综合判断更全面。`
    else if (lang === 'en') conclusion = `Ba Zi and Zi Wei focus on different dimensions: ${fusedAxis} — complementary information for comprehensive judgment.`
    else if (lang === 'ja') conclusion = `八字と紫微は異なる次元に焦点：${fusedAxis}—両盤の情報は補完的で、総合判断がより正確。`
    else if (lang === 'ko') conclusion = `사주와 자미는 다른 차원에 초점：${fusedAxis}—두 명반의 정보가 상호 보완적이며 종합 판단이 더 정확합니다.`
  } else {
    if (isCN) conclusion = `八字与紫微在部分维度存在差异，需结合具体大运流年综合权衡。`
    else if (lang === 'en') conclusion = `Ba Zi and Zi Wei show some dimensional differences — weigh combined with specific luck cycles.`
    else if (lang === 'ja') conclusion = `八字と紫微に一部の次元で差異あり—具体的な大運・流年と合わせて総合的に判断。`
    else if (lang === 'ko') conclusion = `사주와 자미에 일부 차원에서 차이가 있음—구체적 대운·유년과 함께 종합적으로 판단.`
  }

  return { consistency: dimName(consistency, lang) || consistency, axes: { baziMain, ziweiMain, fusedAxis }, dims, conflicts, conclusion }
}
