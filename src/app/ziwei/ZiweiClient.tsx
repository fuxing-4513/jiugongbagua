'use client'

import { useState } from 'react'
import { astro } from 'iztro'

type ZiweiResult = ReturnType<typeof astro.bySolar>

const hourOptions = [
  { value: '0', label: '子时 23:00-00:59' }, { value: '1', label: '丑时 01:00-02:59' },
  { value: '2', label: '寅时 03:00-04:59' }, { value: '3', label: '卯时 05:00-06:59' },
  { value: '4', label: '辰时 07:00-08:59' }, { value: '5', label: '巳时 09:00-10:59' },
  { value: '6', label: '午时 11:00-12:59' }, { value: '7', label: '未时 13:00-14:59' },
  { value: '8', label: '申时 15:00-16:59' }, { value: '9', label: '酉时 17:00-18:59' },
  { value: '10', label: '戌时 19:00-20:59' }, { value: '11', label: '亥时 21:00-22:59' },
]

const BRIGHTNESS: Record<string, { label: string; color: string }> = {
  'miao': { label: '庙', color: 'text-green-400' },
  'wang': { label: '旺', color: 'text-green-300' },
  'de': { label: '得', color: 'text-blue-300' },
  'li': { label: '利', color: 'text-cyan-300' },
  'ping': { label: '平', color: 'text-yellow-400' },
  'bu': { label: '不', color: 'text-orange-400' },
  'xian': { label: '陷', color: 'text-red-400' },
  '': { label: '', color: 'text-gray-400' },
}

const MUTAGEN: Record<string, { label: string; color: string }> = {
  'sihuaLu': { label: '化禄', color: 'text-green-400' },
  'sihuaQuan': { label: '化权', color: 'text-purple-400' },
  'sihuaKe': { label: '化科', color: 'text-blue-400' },
  'sihuaJi': { label: '化忌', color: 'text-red-400' },
}

export default function ZiweiClient() {
  const now = new Date()
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('6')
  const [gender, setGender] = useState<'M' | 'F'>('M')
  const [result, setResult] = useState<ZiweiResult | null>(null)
  const [error, setError] = useState('')

  const analyze = () => {
    setError('')
    try {
      const h = parseInt(hour)
      const dateStr = year + '-' + String(parseInt(month)).padStart(2,'0') + '-' + String(parseInt(day)).padStart(2,'0')
      const r = astro.bySolar(dateStr, h, gender === 'M' ? 'male' : 'female')
      setResult(r as any)
    } catch (e: any) {
      setError(e?.message || '日期格式有误')
    }
  }

  return (<div className="max-w-4xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">紫微斗数</h1>
    <p className="text-gray-400 mb-6">紫微斗数命盘排盘——四化·庙旺·大限全解析</p>

    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <div><label className="text-xs text-gray-400 block mb-1">年</label>
          <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
        <div><label className="text-xs text-gray-400 block mb-1">月</label>
          <input type="number" min={1} max={12} value={month} onChange={e => setMonth(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
        <div><label className="text-xs text-gray-400 block mb-1">日</label>
          <input type="number" min={1} max={31} value={day} onChange={e => setDay(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
        <div><label className="text-xs text-gray-400 block mb-1">时辰</label>
          <select value={hour} onChange={e => setHour(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm">
            {hourOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select></div>
        <div><label className="text-xs text-gray-400 block mb-1">性别</label>
          <select value={gender} onChange={e => setGender(e.target.value as 'M' | 'F')} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200">
            <option value="M">男</option><option value="F">女</option>
          </select></div>
      </div>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
      <button onClick={analyze} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">排盘</button>
    </div>

    {result && (<div className="space-y-6">
      {/* 基本信息 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
          <div><span className="text-gray-500">公历：</span><span className="text-gray-200">{result.solarDate}</span></div>
          <div><span className="text-gray-500">农历：</span><span className="text-gray-200">{result.lunarDate}</span></div>
          <div><span className="text-gray-500">生肖：</span><span className="text-gray-200">{result.zodiac}</span></div>
          <div><span className="text-gray-500">五行局：</span><span className="text-gray-200">{result.fiveElementsClass}</span></div>
          <div><span className="text-gray-500">命主：</span><span className="text-gray-200">{result.soul} / {result.body}</span></div>
        </div>
      </div>

      {/* 十二宫 */}
      <h3 className="text-lg font-semibold text-gold-300 font-serif mb-3">十二宫 · 四化 · 庙旺 · 大限</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {(result as any).palaces.map((palace: any) => {
          const majors = palace.majorStars || []
          const minors = [...(palace.minorStars || []), ...(palace.adjectiveStars || [])]

          return (<div key={palace.index}
            className={`rounded-xl border p-3 backdrop-blur ${palace.isBodyPalace ? 'border-gold-500 bg-gold-900/20' : 'border-dark-600 bg-dark-800/80'}`}>
            {/* 宫名 + 大限 */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gold-400">
                {palace.name}
                {palace.isBodyPalace && <span className="ml-1 text-gold-300">(身)</span>}
              </p>
              {palace.decadal && <p className="text-[9px] text-gray-500">{palace.decadal.range[0]}-{palace.decadal.range[1]}岁</p>}
            </div>
            <p className="text-[9px] text-gray-600 mb-2">{palace.heavenlyStem} {palace.earthlyBranch}</p>

            {/* 主星 + 庙旺 + 四化 */}
            {majors.length > 0 ? majors.map((star: any, i: number) => (
              <p key={i} className="text-xs font-semibold text-gold-300 flex items-center gap-1 flex-wrap">
                <span>{star.name}</span>
                {star.brightness && BRIGHTNESS[star.brightness] && (
                  <span className={`text-[9px] ${BRIGHTNESS[star.brightness].color}`}>{BRIGHTNESS[star.brightness].label}</span>
                )}
                {star.mutagen && MUTAGEN[star.mutagen] && (
                  <span className={`text-[9px] ${MUTAGEN[star.mutagen].color}`}>{MUTAGEN[star.mutagen].label}</span>
                )}
              </p>
            )) : <p className="text-[10px] text-gray-600 italic">—</p>}

            {/* 辅星 */}
            {minors.length > 0 && <div className="mt-1 pt-1 border-t border-dark-600 flex flex-wrap gap-x-1.5">
              {minors.map((star: any, i: number) => (
                <span key={i} className={`text-[9px] ${star.type === 'bad' ? 'text-red-400' : 'text-cyan-300'}`}>{star.name} </span>
              ))}
            </div>}
          </div>)
        })}
      </div>
    </div>)}
  </div>)
}
