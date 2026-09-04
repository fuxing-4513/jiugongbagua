/**
 * 奇门遁甲 · 白话解读（原创文案）
 *
 * 断语定位：面向大众的「决策参考」，措辞偏温和、留余地，不做宿命式断言。
 * 依据只取排盘结果中的客观符号（落宫 / 门 / 星 / 神 / 三奇 / 空亡），
 * 组合规则为本站自行归纳的白话化经验表达，非任何古籍原文照抄。
 */

import type { QimenChart, PalaceCell } from './qimen-engine'
import { buildPalaceCells, PALACE_DIRECTION_FULL, palaceName } from './qimen-engine'

/* ────────────────────────── 静态文案库（原创） ────────────────────────── */

export interface DoorInfo {
  luck: '大吉' | '吉' | '平' | '凶' | '大凶'
  element: '水' | '土' | '木' | '火' | '金'
  oneLine: string   // 白话一句话印象
  suit: string      // 这个门"顺"的事
  avoid: string     // 这个门"拧"的事
}

export const DOOR_INFO: Record<string, DoorInfo> = {
  休: { luck: '吉', element: '水', oneLine: '休门是养精蓄锐的门，安安静静待着也能攒运。', suit: '休整、求稳、见贵人、处理家庭内务', avoid: '急着冲锋、硬碰硬闯关' },
  生: { luck: '大吉', element: '土', oneLine: '生门是八门里最旺财气的门，生意、进账都爱沾它。', suit: '求财、开业、谈合作、置业、见长辈', avoid: '纠结琐事、在小钱上反复拉扯' },
  伤: { luck: '凶', element: '木', oneLine: '伤门带冲劲也带损耗，适合"攻"，不适合"守"。', suit: '讨债、起诉、竞争、运动竞技', avoid: '投资下重注、意气用事、开新车远行' },
  杜: { luck: '平', element: '木', oneLine: '杜门是关起来做事的气场，宜藏不宜露。', suit: '保密、学习充电、闭关赶工、技术钻研', avoid: '公开亮相、出远门、大张旗鼓' },
  景: { luck: '平', element: '火', oneLine: '景门亮眼，是"被看见"的门，场面事用它正好。', suit: '演讲汇报、考试面试、宣传推广、表白', avoid: '烧钱撑场面、冲动消费' },
  死: { luck: '大凶', element: '土', oneLine: '死门是收束终结的气场，宜了断，不宜开新局。', suit: '收尾、清理、了结旧事、祭扫', avoid: '启动新项目、借贷担保、长途搬迁' },
  惊: { luck: '凶', element: '金', oneLine: '惊门口舌是非多，气场像绷紧的弦。', suit: '谈判交锋、辩论、防患检查、签约把关', avoid: '随口承诺、背后议论、高风险投机' },
  开: { luck: '大吉', element: '金', oneLine: '开门是万事开头顺的门，新事新路都愿意给它让道。', suit: '开业、上任、出行、签约、见领导', avoid: '磨蹭拖延、半途改主意' },
}

export interface StarInfo {
  luck: '大吉' | '吉' | '平' | '凶' | '大凶'
  element: '水' | '土' | '木' | '火' | '金'
  oneLine: string
}

export const STAR_INFO: Record<string, StarInfo> = {
  蓬: { luck: '凶', element: '水', oneLine: '天蓬星属水，点子多胆子大，但容易沾投机与是非。' },
  芮: { luck: '凶', element: '土', oneLine: '天芮星属土，主杂事缠身，尤其留意健康与口舌。' },
  冲: { luck: '平', element: '木', oneLine: '天冲星属木，行动快、变化多，适合速战速决。' },
  辅: { luck: '吉', element: '木', oneLine: '天辅星属木，主文教庇护，读书考试、求人指点都顺。' },
  禽: { luck: '吉', element: '土', oneLine: '天禽星居中属土，稳重厚道，是"守得住"的星。' },
  心: { luck: '吉', element: '金', oneLine: '天心星属金，主谋划与医药，想方案、看病问诊都合适。' },
  柱: { luck: '凶', element: '金', oneLine: '天柱星属金，嘴利言锋，宜防口舌，不宜强出头。' },
  任: { luck: '吉', element: '土', oneLine: '天任星属土，踏实积累，走稳步子反而走得远。' },
  英: { luck: '平', element: '火', oneLine: '天英星属火，好名声也爱面子，场合事得力，私事易虚。' },
}

export interface GodInfo {
  tone: '吉' | '平' | '凶'
  oneLine: string
}

