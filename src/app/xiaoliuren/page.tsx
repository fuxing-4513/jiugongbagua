'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'

const palmMethods = [
  { name: '大安', fortune: '吉', meaning: '万事平安，谋事顺利' },
  { name: '留连', fortune: '凶', meaning: '事难成就，去者未还' },
  { name: '速喜', fortune: '吉', meaning: '喜事来临，行人有信' },
  { name: '赤口', fortune: '凶', meaning: '口舌是非，官事临身' },
  { name: '小吉', fortune: '吉', meaning: '凡事皆宜，行人立至' },
  { name: '空亡', fortune: '凶', meaning: '事不长久，谋事落空' },
]

export default function XiaoliurenPage() {
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

  const [num1, setNum1] = useState('3')
  const [num2, setNum2] = useState('6')
  const [num3, setNum3] = useState('9')
  const [result, setResult] = useState<typeof palmMethods[0] | null>(null)
  const [showResult, setShowResult] = useState(false)

  const analyze = () => {
    const n1 = parseInt(num1) || 1
    const n2 = parseInt(num2) || 1
    const n3 = parseInt(num3) || 1
    const idx = ((n1 - 1) + (n2 - 1) + (n3 - 1)) % 6
    setResult(palmMethods[idx])
    setShowResult(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-red-900 font-serif mb-3">{getT('xiaoliuren.title')}</h1>
      <p className="text-gray-600 mb-8">{getT('xiaoliuren.desc')}</p>

      <div className="bg-white rounded-xl border border-red-100 p-6 mb-8">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('xiaoliuren.num1')}</label>
            <input type="number" min="1" max="12" value={num1} onChange={e => setNum1(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('xiaoliuren.num2')}</label>
            <input type="number" min="1" max="12" value={num2} onChange={e => setNum2(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{getT('xiaoliuren.num3')}</label>
            <input type="number" min="1" max="12" value={num3} onChange={e => setNum3(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-300" />
          </div>
        </div>
        <button onClick={analyze} className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg transition-colors">
          {getT('common.submit')}
        </button>
      </div>

      {showResult && result && (
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{getT('xiaoliuren.resultTitle')}</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-lg font-bold text-gray-800">{result.name}</p>
            <p className={`text-sm font-semibold mt-1 ${result.fortune === '吉' ? 'text-green-600' : 'text-red-600'}`}>
              {result.fortune === '吉' ? getT('xiaoliuren.lucky') : getT('xiaoliuren.unlucky')}
            </p>
            <p className="text-sm text-gray-600 mt-2">{result.meaning}</p>
          </div>
        </div>
      )}
    </div>
  )
}
