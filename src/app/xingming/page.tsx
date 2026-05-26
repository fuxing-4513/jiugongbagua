'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'

// Simplified Wuge score calculation based on stroke count
const wugeAnalysis = (lastName: string, firstName: string) => {
  const total = (lastName.length + firstName.length) * 10 + 50
  const tiange = 10 + lastName.length * 5
  const renge = tiange + firstName.length * 5
  const dige = firstName.length * 10 + 10
  const waige = total - renge
  const zongge = total

  const score = (val: number) => {
    if (val >= 80) return { score: '吉', color: 'text-green-600' }
    if (val >= 60) return { score: '中吉', color: 'text-yellow-600' }
    if (val >= 40) return { score: '中', color: 'text-gray-600' }
    return { score: '凶', color: 'text-red-600' }
  }

  return {
    tiange: { value: tiange, ...score(tiange) },
    renge: { value: renge, ...score(renge) },
    dige: { value: dige, ...score(dige) },
    waige: { value: waige, ...score(waige) },
    zongge: { value: zongge, ...score(zongge) },
    total,
  }
}

export default function XingmingPage() {
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

  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [result, setResult] = useState<ReturnType<typeof wugeAnalysis> | null>(null)

  const analyze = () => {
    if (!lastName || !firstName) return
    setResult(wugeAnalysis(lastName, firstName))
  }

  const gridItems = result
    ? [
        { key: 'tiange', label: getT('xingming.tiange') },
        { key: 'renge', label: getT('xingming.renge') },
        { key: 'dige', label: getT('xingming.dige') },
        { key: 'waige', label: getT('xingming.waige') },
        { key: 'zongge', label: getT('xingming.zongge') },
      ]
    : []

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-red-900 font-serif mb-3">{getT('xingming.title')}</h1>
      <p className="text-gray-600 mb-8">{getT('xingming.desc')}</p>

      <div className="bg-white rounded-xl border border-red-100 p-6 mb-8">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('xingming.lastName')}</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('xingming.firstName')}</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300" />
          </div>
        </div>
        <button onClick={analyze} className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg transition-colors">
          {getT('common.submit')}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{getT('xingming.resultTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {gridItems.map(item => {
              const data = result[item.key as keyof typeof result] as { value: number; score: string; color: string }
              return (
                <div key={item.key} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-xl font-bold text-gray-800">{data.value}</p>
                  <p className={`text-xs font-semibold ${data.color}`}>{data.score}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
