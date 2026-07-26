/**
 * 四柱六亲宫位 - 星宫同参体系
 * 
 * 核心逻辑：
 *   四柱 = 六亲宫位（亲人住所）
 *   十神 = 六亲星（亲人本身）
 *   断六亲必须星宫同参，星入本宫则缘厚，星居他宫则缘疏
 * 
 * 四柱宫位（通用）：
 *   年柱：祖上宫（祖辈、早年环境）
 *   月柱：父母宫、兄弟宫、门户宫（原生家庭核心）
 *   日柱：自身宫（日干=命主）+ 夫妻宫（日支=配偶）
 *   时柱：子女宫、晚辈宫、晚年归宿宫
 * 
 * 男命十神六亲：
 *   偏财=父  正印=母  比肩=兄弟  劫财=姐妹
 *   正财=妻  七杀=子  正官=女
 * 
 * 女命十神六亲：
 *   正财=父  偏印=母  比肩=姐妹  劫财=兄弟
 *   正官=夫  七杀=情人/二婚  伤官=子  食神=女
 */

export type Gender = '男' | '女'

const POS_NAMES = ['年','月','日','时'] as const
type PosName = typeof POS_NAMES[number]

/** 六亲翻译表（英/日/韩） */
const LIUQIN_MALE_EN: Record<string,string> = {
  '偏财':'Father', '正印':'Mother', '比肩':'Brother',
  '劫财':'Sister/Rival', '正财':'Wife',
  '七杀':'Son', '正官':'Daughter',
  '食神':'Grandchildren', '伤官':'Grandchildren'
}
const LIUQIN_FEMALE_EN: Record<string,string> = {
  '正财':'Father', '偏印':'Mother', '比肩':'Sister/Friend',
  '劫财':'Brother/Father-in-law', '正官':'Husband',
  '七杀':'Lover/Extra', '伤官':'Son', '食神':'Daughter'
}
const LIUQIN_MALE_JA: Record<string,string> = {
  '偏财':'父', '正印':'母', '比肩':'兄弟',
  '劫财':'姉妹/恋敵', '正财':'妻',
  '七杀':'息子', '正官':'娘',
  '食神':'孫', '伤官':'孫'
}
const LIUQIN_FEMALE_JA: Record<string,string> = {
  '正财':'父', '偏印':'母', '比肩':'姉妹/友',
  '劫财':'兄弟/義父', '正官':'夫',
  '七杀':'恋人/再婚', '伤官':'息子', '食神':'娘'
}
const LIUQIN_MALE_KO: Record<string,string> = {
  '偏财':'아버지', '正印':'어머니', '比肩':'형제',
  '劫财':'자매/연적', '正财':'아내',
  '七杀':'아들', '正官':'딸',
  '食神':'손주', '伤官':'손주'
}
const LIUQIN_FEMALE_KO: Record<string,string> = {
  '正财':'아버지', '偏印':'어머니', '比肩':'자매/친구',
  '劫财':'형제/시아버지', '正官':'남편',
  '七杀':'애인/재혼', '伤官':'아들', '食神':'딸'
}

/**
 * 男命六亲星对照（中文）
 */
function maleLiuQinXing(shiShen: string): string {
  const map: Record<string,string> = {
    '偏财':'父亲',
    '正印':'母亲',
    '比肩':'兄弟',
    '劫财':'姐妹/情敌',
    '正财':'原配妻子',
    '七杀':'儿子',
    '正官':'女儿',
    '食神':'儿孙晚辈',
    '伤官':'儿孙晚辈'
  }
  return map[shiShen] || ''
}

/**
 * 女命六亲星对照（中文）
 */
function femaleLiuQinXing(shiShen: string): string {
  const map: Record<string,string> = {
    '正财':'父亲',
    '偏印':'母亲',
    '比肩':'姐妹/闺蜜',
    '劫财':'兄弟/公公',
    '正官':'原配丈夫',
    '七杀':'情人/偏缘/二婚',
    '伤官':'儿子',
    '食神':'女儿'
  }
  return map[shiShen] || ''
}

