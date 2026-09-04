/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  时家奇门遁甲 · 完整排盘引擎（转盘派 · 拆补法定局）
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  算法正统性说明（公开规则，逐条落实）：
 *
 *  ① 干支四柱
 *     - 年柱：以「立春」为岁首换年；月柱：以十二「节」（立春/惊蛰/清明/立夏/芒种/小暑/
 *       立秋/白露/寒露/立冬/大雪/小寒）为界换月，月干按年干「五虎遁」（甲己之年丙作首…）；
 *       日柱：公历日干支按 60 甲子连续推算；时柱：按日干「五鼠遁」（甲己还加甲…）。
 *     - 历法基准采用寿星天文历（lunar-typescript，与本站黄历/八字同源），节气交接时刻
 *       精度到秒级；本项目其余页面（黄历/八字/择日）均使用同一内核，保证站内互相可查。
 *     - 子时换日：23:00–23:59 视为次日子时（时家奇门排盘通行口径），日干/时干同步换新。
 *       （另一派「晚子时归当日」不作默认，可自行换算。）
 *
 *  ② 拆补法定局
 *     - 24 节气共分 12 个阳遁节气（冬至→芒种）与 12 个阴遁节气（夏至→大雪）；
 *       每个节气 15 日左右，分上、中、下三元，每元 5 天。
 *     - 三元判定（符头规则）：六十甲子中「甲子、己卯、甲午、己酉」四日为符头，符头所在
 *       五日为上元，其后五日为中元，再五日为下元——即 日干支序数 ÷5 之余数段定元：
 *       序数 mod15 ∈ [0,5) 上元、[5,10) 中元、[10,15) 下元。上元必起于符头日。
 *     - 局数：查「节气三元局数表」取当日所属元对应之局数（拆补法：节气一到即换本节气
 *       之局，按日干支符头段落元，不置闰；与传统置闰法的差异在跨节气数日，本引擎默认
 *       拆补法，这是当代排盘软件的主流默认口径）。
 *     - 交节以「时刻」为界（如 2024-12-21 17:20:35 冬至），该时刻前后分属两节气、两局，
 *       引擎按节气交接精确时刻判断。
 *
 *  ③ 布盘（转盘派 / 排宫法）
 *     - 地盘：三奇六仪固定顺序「戊己庚辛壬癸丁丙乙」，阳遁 X 局戊落 X 宫顺布洛书轨迹
 *       （宫数 1→2→…→9 递增，经中宫）；阴遁 X 局戊落 X 宫逆布（9→8→…→1 递减经中宫）。
 *     - 值符值使：时干支所属之旬（六甲旬）首所遁之仪在地盘之宫定值符星与值使门
 *       （该宫原宫之星为值符、原宫之门为值使；中宫仪寄坤二）。值符星「加时干」落于时干
 *       地盘之宫，天盘随之整体旋转（中宫干不动）；值使门自原宫按阳顺阴逆沿九宫序数
 *       （中宫寄坤）每时辰行一步至本时。
 *     - 八门：休1 生8 伤3 杜4 景9 死2 惊7 开6 依八卦环（坎→艮→震→巽→离→坤→兑→乾）
 *       整体旋转，值使门落宫即其所在。
 *     - 九星：蓬1 芮2 冲3 辅4 禽5 心6 柱7 任8 英9；天禽寄坤二与天芮同宫，转盘时
 *       八宫星环以禽代芮（盘面星序 蓬任冲辅英禽柱心）。
 *     - 八神：值符、螣蛇、太阴、六合、白虎、玄武、九地、九天；自值符落宫起，
 *       阳遁顺布、阴遁逆布于八宫。（白虎/玄武亦作勾陈/朱雀，流派别名。）
 *     - 暗干：值使落宫起本时时干，阳顺阴逆飞布九宫（含中宫）。
 *
 *  时间口径：一律按北京时间（UTC+8）平太阳时排盘，不做真太阳时校正（与主流排盘软件
 *  默认一致；如需真太阳时请先自行换算为北京时间再输入）。
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Solar } from 'lunar-typescript'

/* ────────────────────────── 基础常量 ────────────────────────── */

export const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
export const YIQI_ORDER = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'] as const // 三奇六仪固定次序

export type GanName = (typeof GAN)[number]
export type ZhiName = (typeof ZHI)[number]

