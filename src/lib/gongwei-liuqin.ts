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

/**
 * 男命六亲星对照
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
 * 女命六亲星对照
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

function liuQinName(shiShen: string, gender: Gender): string {
  return gender === '男' ? maleLiuQinXing(shiShen) : femaleLiuQinXing(shiShen)
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
 */
export function analyzeLiuQin(
  riGan: string,
  pills: { gan: string; zhi: string }[],
  gender: Gender,
  ss: (r: string, g: string) => string
): LiuQinOutput {
  const gans = pills.map(p => p.gan)
  const zhis = pills.map(p => p.zhi)
  const riZhi = zhis[2]

  const nianZhu: string[] = []
  const yueZhu: string[] = []
  const riZhiOut: string[] = []
  const shiZhu: string[] = []
  const xingGong: string[] = []
  const summary: string[] = []

  // ────────── 年柱：祖上宫 ──────────
  const nGan = gans[0], nZhi = zhis[0]
  const nSS = ss(riGan, nGan)

  nianZhu.push(`年柱【${nGan}${nZhi}】祖上宫（0-16岁童年原生根基）`)

  // 年干 = 祖父/外公/父亲/祖上男性
  const nLq = liuQinName(nSS, gender)
  if (nLq) {
    nianZhu.push(`年干 ${nGan} = ${nSS}（${nLq}）`)
  } else {
    nianZhu.push(`年干 ${nGan} = ${nSS}`)
  }
  nianZhu.push(`年支 ${nZhi} = 祖母/外婆/祖上女性环境`)

  // ────────── 月柱：父母宫/兄弟宫/门户宫 ──────────
  const yGan = gans[1], yZhi = zhis[1]
  const ySS = ss(riGan, yGan)

  yueZhu.push(`月柱【${yGan}${yZhi}】父母兄弟宫·门户（16-32岁原生家庭）`)

  // 月干 = 父亲/兄长/家族男性
  const yLq = liuQinName(ySS, gender)
  if (yLq) {
    yueZhu.push(`月干 ${yGan} = ${ySS}（${yLq}）`)
    xingGong.push(`★ 月干 ${yGan}（${ySS}=${yLq}）在父母兄弟宫`)
  } else {
    yueZhu.push(`月干 ${yGan} = ${ySS}`)
  }

  yueZhu.push(`月支 ${yZhi} = 母亲/姐妹/同辈亲友的环境`)

  // 月柱比劫 → 兄弟姐妹/朋友
  for (let i = 0; i < gans.length; i++) {
    const pSS = ss(riGan, gans[i])
    if (pSS === '比肩' || pSS === '劫财') {
      const pos = POS_NAMES[i]
      if (pos === '月') {
        yueZhu.push(`★ 月干 ${gans[i]}是${pSS}——兄弟姐妹/同辈朋友透出在门户宫`)
      }
    }
  }

  // ────────── 日柱：自身宫 + 夫妻宫 ──────────
  riZhiOut.push(`日干【${riGan}】= 命主本人（你）`)
  riZhiOut.push(`日支【${riZhi}】夫妻宫 = 配偶（丈夫/妻子）`)

  // 日支藏干 → 配偶的特质/性格
  const riCangMap: Record<string,string[]> = {
    '子':['癸'], '丑':['己','癸','辛'], '寅':['甲','丙','戊'],
    '卯':['乙'], '辰':['戊','乙','癸'], '巳':['丙','庚','戊'],
    '午':['丁','己'], '未':['己','丁','乙'], '申':['庚','壬','戊'],
    '酉':['辛'], '戌':['戊','辛','丁'], '亥':['壬','甲']
  }
  const riCang = riCangMap[riZhi] || []

  if (riCang.length > 0) {
    const desc = riCang.map(c => `${c}（${ss(riGan, c)}）`).join('、')
    riZhiOut.push(`日支 ${riZhi} 藏干：${desc}`)
    for (const c of riCang) {
      const cSS = ss(riGan, c)
      const cLq = liuQinName(cSS, gender)
      if (cLq) {
        riZhiOut.push(`  藏干 ${c} = ${cSS}（配偶星=${cLq}）坐在夫妻宫——星入本宫，配偶缘厚。`)
        xingGong.push(`★ 日支 ${riZhi} 藏 ${c}（${cSS}=${cLq}）坐在夫妻宫——婚姻核心`)
      } else {
        riZhiOut.push(`  藏干 ${c} = ${cSS}，藏在夫妻宫构成配偶心性。`)
      }
    }
  }

  // ────────── 时柱：子女宫 ──────────
  const sGan = gans[3], sZhi = zhis[3]
  const sSS = ss(riGan, sGan)

  shiZhu.push(`时柱【${sGan}${sZhi}】子女宫·晚辈宫（48岁后晚年归宿）`)

  const sLq = liuQinName(sSS, gender)
  if (sLq) {
    shiZhu.push(`时干 ${sGan} = ${sSS}（${sLq}）`)
    xingGong.push(`★ 时干 ${sGan}（${sSS}=${sLq}）在子女宫`)
  } else {
    shiZhu.push(`时干 ${sGan} = ${sSS}`)
  }

  shiZhu.push(`时支 ${sZhi} = 女儿/晚辈女性/下属环境`)

  // ────────── 星宫同参总览 ──────────
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

  return { nianZhu, yueZhu, riZhi: riZhiOut, shiZhu, xingGong, summary }
}
