'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'
import { Solar, Lunar, EightChar } from 'lunar-typescript'

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

const wuxingMap: Record<string, string> = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
}

const nayiMap: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金',
  '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木',
  '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金',
  '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水',
  '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金',
  '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水',
  '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火',
  '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水',
  '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火',
  '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土',
  '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火',
  '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土',
  '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木',
  '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土',
  '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木',
  '壬戌': '大海水', '癸亥': '大海水',
}

interface PillarDisplay {
  gan: string
  zhi: string
  nayi: string
  wuxingGan: string
  wuxingZhi: string
}

interface ResultData {
  yearPillar: PillarDisplay
  monthPillar: PillarDisplay
  dayPillar: PillarDisplay
  hourPillar: PillarDisplay
  wuxingCount: Record<string, number>
  shishen: string[]
  dayGan: string
  dayZhi: string
  dayanStart: string
  dayan: string[]
}

function getShishen(dayGan: string, otherGan: string): string {
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
  return shishenMap[dayGan]?.[otherGan] ?? ''
}

const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

function makePillar(gan: string, zhi: string): PillarDisplay {
  return {
    gan,
    zhi,
    nayi: nayiMap[gan + zhi] ?? '—',
    wuxingGan: wuxingMap[gan] ?? '',
    wuxingZhi: wuxingMap[zhi] ?? '',
  }
}