/** 九宫名：下标即宫号-1（坎1 坤2 震3 巽4 中5 乾6 兑7 艮8 离9） */
export const PALACE_NAMES = ['坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离'] as const
export type PalaceName = (typeof PALACE_NAMES)[number]
export type PalaceNo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** 洛书九宫：宫号 1–9（1坎 2坤 3震 4巽 5中 6乾 7兑 8艮 9离） */
export const PALACE_NO: Record<PalaceName, PalaceNo> = {
  坎: 1, 坤: 2, 震: 3, 巽: 4, 中: 5, 乾: 6, 兑: 7, 艮: 8, 离: 9,
}

/** 后天八卦环（八宫，几何顺时针）：坎1→艮8→震3→巽4→离9→坤2→兑7→乾6 */
export const RING8: readonly PalaceNo[] = [1, 8, 3, 4, 9, 2, 7, 6]

/** 八卦方位（白话） */
export const PALACE_DIRECTION: Record<PalaceName, string> = {
  坎: '北', 坤: '西南', 震: '东', 巽: '东南', 中: '中宫', 乾: '西北', 兑: '西', 艮: '东北', 离: '南',
}
export const PALACE_DIRECTION_FULL: Record<PalaceName, string> = {
  坎: '正北', 坤: '西南', 震: '正东', 巽: '东南', 中: '中宫', 乾: '西北', 兑: '正西', 艮: '东北', 离: '正南',
}

/** 二十四节气（自冬至起）——前 12 为阳遁（冬至→芒种），后 12 为阴遁（夏至→大雪） */
export const TERM_NAMES = [
  '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露',
  '秋分', '寒露', '霜降', '立冬', '小雪', '大雪',
] as const
export type TermName = (typeof TERM_NAMES)[number]
const TERM_SET = new Set<string>(TERM_NAMES)

/** 节气三元局数表（上元/中元/下元，拆补法与置闰法共用同一张表，出自《奇门遁甲统宗》等通行口诀）：
 *  阳遁：冬至一七四 小寒二八五 大寒三九六 立春八五二 雨水九六三 惊蛰一七四
 *        春分三九六 清明四一七 谷雨五二八 立夏四一七 小满五二八 芒种六三九
 *  阴遁：夏至九三六 小暑八二五 大暑七一四 立秋二五八 处暑一四七 白露九三六
 *        秋分七一四 寒露六九三 霜降五八二 立冬六九三 小雪五八二 大雪四七一     */
const TERM_JUSHU: Record<TermName, [number, number, number]> = {
  冬至: [1, 7, 4], 小寒: [2, 8, 5], 大寒: [3, 9, 6], 立春: [8, 5, 2],
  雨水: [9, 6, 3], 惊蛰: [1, 7, 4], 春分: [3, 9, 6], 清明: [4, 1, 7],
  谷雨: [5, 2, 8], 立夏: [4, 1, 7], 小满: [5, 2, 8], 芒种: [6, 3, 9],
  夏至: [9, 3, 6], 小暑: [8, 2, 5], 大暑: [7, 1, 4], 立秋: [2, 5, 8],
  处暑: [1, 4, 7], 白露: [9, 3, 6], 秋分: [7, 1, 4], 寒露: [6, 9, 3],
  霜降: [5, 8, 2], 立冬: [6, 9, 3], 小雪: [5, 8, 2], 大雪: [4, 7, 1],
}

export type YuanName = '上元' | '中元' | '下元'

/** 八门：宫号 → 原宫之门 */
export const DOOR_BY_PALACE: readonly (string | null)[] = [
  '休', '死', '伤', '杜', null, '开', '惊', '生', '景',
] // 下标 = 宫号-1；中五宫无门（寄坤二，以死门代）
export type DoorName = '休' | '生' | '伤' | '杜' | '景' | '死' | '惊' | '开'

/** 九星：宫号 → 原宫之星 */
export const STAR_BY_PALACE: readonly string[] = [
  '蓬', '芮', '冲', '辅', '禽', '心', '柱', '任', '英',
]
export type StarName = '蓬' | '芮' | '冲' | '辅' | '禽' | '心' | '柱' | '任' | '英'
/** 转盘八宫星环（天禽寄坤二、与天芮同宫；盘面以禽代芮） */
export const STAR_RING: readonly StarName[] = ['蓬', '任', '冲', '辅', '英', '禽', '柱', '心']
/** 门之环序：对应 RING8 */
export const DOOR_RING: readonly DoorName[] = ['休', '生', '伤', '杜', '景', '死', '惊', '开']

