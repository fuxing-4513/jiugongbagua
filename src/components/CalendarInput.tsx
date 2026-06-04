'use client'

import { useMemo } from 'react'
import { Solar, Lunar, LunarYear, LunarMonth } from 'lunar-typescript'

// ── Types ──
export type CalendarType = 'solar' | 'lunar'

export interface CalendarState {
  calendarType: CalendarType
  year: string
  month: string
  day: string
  hour: string
  isLeapMonth: boolean
}

// ── Calendar utilities (exported for reuse) ──

const SOLAR_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

export function getSolarDaysInMonth(y: number, m: number): number {
  if (m === 2) return isLeapYear(y) ? 29 : 28
  return SOLAR_DAYS[m]
}

export function getLunarDaysInMonth(y: number, m: number): number {
  try {
    const lm = LunarMonth.fromYm(y, m)
    return lm?.getDayCount?.() ?? 30
  } catch {
    return 30
  }
}

export function getMaxDay(calendarType: CalendarType, y: number, m: number): number {
  if (calendarType === 'solar') return getSolarDaysInMonth(y, m)
  return getLunarDaysInMonth(y, m)
}

export function getYearLeapMonth(y: number): number {
  try {
    return LunarYear.fromYear(y).getLeapMonth()
  } catch {
    return 0
  }
}

export function lunarToSolarDate(y: number, m: number, d: number, isLeap?: boolean): string {
  const lunar = Lunar.fromYmd(y, isLeap ? -m : m, d)
  const solar = lunar.getSolar()
  return `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`
}

// ── Hour options ──
const HOUR_OPTIONS = [
  { value: '0', label: '子时 23:00-00:59' },
  { value: '1', label: '丑时 01:00-02:59' },
  { value: '2', label: '寅时 03:00-04:59' },
  { value: '3', label: '卯时 05:00-06:59' },
  { value: '4', label: '辰时 07:00-08:59' },
  { value: '5', label: '巳时 09:00-10:59' },
  { value: '6', label: '午时 11:00-12:59' },
  { value: '7', label: '未时 13:00-14:59' },
  { value: '8', label: '申时 15:00-16:59' },
  { value: '9', label: '酉时 17:00-18:59' },
  { value: '10', label: '戌时 19:00-20:59' },
  { value: '11', label: '亥时 21:00-22:59' },
]

// ── Component props ──
export interface CalendarInputProps {
  // Controlled state
  calendarType: CalendarType
  year: string
  month: string
  day: string
  hour: string
  isLeapMonth: boolean

  // Callbacks
  onCalendarTypeChange: (t: CalendarType) => void
  onYearChange: (v: string) => void
  onMonthChange: (v: string) => void
  onDayChange: (v: string) => void
  onHourChange: (v: string) => void
  onLeapMonthChange: (v: boolean) => void

  // Options
  hideHour?: boolean
  compact?: boolean

  // Labels
  label?: string
  solarLabel?: string
  lunarLabel?: string
}

