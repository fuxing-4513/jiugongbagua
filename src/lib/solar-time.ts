/**
 * solar-time.ts — 真太阳时计算工具函数
 *
 * 1. 通过经纬度算当地真太阳时（经度修正 + 均时差）
 * 2. 对出生时间做修正后判定时辰
 * 3. 标记是否时柱变化
 * 4. 中国17个常用城市经纬度数据库
 */

export interface TrueSolarResult {
  /** 修正后的小时（可能带小数） */
  adjustedHour: number
  /** 修正量（分钟） */
  diffMinutes: number
  /** 修正后的时辰 */
  period: string
  /** 原始时辰 */
  originalPeriod: string
  /** 是否导致时柱变化 */
  changedPillar: boolean
  /** 详细说明 */
  note: string
}

// ── 中国主要城市 ──
export const CHINA_CITIES: Record<string, { lat: number; lng: number }> = {
  '北京':    { lat: 39.9,  lng: 116.4 },
  '上海':    { lat: 31.2,  lng: 121.5 },
  '广州':    { lat: 23.1,  lng: 113.3 },
  '深圳':    { lat: 22.5,  lng: 114.1 },
  '成都':    { lat: 30.6,  lng: 104.1 },
  '杭州':    { lat: 30.3,  lng: 120.2 },
  '武汉':    { lat: 30.6,  lng: 114.3 },
  '南京':    { lat: 32.1,  lng: 118.8 },
  '重庆':    { lat: 29.6,  lng: 106.5 },
  '西安':    { lat: 34.3,  lng: 108.9 },
  '香港':    { lat: 22.3,  lng: 114.2 },
  '台北':    { lat: 25.0,  lng: 121.5 },
  '昆明':    { lat: 25.0,  lng: 102.7 },
  '拉萨':    { lat: 29.7,  lng: 91.1  },
  '乌鲁木齐': { lat: 43.8,  lng: 87.6  },
  '哈尔滨':  { lat: 45.8,  lng: 126.5 },
  '青岛':    { lat: 36.1,  lng: 120.3 },
}

// ── 均时差（精度≈±1分钟，八字够用） ──
function calcEoT(dayOfYear: number): number {
  const B = 2 * Math.PI * (dayOfYear - 1) / 365
  return 229.2 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B)
    - 0.014615 * Math.cos(2 * B) - 0.04089 * Math.sin(2 * B))
}

// ── 时辰判定 ──
const PERIODS: [string, number][] = [
  ['子', 23], ['丑', 1], ['寅', 3], ['卯', 5],
  ['辰', 7], ['巳', 9], ['午', 11], ['未', 13],
  ['申', 15], ['酉', 17], ['戌', 19], ['亥', 21],
]

function getPeriod(hour24: number): string {
  for (const [name, start] of PERIODS) {
    if (name === '子') {
      if (hour24 >= 23 || hour24 < 1) return '子'
    } else {
      if (hour24 >= start && hour24 < start + 2) return name
    }
  }
  return ''
}

/**
 * 计算真太阳时
 * @param dateStr 日期 YYYY-MM-DD
 * @param hour    北京时间小时 (0-23)
 * @param minute  分钟
 * @param longitude 经度（东正西负）
 * @returns TrueSolarResult
 */
export function calcTrueSolarTime(
  dateStr: string, hour: number, minute: number, longitude: number
): TrueSolarResult {
  const d = new Date(dateStr + 'T12:00:00+08:00')
  const startOfYear = new Date(d.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000)

  // 均时差（分钟）
  const eot = calcEoT(dayOfYear)
  // 经度修正（每度4分钟，以东经120°为标准）
  const lngOffset = (longitude - 120) * 4
  // 总修正量
  const totalOffset = lngOffset + eot

  // 应用修正
  const totalMinutes = hour * 60 + minute + totalOffset
  let ah = totalMinutes / 60

  // 处理跨天
  if (ah >= 24) ah -= 24
  if (ah < 0) ah += 24

  const origPeriod = getPeriod(hour)
  const adjPeriod = getPeriod(ah)

  return {
    adjustedHour: Math.round(ah * 100) / 100,
    diffMinutes: Math.round(totalOffset),
    period: adjPeriod,
    originalPeriod: origPeriod,
    changedPillar: origPeriod !== adjPeriod,
    note: adjPeriod !== origPeriod
      ? `⚠️ 真太阳时修正后时辰从${origPeriod}时变为${adjPeriod}时，时柱将改变`
      : `真太阳时修正，时辰仍为${adjPeriod}时`,
  }
}

/**
 * 简版：仅返回调整后的小时数（兼容旧接口）
 * @deprecated 使用 calcTrueSolarTime 获取完整结果
 */
export function calcTrueSolarHour(dateStr: string, hour: number, longitude: number): number {
  return calcTrueSolarTime(dateStr, hour, 0, longitude).adjustedHour
}