/** 八神（阳顺阴逆） */
export const GODS = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'] as const
export type GodName = (typeof GODS)[number]

/** 六甲旬首 → 所遁之仪 */
export const XUN_HEAD_LIUYI: Record<string, GanName> = {
  甲子: '戊', 甲戌: '己', 甲申: '庚', 甲午: '辛', 甲辰: '壬', 甲寅: '癸',
}
export const XUN_HEADS = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'] as const

/** 旬空亡（六甲旬 → 空亡二支） */
export const XUN_KONG: Record<string, [ZhiName, ZhiName]> = {
  甲子: ['戌', '亥'], 甲戌: ['申', '酉'], 甲申: ['午', '未'],
  甲午: ['辰', '巳'], 甲辰: ['寅', '卯'], 甲寅: ['子', '丑'],
}

/* ────────────────────────── 基础推算 ────────────────────────── */

/** 干支（六十甲子序） */
export interface GanzhiPair { gan: string; zhi: string; index: number }

const ganIndex = (g: string) => GAN.indexOf(g as GanName)
const zhiIndex = (z: string) => ZHI.indexOf(z as ZhiName)

/** 由天干地支求六十甲子序数：index ≡ ganIdx (mod 10) 且 ≡ zhiIdx (mod 12) */
export function ganzhiIndex(gan: string, zhi: string): number {
  const g = ganIndex(gan)
  const z = zhiIndex(zhi)
  if (g < 0 || z < 0) return -1
  let i = g
  while (i % 12 !== z) i += 10
  return i % 60
}

export function ganzhiName(index: number): string {
  const n = ((index % 60) + 60) % 60
  return GAN[n % 10] + ZHI[n % 12]
}

/** 取时支：hour 0-23 → 支序（23 点子、0 点子、1 丑 …） */
export function hourZhiIndex(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2) % 12
}

/* ────────────────────────── 历法（lunar-typescript / 寿星天文历） ────────────────────────── */

export interface CalendarInfo {
  yearPillar: GanzhiPair   // 立春换年
  monthPillar: GanzhiPair  // 十二节换月，五虎遁
  dayPillar: GanzhiPair    // 23:00 换日
  hourPillar: GanzhiPair   // 五鼠遁（随换日后的日干）
  hourZhiIndex: number
  termName: TermName       // 当前所在节气（按交接时刻）
  termSolarText: string    // 本节气交接时刻文本
}

/** 求当前所在节气：取「严格早于此刻的上一节气交接时刻」所对应之节气
 * （lunar-typescript getPrevJieQi(false)，寿星历秒级精度）。
 * 节气以交接时刻分界——例如 2024-12-21 17:20:35 冬至，此前属大雪、此后属冬至。
 */
export function getCurrentTerm(y: number, mo: number, d: number, h: number, mi: number): { name: TermName; text: string } | null {
  try {
    const lunar = Solar.fromYmdHms(y, mo, d, h, mi, 0).getLunar()
    const prev = lunar.getPrevJieQi(false)
    if (!prev) return null
    const name = prev.getName()
    if (!TERM_SET.has(name)) return null
    const s = prev.getSolar()
    const text = `${s.getYear()}-${String(s.getMonth()).padStart(2, '0')}-${String(s.getDay()).padStart(2, '0')} ${String(s.getHour()).padStart(2, '0')}:${String(s.getMinute()).padStart(2, '0')}`
    return { name: name as TermName, text }
  } catch {
    return null
  }
}

/** 取得四柱（寿星历口径：年/月柱按节换、日柱 23:00 换、时柱五鼠遁随日干） */
export function getCalendarInfo(y: number, mo: number, d: number, h: number, mi: number): CalendarInfo {
  const solar = Solar.fromYmdHms(y, mo, d, h, mi, 0)
  const lunar = solar.getLunar()
  const yp = lunar.getYearInGanZhiExact()
  const mp = lunar.getMonthInGanZhiExact()
  const dp = lunar.getDayInGanZhiExact()
  const hp = lunar.getTimeInGanZhi()
  const term = getCurrentTerm(y, mo, d, h, mi)
  return {
    yearPillar: { gan: yp[0], zhi: yp[1], index: ganzhiIndex(yp[0], yp[1]) },
    monthPillar: { gan: mp[0], zhi: mp[1], index: ganzhiIndex(mp[0], mp[1]) },
    dayPillar: { gan: dp[0], zhi: dp[1], index: ganzhiIndex(dp[0], dp[1]) },
    hourPillar: { gan: hp[0], zhi: hp[1], index: ganzhiIndex(hp[0], hp[1]) },
    hourZhiIndex: zhiIndex(hp[1]),
    termName: term ? term.name : '冬至',
    termSolarText: term ? term.text : '',
  }
}

