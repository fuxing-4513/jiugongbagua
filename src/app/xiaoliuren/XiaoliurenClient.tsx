'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'

const palmMethods = [
  { name: '大安', fortune: '吉', meaning: '万事平安，谋事顺利' },
  { name: '留连', fortune: '凶', meaning: '事难成就，去者未还' },
  { name: '速喜', fortune: '吉', meaning: '喜事来临，行人有信' },
  { name: '赤口', fortune: '凶', meaning: '口舌是非，官事临身' },
  { name: '小吉', fortune: '吉', meaning: '凡事皆宜，行人立至' },
  { name: '空亡', fortune: '凶', meaning: '事不长久，谋事落空' },
]

export default function XiaoliurenClient() {
  const getT = useT()

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
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{getT('modules.xiaoliuren.name')}</h1>
      <p className="text-gray-400 mb-8">{getT('modules.xiaoliuren.desc')}</p>

      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-8">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">{getT('modules.xiaoliuren.num1')}</label>
            <input type="number" min="1" max="12" value={num1} onChange={e => setNum1(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">{getT('modules.xiaoliuren.num2')}</label>
            <input type="number" min="1" max="12" value={num2} onChange={e => setNum2(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">{getT('modules.xiaoliuren.num3')}</label>
            <input type="number" min="1" max="12" value={num3} onChange={e => setNum3(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500" />
          </div>
        </div>
        <button onClick={analyze} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">
          {getT('common.submit')}
        </button>
      </div>

      {showResult && result && (
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">{getT('modules.xiaoliuren.resultTitle')}</h2>
          <div className="bg-dark-700 rounded-lg p-4">
            <p className="text-lg font-bold text-gray-200">{result.name}</p>
            <p className={`text-sm font-semibold mt-1 ${result.fortune === '吉' ? 'text-green-400' : 'text-red-400'}`}>
              {result.fortune === '吉' ? getT('modules.xiaoliuren.lucky') : getT('modules.xiaoliuren.unlucky')}
            </p>
            <p className="text-sm text-gray-400 mt-2">{result.meaning}</p>
          </div>
        </div>
      )}
    </div>
  )
}
