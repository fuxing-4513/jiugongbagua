'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { Solar, Lunar, EightChar } from 'lunar-typescript'

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
  { value: '0', label: '子时 (23:00-00:59)' },
  { value: '1', label: '丑时 (01:00-02:59)' },
  { value: '2', label: '寅时 (03:00-04:59)' },
  { value: '3', label: '卯时 (05:00-06:59)' },
  { value: '4', label: '辰时 (07:00-08:59)' },
  { value: '5', label: '巳时 (09:00-10:59)' },
  { value: '6', label: '午时 (11:00-12:59)' },
  { value: '7', label: '未时 (13:00-14:59)' },
  { value: '8', label: '申时 (15:00-16:59)' },
  { value: '9', label: '酉时 (17:00-18:59)' },
  { value: '10', label: '戌时 (19:00-20:59)' },
  { value: '11', label: '亥时 (21:00-22:59)' },
]

// ── 五行 ──
const wuxingMap: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火',
  戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
  子: '水', 丑: '土', 寅: '木', 卯: '木',
  辰: '土', 巳: '火', 午: '火', 未: '土',
  申: '金', 酉: '金', 戌: '土', 亥: '水',
}

const wuxingColors: Record<string, string> = {
  金: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  木: 'bg-green-900/40 text-green-300 border-green-700',
  水: 'bg-blue-900/40 text-blue-300 border-blue-700',
  火: 'bg-red-900/40 text-red-300 border-red-700',
  土: 'bg-amber-900/40 text-amber-300 border-amber-700',
}

// ── 纳音 ──
const nayiMap: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
}

// ── 十神映射 ──
const shishenMap: Record<string, Record<string, string>> = {
  '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
  '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
  '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
  '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
  '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
  '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
  '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
  '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
  '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
  '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' },
}

function getShishen(dayGan: string, otherGan: string): string {
  return shishenMap[dayGan]?.[otherGan] ?? ''
}

// ── 地支藏干 ──
const hiddenStemsMap: Record<string, string[]> = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲'],
}

// ── Types ──
interface PillarData {
  gan: string
  zhi: string
  ganzhi: string
  nayi: string
  wuxingGan: string
  wuxingZhi: string
  hiddenStems: string[]
}

interface DayunInfo {
  ganZhi: string
  startAge: number
  startYear: number
}

interface ResultData {
  yearPillar: PillarData
  monthPillar: PillarData
  dayPillar: PillarData
  hourPillar: PillarData
  wuxingCount: Record<string, number>
  shishen: string[]
  dayGan: string
  dayZhi: string
  dayanStart: string
  dayan: DayunInfo[]
  // 神煞 — 直接从 EightChar 获取
  shensha: Record<string, string[]>
}

