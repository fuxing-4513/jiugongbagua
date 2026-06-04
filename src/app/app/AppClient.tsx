'use client';

import { useState, useMemo } from 'react';
import { analysisDimensions, getFreeDimensions, getVipDimensions, type AnalysisDimension } from '@/lib/ai-analysis';
import { Solar, Lunar, LunarYear, LunarMonth } from 'lunar-typescript';

type CalendarType = 'solar' | 'lunar';

const modules = [
  { id: 'bazi', name: '四柱八字', emoji: '📜' },
  { id: 'ziwei', name: '紫微斗数', emoji: '⭐' },
  { id: 'liuyao', name: '六爻占卜', emoji: '☯' },
  { id: 'xiaoliuren', name: '小六壬', emoji: '👋' },
  { id: 'fengshui', name: '风水', emoji: '🧭' },
];

const hourOptions = [
  { value: '0', label: '子时 23:00-00:59' }, { value: '1', label: '丑时 01:00-02:59' },
  { value: '2', label: '寅时 03:00-04:59' }, { value: '3', label: '卯时 05:00-06:59' },
  { value: '4', label: '辰时 07:00-08:59' }, { value: '5', label: '巳时 09:00-10:59' },
  { value: '6', label: '午时 11:00-12:59' }, { value: '7', label: '未时 13:00-14:59' },
  { value: '8', label: '申时 15:00-16:59' }, { value: '9', label: '酉时 17:00-18:59' },
  { value: '10', label: '戌时 19:00-20:59' }, { value: '11', label: '亥时 21:00-22:59' },
];

// Solar month days
const SOLAR_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
function getSolarDaysInMonth(y: number, m: number): number {
  if (m === 2) return isLeapYear(y) ? 29 : 28;
  return SOLAR_DAYS[m];
}