export default function BaziClient() {
  const { t } = useLocale()

  const getT = (key: string): string => {
    const keys = key.split('.')
    let value: unknown = t
    for (const k of keys) {
      if (typeof value !== 'object' || value === null) return key
      value = (value as Record<string, unknown>)[k]
    }
    return typeof value === 'string' ? value : key
  }

  const now = new Date()
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [day, setDay] = useState(String(now.getDate()))
  const [hour, setHour] = useState('6')
  const [result, setResult] = useState<ResultData | null>(null)
  const [error, setError] = useState('')

  const analyze = () => {
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
      // Use lunar-typescript
      const solar = Solar.fromYmdHms(y, m, d, h, 0, 0)
      const lunar = solar.getLunar()
      const eightChar = lunar.getEightChar()

      // Get pillars as direct strings (gan+zhi pairs)
      const yearGan = eightChar.getYear()
      const yearZhi = eightChar.getYearZhi()
      const monthGan = eightChar.getMonth()
      const monthZhi = eightChar.getMonthZhi()
      const dayGan = eightChar.getDay()
      const dayZhi = eightChar.getDayZhi()
      const hourGan = eightChar.getTime()
      const hourZhi = eightChar.getTimeZhi()

      // Build pillars with full gan+zhi string
      const yearGanZhi = yearGan + yearZhi
      const monthGanZhi = monthGan + monthZhi
      const dayGanZhi = dayGan + dayZhi
      const hourGanZhi = hourGan + hourZhi

      // For the full 天干地支, get from Lunar
      const lunarYear = lunar.getYearInChinese()
      const lunarMonth = lunar.getMonthInChinese()
      const lunarDay = lunar.getDayInChinese()

      const pillars = {
        yearPillar: makePillar(yearGan, yearZhi),
        monthPillar: makePillar(monthGan, monthZhi),
        dayPillar: makePillar(dayGan, dayZhi),
        hourPillar: makePillar(hourGan, hourZhi),
      }

      // Count wuxing from all four pillars
      const allGanzhi = [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi]
      const wuxingCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }
      for (const gz of allGanzhi) {
        const wx = wuxingMap[gz]
        if (wx && wuxingCount[wx] !== undefined) {
          wuxingCount[wx]++
        }
      }

      // Get shishen for each heavenly stem
      const shishen = [yearGan, monthGan, dayGan, hourGan].map(g => getShishen(dayGan, g))

      // Get Dayun (大运) from EightChar
      let dayan: string[] = []
      let dayanStart = '—'
      try {
        const yun = eightChar.getYun(2)
        const dayunList = yun.getDaYun()
        dayan = dayunList.map((dy: { getGanZhi: () => string; getStartAge: () => number; getStartYear: () => number }) => {
          const ganZhi = dy.getGanZhi()
          const age = dy.getStartAge()
          return `${ganZhi} (${age}岁)`
        })
        if (dayunList.length > 0) {
          dayanStart = `${dayunList[0].getStartYear()}年`
        }
      } catch {
        dayan = []
      }

      setResult({
        ...pillars,
        wuxingCount,
        shishen,
        dayGan,
        dayZhi,
        dayanStart,
        dayan,
      })
    } catch (e) {
      setError('八字计算出错，请检查输入的日期是否有效')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-red-900 font-serif mb-3">{getT('bazi.title')}</h1>
      <p className="text-gray-600 mb-8">{getT('bazi.desc')}</p>

      {/* Input Form */}
      <div className="bg-white rounded-xl border border-red-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{getT('bazi.birthInfo')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('common.year')}</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-200"
              min={1900}
              max={2100}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('common.month')}</label>
            <input
              type="number"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-200"
              min={1} max={12}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('common.day')}</label>
            <input
              type="number"
              value={day}
              onChange={e => setDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-200"
              min={1} max={31}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('common.hour')}</label>
            <select
              value={hour}
              onChange={e => setHour(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-200 bg-white"
            >
              {hourOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        <button
          onClick={analyze}
          className="bg-red-700 hover:bg-red-800 text-white px-6 py-2.5 rounded-lg transition-colors active:scale-95"
        >
          {getT('common.submit')}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Four Pillars */}
          <div className="bg-white rounded-xl border border-red-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">{getT('bazi.resultTitle')}</h2>

            {/* Pillar Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: getT('bazi.yearPillar'), pillar: result.yearPillar },
                { label: getT('bazi.monthPillar'), pillar: result.monthPillar },
                { label: getT('bazi.dayPillar'), pillar: result.dayPillar },
                { label: getT('bazi.hourPillar'), pillar: result.hourPillar },
              ].map((item, i) => (
                <div key={i} className="bg-gradient-to-b from-red-50 to-amber-50 rounded-xl p-4 text-center border border-red-100">
                  <p className="text-xs text-gray-500 mb-2">{item.label}</p>
                  <p className="text-xl font-bold text-red-900 font-serif mb-1">
                    {item.pillar.gan}{item.pillar.zhi}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{item.pillar.wuxingGan}</span>
                    <span className="text-gray-300">/</span>
                    <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{item.pillar.wuxingZhi}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.pillar.nayi}</p>
                </div>
              ))}
            </div>

            {/* Heavenly Stems & Earthly Branches row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2">{getT('bazi.heavenlyStems')}</p>
                <div className="flex gap-2 justify-center">
                  {[result.yearPillar.gan, result.monthPillar.gan, result.dayPillar.gan, result.hourPillar.gan].map((g, i) => (
                    <span key={i} className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-800 rounded-full text-sm font-bold font-serif">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2">{getT('bazi.earthlyBranches')}</p>
                <div className="flex gap-2 justify-center">
                  {[result.yearPillar.zhi, result.monthPillar.zhi, result.dayPillar.zhi, result.hourPillar.zhi].map((z, i) => (
                    <span key={i} className="w-8 h-8 flex items-center justify-center bg-amber-100 text-amber-800 rounded-full text-sm font-bold font-serif">
                      {z}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Wuxing Distribution */}
          <div className="bg-white rounded-xl border border-red-100 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">五行分布</h3>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(result.wuxingCount).map(([wx, count]) => {
                const colors: Record<string, string> = {
                  '金': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                  '木': 'bg-green-100 text-green-800 border-green-200',
                  '水': 'bg-blue-100 text-blue-800 border-blue-200',
                  '火': 'bg-red-100 text-red-800 border-red-200',
                  '土': 'bg-amber-100 text-amber-800 border-amber-200',
                }
                return (
                  <div key={wx} className={`rounded-lg p-3 text-center border ${colors[wx] ?? 'bg-gray-50'}`}>
                    <p className="text-lg font-bold">{wx}</p>
                    <p className="text-xs mt-1">{count} 个</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Shishen */}
          <div className="bg-white rounded-xl border border-red-100 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">十神</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: getT('bazi.yearPillar'), value: result.shishen[0] },
                { label: getT('bazi.monthPillar'), value: result.shishen[1] },
                { label: '日主', value: '日主' },
                { label: getT('bazi.hourPillar'), value: result.shishen[3] },
              ].map((item, i) => (
                <div key={i} className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-purple-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dayun */}
          {result.dayan.length > 0 && (
            <div className="bg-white rounded-xl border border-red-100 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-3">大运</h3>
              <p className="text-xs text-gray-500 mb-3">起运：{result.dayanStart}</p>
              <div className="flex flex-wrap gap-2">
                {result.dayan.map((dy, i) => (
                  <span key={i} className="inline-block bg-amber-50 text-amber-800 text-sm px-3 py-1.5 rounded-full border border-amber-200 font-serif">
                    {dy}
                    {i < result.dayan.length - 1 && (
                      <span className="text-amber-300 mx-1">→</span>
                    )}
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