// ── Component ──
export default function BaziClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const now = new Date()
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('6')
  const [result, setResult] = useState<ResultData | null>(null)
  const [error, setError] = useState('')

  const analyze = () => {
    setError('')
    const y = parseInt(year); const m = parseInt(month)
    const d = parseInt(day); const h = parseInt(hour)
    if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h)) { setError('请输入有效的日期和时间'); return }
    if (m < 1 || m > 12 || d < 1 || d > 31 || h < 0 || h > 11) { setError('日期或时辰无效'); return }

    try {
      const solar = Solar.fromYmdHms(y, m, d, h, 0, 0)
      const lunar = solar.getLunar()
      const ec = lunar.getEightChar()

      // 四柱
      const pillars = {
        yearPillar: { gan: ec.getYear(), zhi: ec.getYearZhi(), ganzhi: ec.getYear() + ec.getYearZhi(), nayi: nayiMap[ec.getYear() + ec.getYearZhi()] || '—', wuxingGan: wuxingMap[ec.getYear()] || '', wuxingZhi: wuxingMap[ec.getYearZhi()] || '', hiddenStems: hiddenStemsMap[ec.getYearZhi()] || [] },
        monthPillar: { gan: ec.getMonth(), zhi: ec.getMonthZhi(), ganzhi: ec.getMonth() + ec.getMonthZhi(), nayi: nayiMap[ec.getMonth() + ec.getMonthZhi()] || '—', wuxingGan: wuxingMap[ec.getMonth()] || '', wuxingZhi: wuxingMap[ec.getMonthZhi()] || '', hiddenStems: hiddenStemsMap[ec.getMonthZhi()] || [] },
        dayPillar: { gan: ec.getDay(), zhi: ec.getDayZhi(), ganzhi: ec.getDay() + ec.getDayZhi(), nayi: nayiMap[ec.getDay() + ec.getDayZhi()] || '—', wuxingGan: wuxingMap[ec.getDay()] || '', wuxingZhi: wuxingMap[ec.getDayZhi()] || '', hiddenStems: hiddenStemsMap[ec.getDayZhi()] || [] },
        hourPillar: { gan: ec.getTime(), zhi: ec.getTimeZhi(), ganzhi: ec.getTime() + ec.getTimeZhi(), nayi: nayiMap[ec.getTime() + ec.getTimeZhi()] || '—', wuxingGan: wuxingMap[ec.getTime()] || '', wuxingZhi: wuxingMap[ec.getTimeZhi()] || '', hiddenStems: hiddenStemsMap[ec.getTimeZhi()] || [] },
      }

      // 五行计数
      const allGanzhi = [ec.getYear(), ec.getYearZhi(), ec.getMonth(), ec.getMonthZhi(), ec.getDay(), ec.getDayZhi(), ec.getTime(), ec.getTimeZhi()]
      const wuxingCount: Record<string, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
      for (const gz of allGanzhi) {
        const wx = wuxingMap[gz]
        if (wx && wuxingCount[wx] !== undefined) wuxingCount[wx]++
      }

      // 十神
      const dayGan = ec.getDay()
      const shishen = [ec.getYear(), ec.getMonth(), ec.getDay(), ec.getTime()].map(g => getShishen(dayGan, g))

      // 大运
      let dayan: DayunInfo[] = []
      let dayanStart = '—'
      try {
        const yun = ec.getYun(2)
        const dayunList = yun.getDaYun()
        dayan = dayunList.map((dy: any) => ({
          ganZhi: dy.getGanZhi(),
          startAge: dy.getStartAge(),
          startYear: dy.getStartYear(),
        }))
        if (dayunList.length > 0) dayanStart = `${dayunList[0].getStartYear()}年`
      } catch { /* 无法计算大运的特殊情况 */ }

      // 神煞
      const shensha: Record<string, string[]> = {}
      try {
        const ss: string[] = ['year', 'month', 'day', 'time']
        ss.forEach((s, i) => {
          const method = s === 'year' ? 'getYearShenSha' : s === 'month' ? 'getMonthShenSha' : s === 'day' ? 'getDayShenSha' : 'getTimeShenSha'
          const list = (ec as any)[method]?.() || []
          if (list.length > 0) {
            const key = [pillars.yearPillar.ganzhi, pillars.monthPillar.ganzhi, pillars.dayPillar.ganzhi, pillars.hourPillar.ganzhi][i]
            shensha[key] = list
          }
        })
      } catch { /* 神煞不可用 */ }

      setResult({ ...pillars, wuxingCount, shishen, dayGan, dayZhi: ec.getDayZhi(), dayanStart, dayan, shensha })
    } catch {
      setError('八字计算出错，请检查日期')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('bazi.title', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('bazi.desc', lang)}</p>

      {/* ── Input Form ── */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">{tk('bazi.birthInfo', lang)}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { label: tk('common.year', lang), val: year, set: setYear, min: 1900, max: 2100 },
            { label: tk('common.month', lang), val: month, set: setMonth, min: 1, max: 12 },
            { label: tk('common.day', lang), val: day, set: setDay, min: 1, max: 31 },
          ].map((f, i) => (
            <div key={i}>
              <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
              <input type="number" value={f.val} onChange={e => f.set(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500"
                min={f.min} max={f.max} />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-400 mb-1">{tk('common.hour', lang)}</label>
            <select value={hour} onChange={e => setHour(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 focus:outline-none focus:border-gold-500">
              {hourOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
        <div className="space-y-5">
          {/* 四柱命盘 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h2 className="text-lg font-semibold text-gold-300 font-serif mb-4 text-center">
              {tk('bazi.resultTitle', lang)}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: tk('bazi.yearPillar', lang), p: result.yearPillar },
                { label: tk('bazi.monthPillar', lang), p: result.monthPillar },
                { label: '日柱（' + result.shishen[2] + '）', p: result.dayPillar },
                { label: tk('bazi.hourPillar', lang), p: result.hourPillar },
              ].map((item, i) => (
                <div key={i} className="bg-dark-700 rounded-xl p-4 text-center border border-dark-600">
                  <p className="text-xs text-gray-500 mb-2">{item.label}</p>
                  <p className="text-2xl font-bold text-gold-400 font-serif mb-1">
                    {item.p.gan}{item.p.zhi}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs mb-1">
                    <span className="bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded">{item.p.wuxingGan}</span>
                    <span className="text-gray-600">/</span>
                    <span className="bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded">{item.p.wuxingZhi}</span>
                  </div>
                  <p className="text-xs text-gray-500">{item.p.nayi}</p>
                  {/* 藏干 */}
                  {item.p.hiddenStems.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-dark-600">
                      <p className="text-[10px] text-gray-600 mb-1">藏干</p>
                      <div className="flex gap-1 justify-center">
                        {item.p.hiddenStems.map((s, j) => (
                          <span key={j} className="text-[10px] bg-gray-800 text-gray-400 px-1 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 天干 + 地支 双行展示 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-2">{tk('bazi.heavenlyStems', lang)}（{tk('bazi.earthlyBranches', lang)}上）</p>
                <div className="flex gap-2 justify-center mb-1">
                  {[result.yearPillar, result.monthPillar, result.dayPillar, result.hourPillar].map((p, i) => (
                    <div key={i} className="text-center">
                      <span className="block w-8 h-8 flex items-center justify-center bg-red-900/40 text-red-300 rounded-full text-sm font-bold font-serif mb-1">
                        {p.zhi}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-dark-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-2">{tk('bazi.heavenlyStems', lang)}（{tk('bazi.earthlyBranches', lang)}下）</p>
                <div className="flex gap-2 justify-center mb-1">
                  {[result.yearPillar, result.monthPillar, result.dayPillar, result.hourPillar].map((p, i) => (
                    <div key={i} className="text-center">
                      <span className="block w-8 h-8 flex items-center justify-center bg-amber-900/40 text-amber-300 rounded-full text-sm font-bold font-serif mb-1">
                        {p.gan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 十神 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-base font-semibold text-gray-200 mb-3">十神</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: tk('bazi.yearPillar', lang), val: result.shishen[0] },
                { label: tk('bazi.monthPillar', lang), val: result.shishen[1] },
                { label: '日主', val: '日主 ✦ ' + result.dayGan },
                { label: tk('bazi.hourPillar', lang), val: result.shishen[3] },
              ].map((item, i) => (
                <div key={i} className="bg-purple-900/20 rounded-lg p-3 text-center border border-purple-800/30">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-purple-300">{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 五行分布 */}
          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
            <h3 className="text-base font-semibold text-gray-200 mb-3">五行分布</h3>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(result.wuxingCount).map(([wx, count]) => (
                <div key={wx} className={`rounded-lg p-3 text-center border ${wuxingColors[wx] || 'bg-dark-700 border-dark-600'}`}>
                  <p className="text-lg font-bold">{wx}</p>
                  <p className="text-xs mt-1">{count} 个</p>
                </div>
              ))}
            </div>
          </div>

          {/* 神煞 */}
          {Object.keys(result.shensha).length > 0 && (
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
              <h3 className="text-base font-semibold text-gray-200 mb-3">神煞</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(result.shensha).map(([ganZhi, list]) => (
                  <div key={ganZhi} className="bg-dark-700 rounded-lg p-3">
                    <p className="text-xs text-gold-400 font-serif font-semibold mb-1">{ganZhi}</p>
                    <div className="flex flex-wrap gap-1">
                      {list.map((s, i) => (
                        <span key={i} className="text-[10px] bg-cyan-900/30 text-cyan-300 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 大运 */}
          {result.dayan.length > 0 && (
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
              <h3 className="text-base font-semibold text-gray-200 mb-3">大运</h3>
              <p className="text-xs text-gray-500 mb-3">起运：{result.dayanStart}</p>
              <div className="flex flex-wrap gap-1.5">
                {result.dayan.map((dy, i) => (
                  <span key={i}
                    className="inline-block bg-amber-900/30 text-amber-300 text-xs px-2.5 py-1 rounded-full border border-amber-700/40 font-serif">
                    {dy.ganZhi} ({dy.startAge}岁)
                    {i < result.dayan.length - 1 && <span className="text-amber-700 mx-1">→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