export const GOD_INFO: Record<string, GodInfo> = {
  值符: { tone: '吉', oneLine: '值符如主帅坐镇，气场正，遇事有人撑、有章法。' },
  螣蛇: { tone: '凶', oneLine: '螣蛇主虚惊缠绕，事情容易变来变去，别轻信表象。' },
  太阴: { tone: '吉', oneLine: '太阴喜暗处使劲，私下筹备、幕后推动比公开嚷嚷更顺。' },
  六合: { tone: '吉', oneLine: '六合主合作与牵线，谈对象、谈合作、找中间人都加分。' },
  白虎: { tone: '凶', oneLine: '白虎带压力与竞争，防磕碰是非，硬碰硬容易两败俱伤。' },
  玄武: { tone: '凶', oneLine: '玄武主暗耗与隐瞒，防小人、防失窃，签字前多看几眼。' },
  九地: { tone: '平', oneLine: '九地是伏藏的气场，宜守不宜攻，稳扎稳打最划算。' },
  九天: { tone: '吉', oneLine: '九天是上扬的气场，宜进取高飞，远大计划可以往前推。' },
}

const SANQI: Record<string, string> = {
  乙: '乙奇（日奇）——柔和迂回，以柔克刚',
  丙: '丙奇（月奇）——光明威猛，果断出击',
  丁: '丁奇（星奇）——灵动机巧，贵人暗中相助',
}

export { SANQI }

/* 宫位吉凶底色（供简注排序） */
const DOOR_SCORE: Record<string, number> = { 大吉: 2, 吉: 1, 平: 0, 凶: -1, 大凶: -2 }
const STAR_SCORE: Record<string, number> = { 大吉: 1, 吉: 1, 平: 0, 凶: -1, 大凶: -2 }
const GOD_SCORE: Record<string, number> = { 吉: 1, 平: 0, 凶: -1 }

/* ────────────────────────── 数据提取 ────────────────────────── */

export interface KeyPalace {
  no: number
  name: string
  direction: string
  door: string
  star: string
  god: string
  skyGan: string
  earthGan: string
  score: number
  note: string
}

function palaceOfGan(cells: PalaceCell[], gan: string, layer: 'sky' | 'earth'): PalaceCell | undefined {
  return cells.find((c) => (layer === 'sky' ? c.skyGan : c.earthGan) === gan)
}

export interface QimenReading {
  /** 日干（用神/求测人）在天盘落宫 */
  dayPalace: KeyPalace | null
  /** 时干（所测之事）在天盘落宫 */
  hourPalace: KeyPalace | null
  /** 时干在地盘之宫 = 值符加时干处（事体气机所在） */
  zhifuPalace: KeyPalace | null
  /** 值使落宫（事态走向） */
  zhishiPalace: KeyPalace | null
  palaceNotes: { cell: PalaceCell; score: number; text: string }[]
  /** 全局倾向与建议（原创白话） */
  summary: string[]
  /** 四个面向的简明倾向 */
  actions: { key: '求财' | '合作' | '出行' | '行事'; level: '顺' | '中' | '慎'; text: string }[]
}

function cellScore(cell: PalaceCell): number {
  let s = 0
  if (cell.door) s += DOOR_SCORE[DOOR_INFO[cell.door]?.luck ?? '平'] ?? 0
  if (cell.star) s += STAR_SCORE[STAR_INFO[cell.star]?.luck ?? '平'] ?? 0
  if (cell.god) s += GOD_SCORE[GOD_INFO[cell.god]?.tone ?? '平'] ?? 0
  if (cell.skyGan && SANQI[cell.skyGan]) s += 1
  if (cell.earthGan && SANQI[cell.earthGan]) s += 0.5
  return s
}

function toKeyPalace(cell: PalaceCell | undefined): KeyPalace | null {
  if (!cell) return null
  const door = cell.door ?? ''
  const star = cell.star ?? ''
  const god = cell.god ?? ''
  const parts: string[] = []
  if (door) parts.push(`${door}门${DOOR_INFO[door] ? `（${DOOR_INFO[door].luck}）` : ''}`)
  if (star) parts.push(`天${star}星`)
  if (god) parts.push(`${god}神`)
  if (cell.skyGan) parts.push(`天盘${cell.skyGan}`)
  parts.push(`临${cell.direction}方位`)
  return {
    no: cell.no,
    name: cell.name,
    direction: cell.direction,
    door,
    star,
    god,
    skyGan: cell.skyGan,
    earthGan: cell.earthGan,
    score: cellScore(cell),
    note: parts.join('，'),
  }
}

/* ────────────────────────── 主解读 ────────────────────────── */

