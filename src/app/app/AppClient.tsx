'use client';

import { useState } from 'react';
import { analysisDimensions, getFreeDimensions, getVipDimensions, type AnalysisDimension } from '@/lib/ai-analysis';
import CalendarInput, { type CalendarType, getMaxDay } from '@/components/CalendarInput';

const modules = [
  { id: 'bazi', name: '四柱八字', emoji: '📜' },
  { id: 'ziwei', name: '紫微斗数', emoji: '⭐' },
];

export default function AppClient() {
  const [activeModule, setActiveModule] = useState('bazi');
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [year, setYear] = useState('1990');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [hour, setHour] = useState('6');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [name, setName] = useState('');

  const freeDims = getFreeDimensions();
  const vipDims = getVipDimensions();
  const allDims = [...freeDims, ...vipDims];

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
        <h1 className="text-3xl font-bold text-gold-600 font-serif mb-2">AI 智能排盘</h1>
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
                ? 'bg-gold-500 text-dark-900 shadow-lg'
                : 'bg-dark-800 text-gray-400 hover:text-gold-500 border border-dark-600'
            }`}
          >
            {mod.emoji} {mod.name}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 mb-8 max-w-md mx-auto shadow-sm">
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

      {/* ── 所有分析维度竖排 ── */}
      <section className="space-y-5">
        <h3 className="text-sm font-medium text-gray-400 mb-1">分析维度</h3>

        {allDims.map((dim: AnalysisDimension) => (
          <DimensionCard
            key={dim.key}
            dim={dim}
            data={{ module: activeModule, year: y, month: m, day: d, name }}
          />
        ))}
      </section>

      {/* ── VIP 升级横幅 ── */}
      <div className="mt-12 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">👑</div>
        <h3 className="text-lg font-bold text-amber-700 mb-1">解锁 VIP 完整命理分析</h3>
        <p className="text-sm text-amber-600 mb-4">
          财富格局 · 十年大运 · 流年指引 — 三大深度维度，解锁您的完整命运图谱
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="px-5 py-2 bg-dark-800 border border-amber-500/30 text-amber-600 rounded-full text-sm font-medium hover:bg-amber-50 transition-all">
            🎫 单次解锁 ¥9.9
          </button>
          <button className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-sm font-bold shadow-lg shadow-amber-200 hover:shadow-xl transition-all">
            💎 月卡 ¥29.9/月
          </button>
          <button className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 text-dark-900 rounded-full text-sm font-bold shadow-lg shadow-amber-200 hover:shadow-xl transition-all">
            ⭐ 年卡 ¥199/年（省 45%）
          </button>
          <button className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-full text-sm font-bold shadow-lg shadow-amber-200 hover:shadow-xl transition-all">
            🏆 永久卡 ¥499
          </button>
        </div>
        <p className="text-xs text-amber-400 mt-3">开通后立即解锁所有 VIP 维度完整内容 · 支持微信/支付宝</p>
      </div>
    </div>
  );
}

/* ── 单个维度卡片 ── */
function DimensionCard({ dim, data }: { dim: AnalysisDimension; data: unknown }) {
  const [showLockTip, setShowLockTip] = useState(false);

  const previewLines = dim.generate(data).split('\n');
  // Free: show all; VIP: show first 8 lines as preview
  const showFull = dim.free;
  const previewText = showFull
    ? previewLines.join('\n')
    : previewLines.slice(0, 10).join('\n') + '\n···';

  return (
    <div className={`bg-dark-800 border rounded-lg p-5 transition-all relative overflow-hidden ${
      dim.free ? 'border-dark-600' : 'border-amber-600/30'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{dim.icon}</span>
        <h3 className={`text-sm font-medium ${dim.free ? 'text-gold-500' : 'text-amber-500'}`}>
          {dim.label}
        </h3>
        {!dim.free && (
          <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full font-medium">
            🔒 VIP
          </span>
        )}
      </div>

      {/* Content */}
      <div className={`text-gray-300 text-sm leading-relaxed whitespace-pre-line ${!showFull ? 'max-h-48 overflow-hidden relative' : ''}`}>
        {previewText}
        {!showFull && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-dark-800 to-transparent pointer-events-none" />
        )}
      </div>

      {/* VIP Lock */}
      {!dim.free && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setShowLockTip(!showLockTip)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            🔓 解锁完整内容
          </button>
          {showLockTip && (
            <div className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2.5 border border-amber-200">
              💡 VIP 会员可查看完整的{ dim.label }分析报告。<br />
              单次 ¥9.9 · 月卡 ¥29.9 · 年卡 ¥199 · 永久 ¥499
            </div>
          )}
        </div>
      )}
    </div>
  );
}
