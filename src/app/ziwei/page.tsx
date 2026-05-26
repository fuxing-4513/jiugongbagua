'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'

export default function ZiweiPage() {
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

  const [year, setYear] = useState('1990')
  const [month, setMonth] = useState('1')
  const [day, setDay] = useState('1')
  const [result, setResult] = useState<string | null>(null)

  const generateChart = () => {
    const y = parseInt(year)
    const m = parseInt(month)
    const d = parseInt(day)
    const chartLines = [
      `命宫: ${['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][(y + m + d) % 12]}宫`,
      `紫微星: ${['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][(y * 2 + m + d) % 12]}宫`,
      `天府星: ${['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][(y + m * 3 + d) % 12]}宫`,
    ].join('\n')
    setResult(chartLines)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-red-900 font-serif mb-3">{getT('ziwei.title')}</h1>
      <p className="text-gray-600 mb-8">{getT('ziwei.desc')}</p>

      <div className="bg-white rounded-xl border border-red-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{getT('ziwei.birthInfo')}</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('common.year')}</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('common.month')}</label>
            <input type="number" value={month} onChange={e => setMonth(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('common.day')}</label>
            <input type="number" value={day} onChange={e => setDay(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300" />
          </div>
        </div>
        <button onClick={generateChart} className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg transition-colors">
          {getT('common.submit')}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{getT('ziwei.resultTitle')}</h2>
          <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}
