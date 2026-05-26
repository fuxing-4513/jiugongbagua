'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'

const digitEnergy: Record<string, { meaning: string; score: string }> = {
  '0': { meaning: '圆满', score: '吉' },
  '1': { meaning: '独立', score: '中吉' },
  '2': { meaning: '和谐', score: '中' },
  '3': { meaning: '活力', score: '吉' },
  '4': { meaning: '稳定', score: '中' },
  '5': { meaning: '变化', score: '中吉' },
  '6': { meaning: '顺利', score: '吉' },
  '7': { meaning: '神秘', score: '中吉' },
  '8': { meaning: '财富', score: '吉' },
  '9': { meaning: '长久', score: '吉' },
}

export default function ShumaPage() {
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

  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<{ overall: string; digits: { digit: string; meaning: string; score: string }[] } | null>(null)

  const analyze = () => {
    const digits = phone.replace(/\D/g, '').split('')
    if (digits.length === 0) return
    const digitResults = digits.map(d => ({
      digit: d,
      meaning: digitEnergy[d]?.meaning || '未知',
      score: digitEnergy[d]?.score || '中',
    }))
    const goodCount = digitResults.filter(d => d.score === '吉' || d.score === '中吉').length
    const ratio = goodCount / digitResults.length
    const overall = ratio >= 0.6 ? '吉' : ratio >= 0.4 ? '中' : '凶'
    setResult({ overall, digits: digitResults })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-red-900 font-serif mb-3">{getT('shuma.title')}</h1>
      <p className="text-gray-600 mb-8">{getT('shuma.desc')}</p>

      <div className="bg-white rounded-xl border border-red-100 p-6 mb-8">
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">{getT('common.phone')}</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="13800138000" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300" />
        </div>
        <button onClick={analyze} className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg transition-colors">
          {getT('common.submit')}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{getT('shuma.resultTitle')}</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-500">综合评分</p>
            <p className={`text-2xl font-bold ${result.overall === '吉' ? 'text-green-600' : result.overall === '中' ? 'text-yellow-600' : 'text-red-600'}`}>
              {result.overall}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.digits.map((d, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded px-2 py-1 text-center">
                <p className="text-lg font-bold text-gray-800">{d.digit}</p>
                <p className="text-xs text-gray-500">{d.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