/* ────────────────────────── 定局（拆补法） ────────────────────────── */

export interface JuInfo {
  dun: '阳' | '阴'
  yuan: YuanName
  juNumber: number // 1-9
  termName: TermName
}

/**
 * 拆补法定局：
 *  ① 节气决定阴阳遁与三元局数表；
 *  ② 日干支符头段定元：六十甲子中甲子(0)/己卯(15)/甲午(30)/己酉(45) 为符头，
 *     距上一符头 0–4 日上元、5–9 日中元、10–14 日下元（上元必起于符头日）；
 *  ③ 局数 = 该节气三元表之对应元。
 */
export function resolveJu(dayIndex: number, termName: TermName): JuInfo {
  const termIdx = TERM_NAMES.indexOf(termName as TermName)
  const dun: '阳' | '阴' = termIdx >= 0 && termIdx < 12 ? '阳' : '阴'
  const code = TERM_JUSHU[termName] ?? [1, 7, 4]
  // 符头段：日干支序数 ÷ 15 之余数 ∈ [0,5) 上元 [5,10) 中元 [10,15) 下元
  const seg = ((dayIndex % 60) + 60) % 15
  const yuan: YuanName = seg < 5 ? '上元' : seg < 10 ? '中元' : '下元'
  const juNumber = code[yuan === '上元' ? 0 : yuan === '中元' ? 1 : 2]
  return { dun, yuan, juNumber, termName }
}

/* ────────────────────────── 排盘 ────────────────────────── */

export interface QimenPan {
  ju: JuInfo
  /** 地盘：宫号(1-9) → 干 */
  earth: Record<number, string>
  /** 天盘：宫号(1-9) → 干（中宫不动） */
  sky: Record<number, string>
  /** 八门：宫号 → 门（无中宫） */
  door: Partial<Record<number, DoorName>>
  /** 九星：宫号 → 星（八宫，禽代芮；无中宫） */
  star: Partial<Record<number, StarName>>
  /** 八神：宫号 → 神（无中宫） */
  god: Partial<Record<number, GodName>>
  /** 暗干：宫号(1-9) → 干 */
  angan: Record<number, string>
}

export interface ZhifuZhishi {
  xunHead: string          // 时干旬首 如「甲子」
  liuYi: GanName           // 旬首所遁之仪 如「戊」
  /** 值符星：原名（芮/禽未代换）与所在宫号 */
  zhifuStar: StarName
  zhifuStarGongNo: number
  /** 值符落宫（八神之首「值符」所在，中宫寄坤） */
  zhifuGongNo: number
  /** 值使门与落宫（中宫寄坤） */
  zhishiDoor: DoorName
  zhishiGongNo: number
  /** 时干在旬内序号（0-9） */
  step: number
  hourKong: string         // 时空亡 如「戌亥」
  dayKong: string          // 日空亡
}

export interface QimenChart {
  input: { year: number; month: number; day: number; hour: number; minute: number }
  calendar: CalendarInfo
  ju: JuInfo
  zf: ZhifuZhishi
  pan: QimenPan
  /** 起局日类型（日干 → 甲己日/乙庚日/丙辛日/丁壬日/戊癸日，取日干用事之流派口诀） */
  juDayType: string
}

/* 工具 */

function ringIndexOf(no: number): number {
  return RING8.indexOf(no as PalaceNo)
}
/** 八宫环上顺移（idx + delta） */
function ringShift(idx: number, delta: number): number {
  return ((idx + delta) % 8 + 8) % 8
}

/**
 * 转盘时家奇门排盘主函数
 * 输入公历时间（北京时间，naive），输出完整盘局。
 */