function liuQinName(shiShen: string, gender: Gender, lang?: string): string {
  const cn = gender === '男' ? maleLiuQinXing(shiShen) : femaleLiuQinXing(shiShen)
  if (!lang || lang === 'zh-CN' || lang === 'zh-TW') return cn
  if (lang === 'en') return gender === '男' ? (LIUQIN_MALE_EN[shiShen] || '') : (LIUQIN_FEMALE_EN[shiShen] || '')
  if (lang === 'ja') return gender === '男' ? (LIUQIN_MALE_JA[shiShen] || '') : (LIUQIN_FEMALE_JA[shiShen] || '')
  if (lang === 'ko') return gender === '男' ? (LIUQIN_MALE_KO[shiShen] || '') : (LIUQIN_FEMALE_KO[shiShen] || '')
  return cn
}

export interface LiuQinOutput {
  nianZhu: string[]
  yueZhu: string[]
  riZhi: string[]
  shiZhu: string[]
  xingGong: string[]
  summary: string[]
}

/**
 * 主分析函数：四柱六亲宫位完整输出
 * 
 * @param riGan - 日干
 * @param pills - 四柱干支 [年,月,日,时]
 * @param gender - 性别
 * @param ss - 十神计算函数 (riGan, gan) => 十神名
 * @param lang - 语言
 */