export default function CalendarInput({
  calendarType, year, month, day, hour, isLeapMonth,
  onCalendarTypeChange, onYearChange, onMonthChange, onDayChange, onHourChange, onLeapMonthChange,
  hideHour = false, compact = false,
  label = '出生日期', solarLabel = '☀️ 阳历（公历）', lunarLabel = '🌙 阴历（农历）',
}: CalendarInputProps) {
  const y = parseInt(year) || 2000
  const m = parseInt(month) || 1
  const d = parseInt(day) || 1

  // ── Computed calendar data ──
  const maxDay = useMemo(() => getMaxDay(calendarType, y, m), [calendarType, y, m])

  const hasLeapMonth = useMemo(() => {
    if (calendarType !== 'lunar') return false
    try {
      return LunarYear.fromYear(y).getLeapMonth() === m
    } catch {
      return false
    }
  }, [calendarType, y, m])

  const yearLeapMonth = useMemo(() => {
    if (calendarType !== 'lunar') return 0
    return getYearLeapMonth(y)
  }, [calendarType, y])

  // ── Validation ──
  const validationMsg = useMemo(() => {
    const yy = parseInt(year)
    const mm = parseInt(month)
    const dd = parseInt(day)
    if (isNaN(yy) || yy < 1900 || yy > 2100) return '年份需在 1900-2100 之间'
    if (isNaN(mm) || mm < 1 || mm > 12) return '月份需在 1-12 之间'
    if (isNaN(dd) || dd < 1 || dd > maxDay) {
      return calendarType === 'solar'
        ? `${y}年${m}月有 ${maxDay} 天，请输入 1-${maxDay}`
        : `农历${m}月有 ${maxDay} 天，请输入 1-${maxDay}`
    }
    return ''
  }, [year, month, day, maxDay, calendarType, y, m])

  // ── Date display ──
  const dateDisplay = useMemo(() => {
    if (calendarType === 'solar') {
      return `公历 ${y}年${m}月${d}日`
    }
    const leapTag = isLeapMonth ? '闰' : ''
    return `农历 ${y}年${leapTag}${m}月${d}日`
  }, [calendarType, y, m, d, isLeapMonth])

  const hourLabel = HOUR_OPTIONS.find(o => o.value === hour)?.label || ''

  const inputClass = compact
    ? 'w-full bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-gray-200 text-xs'
    : 'w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-gray-200 text-sm'

  const labelClass = compact ? 'text-[10px] text-gray-500 block mb-0.5' : 'text-xs text-gray-400 block mb-1'

  return (
    <div>
      {label && !compact && (
        <p className="text-sm text-gray-400 mb-3">{label}</p>
      )}

      {/* Calendar Type Toggle */}
      <div className={`flex items-center gap-3 ${compact ? 'mb-3' : 'mb-4'}`}>
        {!compact && <span className="text-sm text-gray-400">历法：</span>}
        <div className="flex bg-dark-700 rounded-lg p-1 gap-1">
          <button
            onClick={() => { onCalendarTypeChange('solar'); onLeapMonthChange(false) }}
            className={`px-3 py-1.5 rounded-md ${compact ? 'text-[11px]' : 'text-sm'} font-medium transition-all ${
              calendarType === 'solar'
                ? 'bg-gold-500 text-dark-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >{solarLabel}</button>
          <button
            onClick={() => onCalendarTypeChange('lunar')}
            className={`px-3 py-1.5 rounded-md ${compact ? 'text-[11px]' : 'text-sm'} font-medium transition-all ${
              calendarType === 'lunar'
                ? 'bg-gold-500 text-dark-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >{lunarLabel}</button>
        </div>
        {yearLeapMonth > 0 && calendarType === 'lunar' && (
          <span className={`text-amber-400/70 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {y}年闰{yearLeapMonth}月
          </span>
        )}
      </div>

      {/* Year / Month / Day */}
      <div className={`grid ${hideHour ? 'grid-cols-3' : 'grid-cols-4'} gap-2`}>
        <div>
          <label className={labelClass}>年</label>
          <input type="number" value={year} onChange={e => onYearChange(e.target.value)}
            min={1900} max={2100} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>月</label>
          <input type="number" value={month} onChange={e => { onMonthChange(e.target.value); onLeapMonthChange(false) }}
            min={1} max={12} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>
            日 {compact ? '' : <span className="text-gray-600">({maxDay}天)</span>}
          </label>
          <input type="number" value={day} onChange={e => onDayChange(e.target.value)}
            min={1} max={maxDay} className={inputClass} />
        </div>
        {!hideHour && (
          <div>
            <label className={labelClass}>时辰</label>
            <select value={hour} onChange={e => onHourChange(e.target.value)}
              className={inputClass}>
              {HOUR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Leap Month Toggle */}
      {hasLeapMonth && (
        <div className="mt-3 flex items-center gap-2">
          <input type="checkbox" id="calLeapMonth" checked={isLeapMonth}
            onChange={e => onLeapMonthChange(e.target.checked)}
            className="rounded accent-gold-500" />
          <label htmlFor="calLeapMonth" className={`text-amber-400 cursor-pointer ${compact ? 'text-xs' : 'text-sm'}`}>
            闰{m}月
          </label>
        </div>
      )}

      {/* Validation */}
      {validationMsg && (
        <p className={`text-amber-400 mt-2 ${compact ? 'text-[10px]' : 'text-xs'}`}>⚠ {validationMsg}</p>
      )}

      {/* Date Summary */}
      {!compact && (
        <div className="mt-3 bg-dark-700/60 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-gray-500">当前设定</p>
          <p className="text-sm text-gold-400 font-medium">
            {dateDisplay} {hourLabel}
          </p>
        </div>
      )}
    </div>
  )
}