export function createQimenChart(y: number, mo: number, d: number, h: number, mi: number): QimenChart {
  const cal = getCalendarInfo(y, mo, d, h, mi)
  const ju = resolveJu(cal.dayPillar.index, cal.termName)
  const hourIdx = cal.hourPillar.index

  /* —— 旬首 —— */
  const xunStartIdx = Math.floor(hourIdx / 10) * 10
  const xunHead = XUN_HEADS[xunStartIdx / 10]
  const liuYi = XUN_HEAD_LIUYI[xunHead]
  const step = hourIdx - xunStartIdx // 0..9（时干在旬内序号；时干为甲 ⟺ step===0）

  /* —— 地盘：戊落局宫，阳顺阴逆沿洛书九宫轨迹布 三奇六仪 —— */
  const dir = ju.dun === '阳' ? 1 : -1
  const earth: Record<number, string> = {}
  for (let i = 0; i < 9; i++) {
    // 宫号 = juNumber 起，阳遁 +i、阴遁 -i（1..9 循环）
    const palace = (((ju.juNumber - 1 + dir * i) % 9) + 9) % 9 + 1
    earth[palace] = YIQI_ORDER[i]
  }

  /* —— 旬首仪落宫（值符星/值使门之原宫；中宫寄坤二） —— */
  let yiPalace = 0
  for (let p = 1; p <= 9; p++) if (earth[p] === liuYi) { yiPalace = p; break }
  const homeSlot = yiPalace === 5 ? 5 : ringIndexOf(yiPalace) // 禽/芮 皆寄坤环位
  const zhifuStarRaw = STAR_BY_PALACE[yiPalace - 1] as StarName

  /* —— 值符落宫：值符加时干（时干甲时即其原宫） —— */
  const hourGan = cal.hourPillar.gan
  let zhifuGong = 0
  if (hourGan === '甲') {
    zhifuGong = yiPalace
  } else {
    for (let p = 1; p <= 9; p++) if (earth[p] === hourGan) { zhifuGong = p; break }
  }
  const zfRingIdx = ringIndexOf(zhifuGong === 5 ? 2 : (zhifuGong as number))

  /* —— 值使门与落宫（沿九宫序数阳顺阴逆走 step 步，中宫可经） —— */
  const doorHome = (DOOR_BY_PALACE[yiPalace - 1] ?? '死') as DoorName
  const zhishiGong = (((yiPalace - 1 + dir * step) % 9) + 9) % 9 + 1
  const zhishiRingIdx = ringIndexOf(zhishiGong === 5 ? 2 : (zhishiGong as number))

  /* —— 天盘：地盘八宫环以「值符星原环位之干」为头整体旋转，使该干落于值符宫 —— */
  const ringEarth: string[] = RING8.map((p) => earth[p])
  const anchorIdx = homeSlot // 值符星原环位（中/坤之仪则以坤环位干为头）
  const sky: Record<number, string> = { 5: earth[5] }
  for (let i = 0; i < 8; i++) {
    const palace = RING8[i]
    sky[palace] = ringEarth[ringShift(i - zfRingIdx + anchorIdx, 0)]
  }

  /* —— 八门：八门环整体旋转，使值使门落于其落宫 —— */
  const door: Partial<Record<number, DoorName>> = {}
  const doorHomePalace = DOOR_BY_PALACE.indexOf(doorHome) + 1 // 该门原宫（休1 生8 伤3 杜4 景9 死2 惊7 开6）
  const doorHomeRingIdx = ringIndexOf(doorHomePalace)
  for (let i = 0; i < 8; i++) {
    const palace = RING8[i]
    door[palace] = DOOR_RING[ringShift(i - zhishiRingIdx + doorHomeRingIdx, 0)]
  }

  /* —— 九星：星环整体旋转，使值符星（禽代芮）落于值符宫 —— */
  const star: Partial<Record<number, StarName>> = {}
  for (let i = 0; i < 8; i++) {
    const palace = RING8[i]
    star[palace] = STAR_RING[ringShift(i - zfRingIdx + homeSlot, 0)]
  }

  /* —— 八神：值符落宫起，阳顺阴逆 —— */
  const god: Partial<Record<number, GodName>> = {}
  for (let i = 0; i < 8; i++) {
    const palace = RING8[i]
    const idx = ju.dun === '阳'
      ? ringShift(i - zfRingIdx, 0)
      : ringShift(zfRingIdx - i, 0)
    god[palace] = GODS[idx]
  }

  /* —— 暗干：值使落宫起本时时干，阳顺阴逆飞布九宫（中宫有干） —— */
  const angan = buildAngan(ju.dun, zhishiGong, hourGan === '甲' ? liuYi : hourGan, earth, zhifuGong, hourGan === '甲')

  /* —— 值符星显示名 —— */
  const zhifuStar = (zhifuStarRaw === '芮' ? '禽' : zhifuStarRaw) as StarName

  /* —— 旬空 —— */
  const hourKongPair = XUN_KONG[xunHead]
  const dayXunStart = Math.floor(cal.dayPillar.index / 10) * 10
  const dayXunHead = XUN_HEADS[dayXunStart / 10]
  const dayKongPair = XUN_KONG[dayXunHead]

  const zf: ZhifuZhishi = {
    xunHead,
    liuYi,
    zhifuStar,
    zhifuStarGongNo: yiPalace,
    zhifuGongNo: zhifuGong === 5 ? 2 : zhifuGong,
    zhishiDoor: doorHome,
    zhishiGongNo: zhishiGong === 5 ? 2 : zhishiGong,
    step,
    hourKong: hourKongPair.join(''),
    dayKong: dayKongPair.join(''),
  }

  const juDayType = (() => {
    const g = cal.dayPillar.gan
    if (g === '甲' || g === '己') return '甲己日'
    if (g === '乙' || g === '庚') return '乙庚日'
    if (g === '丙' || g === '辛') return '丙辛日'
    if (g === '丁' || g === '壬') return '丁壬日'
    return '戊癸日'
  })()

  return {
    input: { year: y, month: mo, day: d, hour: h, minute: mi },
    calendar: cal,
    ju,
    zf,
    pan: { ju, earth, sky, door, star, god, angan },
    juDayType,
  }
}