export default function AppClient() {
  const [activeModule, setActiveModule] = useState('bazi');
  const [activeDim, setActiveDim] = useState<string>('overallReading');
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(6);
  const [name, setName] = useState('');
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  const currentDim = analysisDimensions.find(d => d.key === activeDim);
  const freeDims = getFreeDimensions();
  const vipDims = getVipDimensions();

  // ── Date validation ──
  const maxDay = useMemo(() => {
    if (calendarType === 'solar') {
      return getSolarDaysInMonth(year, month);
    }
    try {
      const lm = LunarMonth.fromYm(year, month);
      return lm?.getDayCount?.() ? lm.getDayCount() : 30;
    } catch {
      return 30;
    }
  }, [calendarType, year, month]);

  const hasLeapMonth = useMemo(() => {
    if (calendarType !== 'lunar') return false;
    try {
      return LunarYear.fromYear(year).getLeapMonth() === month;
    } catch {
      return false;
    }
  }, [calendarType, year, month]);

  const yearLeapMonth = useMemo(() => {
    if (calendarType !== 'lunar') return 0;
    try {
      return LunarYear.fromYear(year).getLeapMonth();
    } catch {
      return 0;
    }
  }, [calendarType, year]);

  const validationMsg = useMemo(() => {
    if (year < 1900 || year > 2100) return '年份需在 1900-2100 之间';
    if (month < 1 || month > 12) return '请输入有效月份';
    if (day < 1 || day > maxDay) return `该月只有 ${maxDay} 天，请输入 1-${maxDay}`;
    return '';
  }, [year, month, day, maxDay]);

  // Build display date string
  const dateDisplay = useMemo(() => {
    if (calendarType === 'solar') {
      return `公历 ${year}年${month}月${day}日 ${hourOptions.find(h => parseInt(h.value) === hour)?.label || ''}`;
    }
    const leapTag = isLeapMonth ? '闰' : '';
    return `农历 ${year}年${leapTag}${month}月${day}日 ${hourOptions.find(h => parseInt(h.value) === hour)?.label || ''}`;
  }, [calendarType, year, month, day, hour, isLeapMonth]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">AI 智能排盘</h1>
        <p className="text-gray-400">多模块命理排盘 · AI辅助智能解读</p>
      </div>

      {/* Module Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => setActiveModule(mod.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeModule === mod.id
                ? 'bg-gold-400 text-dark-900 shadow-lg shadow-gold-400/20'
                : 'bg-dark-800 text-gray-400 hover:text-gold-400 border border-dark-600'
            }`}
          >
            {mod.emoji} {mod.name}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 mb-8 max-w-md mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">姓名（选填）</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="输入姓名" className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-gray-200 text-sm" />
          </div>

          {/* Calendar Type Toggle */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">历法</label>
            <div className="flex bg-dark-700 rounded-lg p-1 gap-1">
              <button
                onClick={() => { setCalendarType('solar'); setIsLeapMonth(false) }}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                  calendarType === 'solar' ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-gray-200'
                }`}
              >☀️ 阳历</button>
              <button
                onClick={() => setCalendarType('lunar')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                  calendarType === 'lunar' ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-gray-200'
                }`}
              >🌙 阴历</button>
            </div>
            {yearLeapMonth > 0 && calendarType === 'lunar' && (
              <p className="text-[10px] text-amber-400/70 mt-1">{year}年有闰{yearLeapMonth}月</p>
            )}
          </div>

          {/* Year/Month/Day */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">年</label>
              <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-gray-200 text-sm" min={1900} max={2100} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">月</label>
              <input type="number" value={month} onChange={e => { setMonth(Number(e.target.value)); setIsLeapMonth(false) }}
                className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-gray-200 text-sm" min={1} max={12} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                日 <span className="text-[10px] text-gray-600">({maxDay}天)</span>
              </label>
              <input type="number" value={day} onChange={e => setDay(Number(e.target.value))}
                className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-gray-200 text-sm" min={1} max={maxDay} />
            </div>
          </div>

          {/* Hour Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">时辰</label>
            <select value={hour} onChange={e => setHour(Number(e.target.value))}
              className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-gray-200 text-sm">
              {hourOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Leap Month Toggle */}
          {hasLeapMonth && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="appLeapMonth" checked={isLeapMonth} onChange={e => setIsLeapMonth(e.target.checked)}
                className="rounded accent-gold-500" />
              <label htmlFor="appLeapMonth" className="text-sm text-amber-400 cursor-pointer">
                闰{month}月
              </label>
            </div>
          )}

          {/* Validation */}
          {validationMsg && (
            <p className="text-xs text-amber-400">⚠ {validationMsg}</p>
          )}

          {/* Date Summary */}
          <div className="bg-dark-700/60 rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-gray-400">当前设定</p>
            <p className="text-sm text-gold-400 font-medium">{dateDisplay}</p>
          </div>
        </div>
      </div>

      {/* Analysis Dimensions */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-400 mb-3">分析维度</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {freeDims.map(dim => (
            <button key={dim.key} onClick={() => setActiveDim(dim.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeDim === dim.key ? 'bg-gold-400 text-dark-900' : 'bg-dark-800 text-gray-400 border border-dark-600 hover:text-gold-400'}`}>
              {dim.icon} {dim.label}
            </button>
          ))}
          {vipDims.map(dim => (
            <button key={dim.key} onClick={() => setActiveDim(dim.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeDim === dim.key ? 'bg-gold-400 text-dark-900' : 'bg-dark-800 text-amber-600/60 border border-amber-600/30'}`}>
              🔒 {dim.label}
            </button>
          ))}
        </div>

        {currentDim && (
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{currentDim.icon}</span>
              <h3 className="text-sm font-medium text-gold-400">{currentDim.label}</h3>
              {!currentDim.free && <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded">VIP</span>}
            </div>
            <p className="text-gray-300 leading-relaxed">{currentDim.generate({ module: activeModule, year, month, day, name })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
