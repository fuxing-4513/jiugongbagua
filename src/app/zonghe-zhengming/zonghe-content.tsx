'use client'

import { useState, useMemo } from 'react'
import { Solar, Lunar } from 'lunar-typescript'
import CalendarInput, { type CalendarType } from '@/components/CalendarInput'
import { enrichBazi } from '@/lib/bazi-enrich'
import { crossValidate } from '@/lib/zonghe-yinzheng'
import { calcTrueSolarTime } from '@/lib/solar-time'

const HOUR_OPTIONS = [
  { value: '0', label: '子 23:00~00:59' }, { value: '1', label: '丑 01:00~02:59' },
  { value: '2', label: '寅 03:00~04:59' }, { value: '3', label: '卯 05:00~06:59' },
  { value: '4', label: '辰 07:00~08:59' }, { value: '5', label: '巳 09:00~10:59' },
  { value: '6', label: '午 11:00~12:59' }, { value: '7', label: '未 13:00~14:59' },
  { value: '8', label: '申 15:00~16:59' }, { value: '9', label: '酉 17:00~18:59' },
  { value: '10', label: '戌 19:00~20:59' }, { value: '11', label: '亥 21:00~22:59' },
]

export default function ZongheZhengmingPage() {
  const now = new Date()
  const [cal, setCal] = useState<CalendarType>('solar')
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('6')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [isLeap, setIsLeap] = useState(false)
  const [useTrueSolar, setUseTrueSolar] = useState(true)
  const [longitude, setLongitude] = useState(116.4)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const doCalc = () => {
    setError('')
    setResult(null)
    const y = parseInt(year), m = parseInt(month), d = parseInt(day), h = parseInt(hour)
    if (isNaN(y)||isNaN(m)||isNaN(d)||isNaN(h)||m<1||m>12||d<1||d>31) { setError('日期无效'); return }

    try {
      // 真太阳时修正
      let finalHour = h
      let solarNote = ''
      if (useTrueSolar) {
        const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
        const st = calcTrueSolarTime(dateStr, h, 0, longitude)
        finalHour = st.adjustedHour
        solarNote = st.note
      }

      // 排八字（使用小时信息）
      const solar = Solar.fromYmdHms(y, m, d, Math.round(finalHour), 0, 0)
      const lunar = solar.getLunar()
      const eightChar = lunar.getEightChar()
      const bazi = [
        eightChar.getYearGan()+eightChar.getYearZhi(),
        eightChar.getMonthGan()+eightChar.getMonthZhi(),
        eightChar.getDayGan()+eightChar.getDayZhi(),
        eightChar.getTimeGan()+eightChar.getTimeZhi(),
      ]

      const siZhu = {
        '年': { gan: bazi[0][0], zhi: bazi[0][1] },
        '月': { gan: bazi[1][0], zhi: bazi[1][1] },
        '日': { gan: bazi[2][0], zhi: bazi[2][1] },
        '时': { gan: bazi[3][0], zhi: bazi[3][1] },
      }

      // 八字补层
      const enrich = enrichBazi(siZhu)

      // 紫微信息（模拟简单数据，完整紫微需要 iztro）
      const fiveElem = ''

      setResult({
        dateStr: `${y}年${m}月${d}日`,
        bazi: `${bazi[0]} ${bazi[1]} ${bazi[2]} ${bazi[3]}`,
        dayMaster: eightChar.getDayGan(),
        siZhu,
        enrich,
        fiveElem,
        zodiac: lunar.getYearShengXiao(),
        solarNote,
        // 模拟一些紫微数据用于印证演示
        ziweiMock: {
          mingGong: eightChar.getMingGong() || '',
          wuXingJu: { name: fiveElem, number: 0 },
          mainStars: [eightChar.getDayGan() + '主星'],
        }
      })
    } catch (e: any) {
      setError('计算出错：' + (e?.message || '未知错误'))
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">八字·紫微综合印证</h1>
      <p className="text-gray-400 mb-8">同盘对账 · 六维交叉佐证 · 命格全息解读</p>

      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-8">
        <div className="flex gap-4 mb-4 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <CalendarInput
              calendarType={cal}
              year={year}
              month={month}
              day={day}
              hour={String(parseInt(hour) * 2)}
              isLeapMonth={isLeap}
              onCalendarTypeChange={(v) => setCal(v)}
              onYearChange={setYear}
              onMonthChange={setMonth}
              onDayChange={setDay}
              onHourChange={(v) => setHour(String(Math.floor(parseInt(v) / 2)))}
              onLeapMonthChange={setIsLeap}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">时辰</label>
            <select value={hour} onChange={e => setHour(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200">
              {HOUR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">性别</label>
            <select value={gender} onChange={e => setGender(e.target.value as any)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200">
              <option value="male">男</option><option value="female">女</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">真太阳时</label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={useTrueSolar} onChange={e => setUseTrueSolar(e.target.checked)} />
              {useTrueSolar ? '经度 ' : '关闭'}<input type="number" value={longitude} onChange={e => setLongitude(parseFloat(e.target.value) || 116.4)}
                className="bg-dark-700 border border-dark-600 rounded px-2 py-1 w-20 text-sm text-gray-200" disabled={!useTrueSolar} />°E
            </label>
          </div>
          <button onClick={doCalc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg text-sm">开始印证</button>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      {result && (
        <div className="space-y-4">
          {/* 八字+紫微总览 */}
          <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500">{result.dateStr} · {result.zodiac}命</p>
              <p className="text-xl font-bold text-gold-400 font-serif">{result.bazi}</p>
              <p className="text-xs text-gray-500 mt-1">日主 {result.dayMaster} · 五行局 {result.fiveElem}</p>
              {result.solarNote && <p className="text-xs text-cyan-400 mt-1">{result.solarNote}</p>}
            </div>

            {/* 八字推演 */}
            <div className="bg-dark-700/60 rounded-lg p-3 mb-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">八字推演</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>格局: <span className="text-gold-400 font-semibold">{result.enrich.格局.primary}</span></div>
                <div>旺衰: <span className="font-semibold" style={{color: result.enrich.旺衰.verdict.includes('强') ? '#ef4444' : result.enrich.旺衰.verdict.includes('弱') ? '#3b82f6' : '#fbbf24'}}>{result.enrich.旺衰.verdict}</span></div>
                <div>五行缺: <span className="text-red-400">{result.enrich.五行统计.missing.join('、') || '无'}</span></div>
                <div>调候: <span className="text-cyan-400">{result.enrich.调候用神.join('、') || '无'}</span></div>
              </div>
              {result.enrich.地支关系.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.enrich.地支关系.map((r: any, i: number) => (
                    <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-dark-600 text-gray-400">{r.type}({r.zhi.join('')})</span>
                  ))}
                </div>
              )}
            </div>

            {/* 综合印证卡片 */}
            {(() => {
              const cv = crossValidate(result.enrich, result.ziweiMock)
              return (
                <div className={`rounded-lg p-3 border ${cv.consistency === '同向印证' ? 'bg-green-900/20 border-green-700/40' : cv.consistency === '互补印证' ? 'bg-amber-900/20 border-amber-700/40' : 'bg-red-900/20 border-red-700/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">综合印证</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      cv.consistency === '同向印证' ? 'bg-green-800 text-green-300' :
                      cv.consistency === '互补印证' ? 'bg-amber-800 text-amber-300' : 'bg-red-800 text-red-300'
                    }`}>{cv.consistency}</span>
                  </div>
                  <p className="text-xs text-gray-300">{cv.axes.fusedAxis}</p>

                  {/* 六维对账 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                    {cv.dims.map((d, i) => (
                      <div key={i} className="bg-dark-800/60 rounded p-1.5">
                        <p className="text-xs text-gray-500">{d.name} <span>{d.verdict}</span></p>
                        <p className="text-[10px] text-gray-400">{d.bazi}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">{cv.conclusion}</p>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
