'use client';

import { useState } from 'react';
import { analysisDimensions, getFreeDimensions, getVipDimensions, type AnalysisDimension } from '@/lib/ai-analysis';
import CalendarInput, { type CalendarType, getMaxDay, lunarToSolarDate } from '@/components/CalendarInput';

const modules = [
  { id: 'bazi', name: '四柱八字', emoji: '📜' },
  { id: 'ziwei', name: '紫微斗数', emoji: '⭐' },
  { id: 'liuyao', name: '六爻占卜', emoji: '☯' },
  { id: 'xiaoliuren', name: '小六壬', emoji: '👋' },
  { id: 'fengshui', name: '风水', emoji: '🧭' },
];

export default function AppClient() {
  const [activeModule, setActiveModule] = useState('bazi');
  const [activeDim, setActiveDim] = useState<string>('overallReading');
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [year, setYear] = useState('1990');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [hour, setHour] = useState('6');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [name, setName] = useState('');

  const currentDim = analysisDimensions.find(d => d.key === activeDim);
  const freeDims = getFreeDimensions();
  const vipDims = getVipDimensions();

  // Resolve numeric values for the analysis
  const y = parseInt(year) || 1990;
  const m = parseInt(month) || 1;
  const d = parseInt(day) || 1;
  const maxDay = getMaxDay(calendarType, y, m);

  const validationMsg = (() => {
    if (y < 1900 || y > 2100) return '年份需在 1900-2100 之间';
    if (m < 1 || m > 12) return '请输入有效月份';
    if (d < 1 || d > maxDay) return `该月只有 ${maxDay} 天，请输入 1-${maxDay}`;
    return '';
  })();

  const isValid = !validationMsg;

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

          <CalendarInput
            calendarType={calendarType}
            year={year}
            month={month}
            day={day}
            hour={hour}
            isLeapMonth={isLeapMonth}
            onCalendarTypeChange={setCalendarType}
            onYearChange={setYear}
            onMonthChange={setMonth}
            onDayChange={setDay}
            onHourChange={setHour}
            onLeapMonthChange={setIsLeapMonth}
            label=""
          />
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
            <p className="text-gray-300 leading-relaxed">{currentDim.generate({ module: activeModule, year: y, month: m, day: d, name })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
