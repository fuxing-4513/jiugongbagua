// ═════════════════════════════════════════
//  大运/流年/婚姻专项判断
// ═════════════════════════════════════════
import { WU_XING, CANG_GAN, KU_MAP, ROOT_MAP, ZHI_WU_XING, ZHI_NATURE, WX_NATURE, PEI_OU_CHAR,
  LIU_HE, LIU_CHONG, LIU_CHUAN, SAN_XING, HE_REN, SAN_XING_MEANING, ZI_HE_MEANING,
  ZUO_YONG_BEN_ZHI, GAN_JIA_ZI_QIN_QING, SI_KU_PIN_ZHI, SAN_HUI, SAN_HE, ZI_HE,
  TONG_GEN_LIAN_TI, TAO_HUA_MAP, TAO_HUA_POS, GAN_BODY_ORGAN, WU_XING_SICK, WU_XING_ORGAN,
  SHENG_CYCLE, KE_CYCLE, CHONG_SAME_PAIRS, BEST_YIN_KU, WAN_WU,
  WX_SEASON, STRONG_ROOTS, MEDIUM_ROOTS,
  wx, zhiWx, zhiKu, ss, sst, isCai, isGuan, isYin, isSS, isBJ,
  getFlowGZ, isGanInChart, wxStrength,
  evalZhiPower, isSameTypeChong, evalChongOrder, evalChongCan
} from './bazi-judgment-shared'

// ──── 大运断事(含R1 R3 R5 R14)═══════════════

export function daYunJudgeV2(
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

export function flowYearV2(ri: string, pills: {gan:string;zhi:string}[],
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

export function wanHun(ri: string, pills: {gan:string;zhi:string}[], gen: string): string[] {
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

export function liHun(ri: string, pills: {gan:string;zhi:string}[], gen: string): string[] {
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

export function jieHun(ri: string, pills: {gan:string;zhi:string}[], gen: string, dg?: string): string[] {
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
// ════════════════════════════════════════════════════════════

export function daYunFourStep(
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

