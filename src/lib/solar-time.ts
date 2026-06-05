/**
 * 真太阳时计算工具函数
 * 独立文件，避免导入大组件
 */

/**
 * 计算真太阳时调整后的小时数
 * @param dateStr 日期字符串 YYYY-MM-DD
 * @param hour 北京时间小时数 (0-23)
 * @param longitude 经度
 * @returns 调整后的小时（可能带小数）
 */
export function calcTrueSolarHour(dateStr: string, hour: number, longitude: number): number {
  const d = new Date(dateStr + 'T12:00:00+08:00')
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)

  const B = (360 / 365) * (dayOfYear - 81)
  const B_rad = (B * Math.PI) / 180
  const EoT = 9.87 * Math.sin(2 * B_rad) - 7.53 * Math.cos(B_rad) - 1.5 * Math.sin(B_rad)

  const lngOffset = (longitude - 120) * 4
  const totalOffset = lngOffset + EoT

  return hour + totalOffset / 60
}