/**
 * 暗干（门内暗干/时干飞布）：通行口诀——值使门所落之宫起本时时干，
 * 按阳顺阴逆沿九宫（含中宫）布 三奇六仪之序。
 * 特例：时干为甲时以旬首遁仪起于中宫（遁仪恰在中宫者起于值使宫）；
 * 值使宫与值符宫相重、或值使宫地盘即本时干时，起于中宫。
 */
function buildAngan(
  dun: '阳' | '阴',
  zhishiGong: number,
  startGan: string,
  earth: Record<number, string>,
  zhifuGong: number,
  isJiaHour: boolean,
): Record<number, string> {
  let startPalace: number
  if (isJiaHour) {
    startPalace = startGan === earth[5] ? zhishiGong : 5
  } else if (zhishiGong === zhifuGong || earth[zhishiGong] === startGan) {
    startPalace = 5
  } else {
    startPalace = zhishiGong
  }
  const dir = dun === '阳' ? 1 : -1
  const stemStart = YIQI_ORDER.indexOf(startGan as (typeof YIQI_ORDER)[number])
  const res: Record<number, string> = {}
  for (let i = 0; i < 9; i++) {
    const palace = (((startPalace - 1 + dir * i) % 9) + 9) % 9 + 1
    res[palace] = YIQI_ORDER[(stemStart + i) % 9]
  }
  return res
}

/* ────────────────────────── 展示辅助 ────────────────────────── */

export const JU_NUM_CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

/** 局描述：如「阳遁六局 · 上元（芒种）」 */
export function describeJu(ju: JuInfo): string {
  return `${ju.dun}遁${JU_NUM_CN[ju.juNumber]}局·${ju.yuan}`
}

/** 宫号 → 宫名 */
export function palaceName(no: number): PalaceName {
  return PALACE_NAMES[no - 1]
}

export interface PalaceCell {
  no: number
  name: PalaceName
  direction: string
  earthGan: string
  skyGan: string
  door?: DoorName
  star?: StarName
  god?: GodName
  anganGan: string
  isCenter: boolean
}

/** 把盘面转成九宫格展示数据（含中宫） */
export function buildPalaceCells(chart: QimenChart): PalaceCell[] {
  const { pan } = chart
  const cells: PalaceCell[] = []
  for (let no = 1; no <= 9; no++) {
    const name = palaceName(no)
    cells.push({
      no,
      name,
      direction: PALACE_DIRECTION[name],
      earthGan: pan.earth[no] ?? '',
      skyGan: pan.sky[no] ?? '',
      door: pan.door[no],
      star: pan.star[no],
      god: pan.god[no],
      anganGan: pan.angan[no] ?? '',
      isCenter: no === 5,
    })
  }
  return cells
}

export type { Solar }
