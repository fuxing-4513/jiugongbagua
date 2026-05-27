'use client'

import { useState, useCallback } from 'react'
import { astro } from 'iztro'
import { useLocale } from '@/lib/i18n'

type ZiweiResult = ReturnType<typeof astro.bySolar>

// ── i18n helper ──
function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let v: unknown = lang
  for (const k of keys) {
    if (typeof v !== 'object' || v === null) return key
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : key
}

// ── 时辰选项 ──
const hourOptions = [
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

// ── 星曜颜色（按类型） ──
function starTypeColor(type: string): string {
  const m: Record<string, string> = {
    major: 'text-gold-300',
    adjective: 'text-cyan-300',
    helper: 'text-purple-300',
    assistant: 'text-purple-300',
    bad: 'text-red-300',
  }
  return m[type] || 'text-gray-300'
}

export default function ZiweiClient() {
  const { t, locale } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const now = new Date()
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('6')
  const [gender, setGender] = useState<'M' | 'F'>('M')
  const [result, setResult] = useState<ZiweiResult | null>(null)
  const [error, setError] = useState('')

  const analyze = useCallback(() => {
    setError('')
    const y = parseInt(year)
    const m = parseInt(month)
    const d = parseInt(day)
    const h = parseInt(hour)

    if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h)) {
      setError('请输入有效的日期和时间')
      return
    }
    if (m < 1 || m > 12 || d < 1 || d > 31 || h < 0 || h > 11) {
      setError('日期或时辰无效')
      return
    }

    try {
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const langCode = locale === 'zh-TW' ? 'zh-TW' : 'zh-CN'
      // iztro bySolar(solarDate, timeIndex, gender, fixLeap=true, language?)
      const chart = astro.bySolar(dateStr, h, gender as any, true, langCode)
      setResult(chart)
    } catch (e) {
      setError('排盘出错，请检查日期')
    }
  }, [year, month, day, hour, gender, locale])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('ziwei.title', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('ziwei.desc', lang)}</p>

      {/* ── Input Form ── */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">{tk('ziwei.birthInfo', lang)}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">{tk('common.year', lang)}</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500"
              min={1900} max={2100} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{tk('common.month', lang)}</label>
            <input type="number" value={month} onChange={e => setMonth(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500"
              min={1} max={12} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{tk('common.day', lang)}</label>
            <input type="number" value={day} onChange={e => setDay(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500"
              min={1} max={31} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{tk('common.hour', lang)}</label>
            <select value={hour} onChange={e => setHour(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500">
              {hourOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">性别</label>
            <select value={gender} onChange={e => setGender(e.target.value as 'M' | 'F')}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500">
              <option value="M">男 {tk('common.male', lang)}</option>
              <option value="F">女 {tk('common.female', lang)}</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <button onClick={analyze}
          className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">
          {tk('common.submit', lang)}
        </button>
      </div>

      {/* ── Result ── */}
      {result && (
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500">公历：</span>
                <span className="text-gray-200">{result.solarDate}</span>
              </div>
              <div>
                <span className="text-gray-500">农历：</span>
                <span className="text-gray-200">{result.lunarDate}</span>
              </div>
              <div>
                <span className="text-gray-500">生肖：</span>
                <span className="text-gray-200">{result.zodiac}</span>
              </div>
              <div>
                <span className="text-gray-500">五行局：</span>
                <span className="text-gray-200">{result.fiveElementsClass}</span>
              </div>
            </div>
          </div>

          {/* 命宫身宫 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-base font-semibold text-gold-300 mb-3">命宫 / 身宫</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-gray-400">命宫：{result.soul}</p>
                <p className="text-gray-400">身宫：{result.body}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-gray-400">命主：{result.earthlyBranchOfSoulPalace}</p>
                <p className="text-gray-400">身主：{result.earthlyBranchOfBodyPalace}</p>
              </div>
            </div>
          </div>

          {/* 十二宫网格 */}
          <h3 className="text-lg font-semibold text-gold-300 font-serif mb-3">十二宫</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {result.palaces.map((palace) => {
              const majors = palace.majorStars
              const minors = [...palace.minorStars, ...palace.adjectiveStars]

              return (
                <div key={palace.index}
                  className={`rounded-xl border p-3 backdrop-blur ${
                    palace.isBodyPalace
                      ? 'border-gold-500 bg-gold-900/20'
                      : 'border-dark-600 bg-dark-800/80'
                  }`}
                >
                  {/* 宫位名 */}
                  <p className="text-xs font-medium text-gold-400 mb-1">
                    {palace.name}
                    {palace.isBodyPalace && <span className="ml-1 text-gold-300">(身宫)</span>}
                  </p>
                  {/* 干支 */}
                  <p className="text-[10px] text-gray-500 mb-2">
                    {palace.heavenlyStem} {palace.earthlyBranch}
                  </p>
                  {/* 主星 */}
                  {majors.length > 0 ? (
                    <div className="space-y-0.5">
                      {majors.map((star, i) => (
                        <p key={i} className={`text-xs font-semibold ${starTypeColor(star.type)}`}>
                          {star.name}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-600 italic">—</p>
                  )}
                  {/* 辅星 */}
                  {minors.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-dark-600 flex flex-wrap gap-1">
                      {minors.map((star, i) => (
                        <span key={i} className={`text-[10px] ${starTypeColor(star.type)}`}>
                          {star.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
