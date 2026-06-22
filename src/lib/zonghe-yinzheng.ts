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
  consistency: '同向印证' | '互补印证' | '存在矛盾'
  axes: {
    baziMain: string
    ziweiMain: string
    fusedAxis: string
  }
  dims: {
    name: string
    bazi: string
    ziwei: string
    verdict: '🟢 同向' | '⚠ 部分冲突' | '🔴 矛盾'
    fused: string
  }[]
  conflicts: { dim: string; issue: string; resolution: string }[]
  conclusion: string
}

// 八字维度推断（基于旺衰+十神+格局）
export function summarizeBazi(siZhu: Record<string, { gan: string; zhi: string }>, enrich?: any): BaziSummary {
  const dm = siZhu['日']?.gan || ''
  const p = enrich?.格局?.primary || ''
  const ws = enrich?.旺衰?.verdict || ''
  const yong = enrich?.调候用神 || []
  const missing = enrich?.五行统计?.missing || []
  const strongest = enrich?.五行统计?.strongest || []

  // 基于格局+旺衰推断六大维度
  const career = (() => {
    if (p.includes('正官') || p.includes('七杀')) return '官杀格，宜公职管理'
    if (p.includes('正财')) return '正财格，宜稳定财路'
    if (p.includes('偏财')) return '偏财格，宜经商投资'
    if (p.includes('食神') || p.includes('伤官')) return '食伤格，宜技术创意'
    if (p.includes('正印') || p.includes('偏印')) return '印格，宜文教科研'
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
    const dayZhi = siZhu['日']?.zhi || ''
    const dayGan = siZhu['日']?.gan || ''
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
  optional?: { userName?: string; birthInfo?: any }
): CrossValidation {
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
  let consistency: CrossValidation['consistency'] = '同向印证'

  // 八字缺金 vs 五行局属金 -> 互补印证
  if (bazi.wuXingMissing.length > 0) {
    const juWx = wuXingJuToWuXing(ziwei.wuXingJu)
    if (juWx && bazi.wuXingMissing.includes(juWx)) {
      fusedAxis = `八字缺${juWx}，紫微五行局补${juWx}，先天不足后天补`
      consistency = '互补印证'
    }
  }

  // 八字身强身弱 vs 紫微格局 -> 对照
  if (!fusedAxis) {
    if (bazi.wangShuai.includes('强') && ziwei.patterns.some((p: string) => ['七杀朝斗','杀破狼','紫府同宫'].includes(p))) {
      fusedAxis = `身强+贵格，命格刚健有力`
    } else if (bazi.wangShuai.includes('弱') && ziwei.patterns.some((p: string) => ['机月同梁','同梁拱照'].includes(p))) {
      fusedAxis = `身弱+文格，宜稳中求进`
    } else {
      fusedAxis = `${bazi.dayMaster}日主·${bazi.pattern} / ${ziwei.mingGong}${ziwei.mainStars.join('')}`
    }
  }

  // 检查冲突
  if (bazi.wangShuai === '身强' && ziwei.patterns.some((p: string) => p.includes('文星') || p.includes('机月'))) {
    conflicts.push({ dim: '基调', issue: '八字身强但紫微文星格局', resolution: '以紫微格局为主，身强为底气' })
    consistency = '互补印证'
  }

  // 六大维度
  const allDims = [
    { name: '事业', bazi: bazi.career, ziwei: '', verd: '' as any, fused: '' },
    { name: '财运', bazi: bazi.wealth, ziwei: '', verd: '' as any, fused: '' },
    { name: '婚恋', bazi: bazi.marriage, ziwei: '', verd: '' as any, fused: '' },
    { name: '健康', bazi: bazi.health, ziwei: '', verd: '' as any, fused: '' },
    { name: '子女', bazi: bazi.children, ziwei: '', verd: '' as any, fused: '' },
    { name: '六亲', bazi: bazi.family, ziwei: '', verd: '' as any, fused: '' },
  ]

  for (const d of allDims) {
    const ziweiDim = ziwei[d.name as keyof typeof ziwei] as string || ''
    let verdict: '🟢 同向' | '⚠ 部分冲突' | '🔴 矛盾' = '🟢 同向'
    let fused = d.bazi
    if (ziweiDim) {
      if (d.bazi.includes('波折') && ziweiDim.includes('稳定')) { verdict = '⚠ 部分冲突'; fused = `八字偏波折，紫微偏稳定，${d.name}前紧后松` }
      else if (d.bazi.includes('强') && ziweiDim.includes('弱')) { verdict = '⚠ 部分冲突'; fused = `八字身强可担但紫微${d.name}宫偏弱` }
    }
    dims.push({ name: d.name, bazi: d.bazi, ziwei: ziweiDim || '待排盘补全', verdict, fused })
  }

  // 结论
  let conclusion = ''
  if (consistency === '同向印证') {
    conclusion = `八字与紫微命盘指向一致：${bazi.dayMaster}日主${bazi.pattern}与${ziwei.mingGong}${ziwei.mainStars.join('')}格局相符，命格主轴清晰。`
  } else if (consistency === '互补印证') {
    conclusion = `八字与紫微各自侧重不同维度：${fusedAxis}，两盘信息互补，综合判断更全面。`
  } else {
    conclusion = `八字与紫微在部分维度存在差异，需结合具体大运流年综合权衡。`
  }

  return { consistency, axes: { baziMain, ziweiMain, fusedAxis }, dims, conflicts, conclusion }
}