export function interpretChart(chart: QimenChart): QimenReading {
  const cells = buildPalaceCells(chart)
  const dayGan = chart.calendar.dayPillar.gan
  const hourGan = chart.calendar.hourPillar.gan

  const dayPalace = toKeyPalace(palaceOfGan(cells, dayGan, 'sky'))
  const hourPalace = toKeyPalace(palaceOfGan(cells, hourGan, 'sky'))
  // 值符宫 = 时干在地盘之宫（八神值符起处），中宫寄坤已由引擎折算
  const zhifuCell = cells.find((c) => c.no === chart.zf.zhifuGongNo)
  const zhishiCell = cells.find((c) => c.no === chart.zf.zhishiGongNo)
  const zhifuPalace = toKeyPalace(zhifuCell)
  const zhishiPalace = toKeyPalace(zhishiCell)

  /* —— 每宫简注 —— */
  const palaceNotes = cells
    .map((cell) => {
      if (cell.isCenter) {
        const extra: string[] = []
        if (chart.zf.hourKong) extra.push(`时空亡${chart.zf.hourKong}`)
        if (chart.zf.dayKong) extra.push(`日空亡${chart.zf.dayKong}`)
        return {
          cell,
          score: 0,
          text: `中宫藏干${cell.earthGan}（天盘${cell.skyGan}）不动，${extra.join('，') || '无特别提示'}。`,
        }
      }
      const bits: string[] = []
      const door = cell.door ? DOOR_INFO[cell.door] : null
      const star = cell.star ? STAR_INFO[cell.star] : null
      const god = cell.god ? GOD_INFO[cell.god] : null
      if (door) bits.push(`${cell.door}门：${door.oneLine}`)
      if (star) bits.push(`天${cell.star}星：${star.oneLine}`)
      if (god) bits.push(`${cell.god}神：${god.oneLine}`)
      if (cell.skyGan && SANQI[cell.skyGan]) bits.push(`天盘落${SANQI[cell.skyGan].split('——')[0]}`)
      const score = cellScore(cell)
      return { cell, score, text: bits.join('') }
    })
    .sort((a, b) => b.score - a.score)

  /* —— 全局倾向 —— */
  const summary: string[] = []
  const zfDir = chart.zf ? PALACE_DIRECTION_FULL[palaceName(chart.zf.zhifuGongNo)] : ''
  const zsDir = chart.zf ? PALACE_DIRECTION_FULL[palaceName(chart.zf.zhishiGongNo)] : ''
  const dayScore = dayPalace?.score ?? 0
  const hourScore = hourPalace?.score ?? 0
  const zfScore = zhifuPalace?.score ?? 0
  const total = dayScore + hourScore + zfScore

  const head = (() => {
    const yuanNote =
      chart.ju.yuan === '上元' ? '刚换新局，气机未定' : chart.ju.yuan === '中元' ? '气机正盛，顺势而为' : '一局将尽，求稳收束'
    return `现在是${chart.ju.dun}遁${chart.ju.termName}${chart.ju.yuan}（${chart.ju.juNumber}局），${yuanNote}。`
  })()
  summary.push(head)

  if (zfScore >= 2) summary.push(`值符落在${zfDir}方（${zhifuPalace?.note ?? ''}），主帅得位，这一时辰整体气场是撑得住的，重要的事可以往前推。`)
  else if (zfScore <= -1) summary.push(`值符落宫偏弱（${zfDir}方），眼下缺个"压阵"的，大事不妨再等等，先处理能马上落地的小事。`)
  else summary.push(`值符在${zfDir}方，力量中等，顺势而为即可，不必刻意逆着它用力。`)

  summary.push(
    `值使门落在${zsDir}方${zhishiPalace?.door ? `（${zhishiPalace.door}门）` : ''}，它管的是这件事"怎么走"：${zhishiPalace?.door ? DOOR_INFO[zhishiPalace.door].oneLine : '走势平稳'}。`,
  )

  if (total >= 3) summary.push('日干、时干与值符落宫整体偏吉，属于"想做就做、容易做成"的窗口。')
  else if (total <= -2) summary.push('几个关键宫位偏弱，硬来容易碰壁，今天更适合做准备、攒资源，而不是赌一把。')
  else summary.push('吉凶参半，成败看细节：选对方向、挑对合作对象，比蛮干重要。')

  /* —— 四个面向 —— */
  const actions: QimenReading['actions'] = []
  // 求财：看生门
  const shengCell = cells.find((c) => c.door === '生') ?? cells.find((c) => c.door === '开')
  if (shengCell) {
    const sc = cellScore(shengCell)
    const dir = shengCell.direction
    actions.push({
      key: '求财',
      level: sc >= 2 ? '顺' : sc <= -1 ? '慎' : '中',
      text:
        sc >= 2
          ? `财门${shengCell.door}门落在${dir}方，宫气也旺，求财、谈进账的事可以往${dir}方向使劲。`
          : sc <= -1
            ? `${shengCell.door}门虽在${dir}方但宫气受牵制，涉及钱财要多核实、多留凭证，别急着掏钱。`
            : `财门${shengCell.door}门在${dir}方，宫气平平，赚钱的事可以张罗，但别把预期抬得太高。`,
    })
  } else {
    actions.push({ key: '求财', level: '中', text: '本时辰生门不显于八宫，求财宜缓不宜急，先守住已有进项。' })
  }
  // 合作：看六合 / 开休
  const liuheCell = cells.find((c) => c.god === '六合')
  const kaiCell = cells.find((c) => c.door === '开')
  const heScore = liuheCell ? cellScore(liuheCell) : 0
  if (liuheCell && heScore >= 1) {
    actions.push({
      key: '合作',
      level: '顺',
      text: `六合落在${liuheCell.direction}方且宫气不弱，牵线搭桥、谈合作、见中间人往这个方向走更顺。`,
    })
  } else if (liuheCell && heScore <= -1) {
    actions.push({
      key: '合作',
      level: '慎',
      text: `六合宫位受克（${liuheCell.direction}方），合作易生变数，先小范围试探，别急着交底。`,
    })
  } else if (kaiCell && DOOR_INFO[kaiCell.door ?? '开']?.luck === '大吉' && cellScore(kaiCell) >= 1) {
    actions.push({ key: '合作', level: '顺', text: `开门在${kaiCell.direction}方且气旺，与人合伙、开新篇的洽谈可以谈，条款看清即可。` })
  } else {
    actions.push({ key: '合作', level: '中', text: '合作信号不强，若要签约谈判，宜请第三方在场，白纸黑字写清楚。' })
  }
  // 出行：看开门/休门方位 + 伤杜死
  const kai = cells.find((c) => c.door === '开')
  const xiu = cells.find((c) => c.door === '休')
  const badDoor = cells.find((c) => c.door && ['伤', '死', '惊'].includes(c.door))
  const goDoor = kai && DOOR_INFO['开'].luck === '大吉' ? kai : xiu
  if (goDoor) {
    const sc = cellScore(goDoor)
    actions.push({
      key: '出行',
      level: sc >= 1 ? '顺' : sc <= -1 ? '慎' : '中',
      text:
        sc >= 1
          ? `${goDoor.door}门当令于${goDoor.direction}方，出行、办事、赴约宜选这个方向起脚。`
          : sc <= -1
            ? `${goDoor.door}门在${goDoor.direction}方但宫气偏弱，出门多留余量，重要行程避开此方更稳。`
            : `${goDoor.door}门在${goDoor.direction}方，出行无大碍，按正常安排走即可。`,
    })
  } else if (badDoor) {
    actions.push({ key: '出行', level: '慎', text: `当下${badDoor.door}门临${badDoor.direction}方，出远门、赶路要多留余量，避开这个方位更稳。` })
  } else {
    actions.push({ key: '出行', level: '中', text: '出行无特别吉凶信号，按常规安排即可，重要行程提早出发。' })
  }
  // 行事节奏：九天/九地 + 值使
  const jiuTian = cells.find((c) => c.god === '九天')
  const jiuDi = cells.find((c) => c.god === '九地')
  if (jiuTian && cellScore(jiuTian) >= 1) {
    actions.push({ key: '行事', level: '顺', text: `九天在${jiuTian.direction}方且宫气向上，适合推进新计划、抛头露面、主动出击。` })
  } else if (jiuTian && cellScore(jiuTian) <= -1) {
    actions.push({ key: '行事', level: '慎', text: `九天宫位受牵制，冲劲容易使错地方，出头的事缓一缓，先想清楚再动。` })
  } else if (jiuDi && cellScore(jiuDi) >= 1) {
    actions.push({ key: '行事', level: '中', text: `九地当位（${jiuDi.direction}方），气是沉的，适合闷头做事、巩固基本盘，不宜高调宣战。` })
  } else {
    actions.push({ key: '行事', level: '中', text: '没有明显的攻守信号，按你自己的节奏走，重要决定过一夜再拍板。' })
  }

  return { dayPalace, hourPalace, zhifuPalace, zhishiPalace, palaceNotes, summary, actions }
}

/** 取某宫门/星/神的吉凶字色提示（给 UI 用） */
export function luckText(kind: 'door' | 'star', name: string): string {
  if (kind === 'door') return DOOR_INFO[name]?.luck ?? '平'
  return STAR_INFO[name]?.luck ?? '平'
}