export function analyzeLiuQin(
  riGan: string,
  pills: { gan: string; zhi: string }[],
  gender: Gender,
  ss: (r: string, g: string) => string,
  lang?: string
): LiuQinOutput {
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riZhi = zhis[2]
  const isCN = !lang || lang === 'zh-CN' || lang === 'zh-TW'

  const nianZhu: string[] = []
  const yueZhu: string[] = []
  const riZhiOut: string[] = []
  const shiZhu: string[] = []
  const xingGong: string[] = []
  const summary: string[] = []

  // ────────── 年柱：祖上宫 ──────────
  const nGan = gans[0], nZhi = zhis[0]
  const nSS = ss(riGan, nGan)

  if (isCN) {
    nianZhu.push(`年柱【${nGan}${nZhi}】祖上宫（0-16岁童年原生根基）`)
  } else if (lang === 'en') {
    nianZhu.push(`Year Pillar [${nGan}${nZhi}] Ancestral Palace (0-16 childhood roots)`)
  } else if (lang === 'ja') {
    nianZhu.push(`年柱【${nGan}${nZhi}】祖上宮（0-16歳 幼少期の基盤）`)
  } else if (lang === 'ko') {
    nianZhu.push(`년주【${nGan}${nZhi}】조상궁（0-16세 유년기 기반）`)
  }

  const nLq = liuQinName(nSS, gender, lang)
  if (isCN) {
    if (nLq) nianZhu.push(`年干 ${nGan} = ${nSS}（${nLq}）`)
    else nianZhu.push(`年干 ${nGan} = ${nSS}`)
    nianZhu.push(`年支 ${nZhi} = 祖母/外婆/祖上女性环境`)
  } else if (lang === 'en') {
    if (nLq) nianZhu.push(`Year Stem ${nGan} = ${nSS} (${nLq})`)
    else nianZhu.push(`Year Stem ${nGan} = ${nSS}`)
    nianZhu.push(`Year Branch ${nZhi} = Grandmother / ancestral female environment`)
  } else if (lang === 'ja') {
    if (nLq) nianZhu.push(`年干 ${nGan} = ${nSS}（${nLq}）`)
    else nianZhu.push(`年干 ${nGan} = ${nSS}`)
    nianZhu.push(`年支 ${nZhi} = 祖母／祖上女性の環境`)
  } else if (lang === 'ko') {
    if (nLq) nianZhu.push(`연간 ${nGan} = ${nSS}（${nLq}）`)
    else nianZhu.push(`연간 ${nGan} = ${nSS}`)
    nianZhu.push(`연지 ${nZhi} = 조모／조상 여성 환경`)
  }

  // ────────── 月柱：父母宫/兄弟宫/门户宫 ──────────
  const yGan = gans[1], yZhi = zhis[1]
  const ySS = ss(riGan, yGan)

  if (isCN) {
    yueZhu.push(`月柱【${yGan}${yZhi}】父母兄弟宫·门户（16-32岁原生家庭）`)
  } else if (lang === 'en') {
    yueZhu.push(`Month Pillar [${yGan}${yZhi}] Parent-Sibling Palace (16-32 family)`)
  } else if (lang === 'ja') {
    yueZhu.push(`月柱【${yGan}${yZhi}】父母兄弟宮·門戸（16-32歳 出生家庭）`)
  } else if (lang === 'ko') {
    yueZhu.push(`월주【${yGan}${yZhi}】부모형제궁·문호（16-32세 원가족）`)
  }

  const yLq = liuQinName(ySS, gender, lang)
  if (isCN) {
    if (yLq) { yueZhu.push(`月干 ${yGan} = ${ySS}（${yLq}）`); xingGong.push(`★ 月干 ${yGan}（${ySS}=${yLq}）在父母兄弟宫`) }
    else yueZhu.push(`月干 ${yGan} = ${ySS}`)
    yueZhu.push(`月支 ${yZhi} = 母亲/姐妹/同辈亲友的环境`)
  } else if (lang === 'en') {
    if (yLq) { yueZhu.push(`Month Stem ${yGan} = ${ySS} (${yLq})`); xingGong.push(`★ Month Stem ${yGan} (${ySS}=${yLq}) in Parent-Sibling Palace`) }
    else yueZhu.push(`Month Stem ${yGan} = ${ySS}`)
    yueZhu.push(`Month Branch ${yZhi} = Mother / sisters / peer environment`)
  } else if (lang === 'ja') {
    if (yLq) { yueZhu.push(`月干 ${yGan} = ${ySS}（${yLq}）`); xingGong.push(`★ 月干 ${yGan}（${ySS}=${yLq}）父母兄弟宮に在る`) }
    else yueZhu.push(`月干 ${yGan} = ${ySS}`)
    yueZhu.push(`月支 ${yZhi} = 母／姉妹／同輩の環境`)
  } else if (lang === 'ko') {
    if (yLq) { yueZhu.push(`월간 ${yGan} = ${ySS}（${yLq}）`); xingGong.push(`★ 월간 ${yGan}（${ySS}=${yLq}）부모형제궁에 있음`) }
    else yueZhu.push(`월간 ${yGan} = ${ySS}`)
    yueZhu.push(`월지 ${yZhi} = 모친／자매／동료 환경`)
  }

  // 月柱比劫 → 兄弟姐妹/朋友
  for (let i = 0; i < gans.length; i++) {
    const pSS = ss(riGan, gans[i])
    if (pSS === '比肩' || pSS === '劫财') {
      const pos = POS_NAMES[i]
      if (pos === '月') {
        if (isCN) yueZhu.push(`★ 月干 ${gans[i]}是${pSS}——兄弟姐妹/同辈朋友透出在门户宫`)
        else if (lang === 'en') yueZhu.push(`★ Month Stem ${gans[i]} is ${pSS} — siblings/peers manifest in Gate Palace`)
        else if (lang === 'ja') yueZhu.push(`★ 月干 ${gans[i]}は${pSS}——兄弟姉妹・同輩が門戸宮に現れる`)
        else if (lang === 'ko') yueZhu.push(`★ 월간 ${gans[i]}은 ${pSS}——형제자매·동료가 문호궁에 나타남`)
      }
    }
  }

  // ────────── 日柱：自身宫 + 夫妻宫 ──────────
  if (isCN) {
    riZhiOut.push(`日干【${riGan}】= 命主本人（你）`)
    riZhiOut.push(`日支【${riZhi}】夫妻宫 = 配偶（丈夫/妻子）`)
  } else if (lang === 'en') {
    riZhiOut.push(`Day Stem [${riGan}] = You (the native)`)
    riZhiOut.push(`Day Branch [${riZhi}] Spouse Palace = Partner (husband/wife)`)
  } else if (lang === 'ja') {
    riZhiOut.push(`日干【${riGan}】= 命主本人（あなた）`)
    riZhiOut.push(`日支【${riZhi}】夫妻宮 = 配偶者（夫/妻）`)
  } else if (lang === 'ko') {
    riZhiOut.push(`일간【${riGan}】= 명주 본인（당신）`)
    riZhiOut.push(`일지【${riZhi}】부처궁 = 배우자（남편/아내）`)
  }

  const riCangMap: Record<string,string[]> = {
    '子':['癸'], '丑':['己','癸','辛'], '寅':['甲','丙','戊'],
    '卯':['乙'], '辰':['戊','乙','癸'], '巳':['丙','庚','戊'],
    '午':['丁','己'], '未':['己','丁','乙'], '申':['庚','壬','戊'],
    '酉':['辛'], '戌':['戊','辛','丁'], '亥':['壬','甲']
  }
  const riCang = riCangMap[riZhi] || []

  if (riCang.length > 0) {
    const desc = riCang.map(c => `${c}（${ss(riGan, c)}）`).join('、')
    if (isCN) riZhiOut.push(`日支 ${riZhi} 藏干：${desc}`)
    else if (lang === 'en') riZhiOut.push(`Day Branch ${riZhi} hidden stems: ${desc}`)
    else if (lang === 'ja') riZhiOut.push(`日支 ${riZhi} 蔵干：${desc}`)
    else if (lang === 'ko') riZhiOut.push(`일지 ${riZhi} 장간：${desc}`)
    for (const c of riCang) {
      const cSS = ss(riGan, c)
      const cLq = liuQinName(cSS, gender, lang)
      if (cLq) {
        if (isCN) {
          riZhiOut.push(`  藏干 ${c} = ${cSS}（配偶星=${cLq}）坐在夫妻宫——星入本宫，配偶缘厚。`)
          xingGong.push(`★ 日支 ${riZhi} 藏 ${c}（${cSS}=${cLq}）坐在夫妻宫——婚姻核心`)
        } else if (lang === 'en') {
          riZhiOut.push(`  Hidden ${c} = ${cSS} (spouse star=${cLq}) in Spouse Palace — strong marriage bond.`)
          xingGong.push(`★ Day Branch ${riZhi} hides ${c} (${cSS}=${cLq}) in Spouse Palace — marriage core`)
        } else if (lang === 'ja') {
          riZhiOut.push(`  蔵干 ${c} = ${cSS}（配偶星=${cLq}）夫妻宮に在る——星が本宮に入り配偶縁厚い`)
          xingGong.push(`★ 日支 ${riZhi} 蔵 ${c}（${cSS}=${cLq}）夫妻宮に坐す——婚姻の核`)
        } else if (lang === 'ko') {
          riZhiOut.push(`  장간 ${c} = ${cSS}（배우자성=${cLq}）부처궁에 앉음——성(星)이 본궁에 들어 배우자 인연이 두터움`)
          xingGong.push(`★ 일지 ${riZhi} 장 ${c}（${cSS}=${cLq}）부처궁에 앉음——혼인의 핵심`)
        }
      } else {
        if (isCN) riZhiOut.push(`  藏干 ${c} = ${cSS}，藏在夫妻宫构成配偶心性。`)
        else if (lang === 'en') riZhiOut.push(`  Hidden ${c} = ${cSS}, hidden in Spouse Palace shaping partner's nature.`)
        else if (lang === 'ja') riZhiOut.push(`  蔵干 ${c} = ${cSS}、夫妻宮に蔵れて配偶者の心性を構成。`)
        else if (lang === 'ko') riZhiOut.push(`  장간 ${c} = ${cSS}、부처궁에 숨어 배우자 심성을 구성。`)
      }
    }
  }

  // ────────── 时柱：子女宫 ──────────
  const sGan = gans[3], sZhi = zhis[3]
  const sSS = ss(riGan, sGan)

  if (isCN) {
    shiZhu.push(`时柱【${sGan}${sZhi}】子女宫·晚辈宫（48岁后晚年归宿）`)
  } else if (lang === 'en') {
    shiZhu.push(`Hour Pillar [${sGan}${sZhi}] Children Palace (48+ later years)`)
  } else if (lang === 'ja') {
    shiZhu.push(`時柱【${sGan}${sZhi}】子女宮·晚辈宮（48歳以降の晩年）`)
  } else if (lang === 'ko') {
    shiZhu.push(`시주【${sGan}${sZhi}】자녀궁·후배궁（48세 이후 만년）`)
  }

  const sLq = liuQinName(sSS, gender, lang)
  if (isCN) {
    if (sLq) { shiZhu.push(`时干 ${sGan} = ${sSS}（${sLq}）`); xingGong.push(`★ 时干 ${sGan}（${sSS}=${sLq}）在子女宫`) }
    else shiZhu.push(`时干 ${sGan} = ${sSS}`)
    shiZhu.push(`时支 ${sZhi} = 女儿/晚辈女性/下属环境`)
  } else if (lang === 'en') {
    if (sLq) { shiZhu.push(`Hour Stem ${sGan} = ${sSS} (${sLq})`); xingGong.push(`★ Hour Stem ${sGan} (${sSS}=${sLq}) in Children Palace`) }
    else shiZhu.push(`Hour Stem ${sGan} = ${sSS}`)
    shiZhu.push(`Hour Branch ${sZhi} = Daughter / younger females / subordinate environment`)
  } else if (lang === 'ja') {
    if (sLq) { shiZhu.push(`時干 ${sGan} = ${sSS}（${sLq}）`); xingGong.push(`★ 時干 ${sGan}（${sSS}=${sLq}）子女宮に在る`) }
    else shiZhu.push(`時干 ${sGan} = ${sSS}`)
    shiZhu.push(`時支 ${sZhi} = 娘／後輩女性／部下の環境`)
  } else if (lang === 'ko') {
    if (sLq) { shiZhu.push(`시간 ${sGan} = ${sSS}（${sLq}）`); xingGong.push(`★ 시간 ${sGan}（${sSS}=${sLq}）자녀궁에 있음`) }
    else shiZhu.push(`시간 ${sGan} = ${sSS}`)
    shiZhu.push(`시지 ${sZhi} = 딸／후배 여성／부하 환경`)
  }

  // ────────── 星宫同参总览 ──────────
  if (isCN) {
    summary.push('━━━ 四柱六亲宫位总览 ━━━')
    summary.push(`年柱 ${nGan}${nZhi} · 祖上宫——0-16岁 童年根基`)
    summary.push(`月柱 ${yGan}${yZhi} · 父母兄弟宫——16-32岁 原生家庭+同辈社交`)
    summary.push(`日柱 ${riGan}${riZhi} · 自身宫+夫妻宫——32-48岁 一生重心`)
    summary.push(`时柱 ${sGan}${sZhi} · 子女宫——48岁后 晚年归宿`)
    if (xingGong.length > 0) {
      summary.push('')
      summary.push('━━━ 星宫同参（六亲星位置） ━━━')
      summary.push(...xingGong)
    }
  } else if (lang === 'en') {
    summary.push('━━━ Four Pillars Six-Relations Overview ━━━')
    summary.push(`Year ${nGan}${nZhi} · Ancestral Palace — 0-16 childhood roots`)
    summary.push(`Month ${yGan}${yZhi} · Parent-Sibling Palace — 16-32 family + peer social`)
    summary.push(`Day ${riGan}${riZhi} · Self + Spouse Palace — 32-48 life focus`)
    summary.push(`Hour ${sGan}${sZhi} · Children Palace — 48+ later years`)
    if (xingGong.length > 0) {
      summary.push('')
      summary.push('━━━ Star & Palace Synergy (Liuqin Star Positions) ━━━')
      summary.push(...xingGong)
    }
  } else if (lang === 'ja') {
    summary.push('━━━ 四柱六親宮位一覧 ━━━')
    summary.push(`年柱 ${nGan}${nZhi} · 祖上宮—0-16歳 幼少期の基盤`)
    summary.push(`月柱 ${yGan}${yZhi} · 父母兄弟宮—16-32歳 出身家庭＋同世代交流`)
    summary.push(`日柱 ${riGan}${riZhi} · 自身宮＋夫妻宮—32-48歳 人生の中心`)
    summary.push(`時柱 ${sGan}${sZhi} · 子女宮—48歳以降 晩年`)
    if (xingGong.length > 0) {
      summary.push('')
      summary.push('━━━ 星宮同参（六親星位置） ━━━')
      summary.push(...xingGong)
    }
  } else if (lang === 'ko') {
    summary.push('━━━ 사주 육친 궁위 개요 ━━━')
    summary.push(`년주 ${nGan}${nZhi} · 조상궁—0-16세 유년기 기반`)
    summary.push(`월주 ${yGan}${yZhi} · 부모형제궁—16-32세 원가족＋동료 교류`)
    summary.push(`일주 ${riGan}${riZhi} · 자신궁＋부처궁—32-48세 인생의 중심`)
    summary.push(`시주 ${sGan}${sZhi} · 자녀궁—48세 이후 만년`)
    if (xingGong.length > 0) {
      summary.push('')
      summary.push('━━━ 성궁동참（육친성 위치） ━━━')
      summary.push(...xingGong)
    }
  }

  return { nianZhu, yueZhu, riZhi: riZhiOut, shiZhu, xingGong, summary }
}
