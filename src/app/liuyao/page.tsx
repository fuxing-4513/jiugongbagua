'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n'

const trigrams = [
  { name: '乾', yao: [1, 1, 1], symbol: '☰' },
  { name: '兑', yao: [1, 1, 0], symbol: '☱' },
  { name: '离', yao: [1, 0, 1], symbol: '☲' },
  { name: '震', yao: [1, 0, 0], symbol: '☳' },
  { name: '巽', yao: [0, 1, 1], symbol: '☴' },
  { name: '坎', yao: [0, 1, 0], symbol: '☵' },
  { name: '艮', yao: [0, 0, 1], symbol: '☶' },
  { name: '坤', yao: [0, 0, 0], symbol: '☷' },
]

const hexagramNames = [
  '乾为天', '坤为地', '水雷屯', '山水蒙', '水天需', '天水讼', '地水师', '水地比',
  '风天小畜', '天泽履', '地天泰', '天地否', '天火同人', '大有', '地山谦', '雷地豫',
  '泽雷随', '山风蛊', '地临', '风地观', '火雷噬嗑', '山火贲', '山地剥', '地雷复',
  '天雷无妄', '山天大畜', '山雷颐', '泽风大过', '坎为水', '离为火', '泽山咸', '雷风恒',
  '天山遁', '雷天大壮', '火地晋', '地火明夷', '风火家人', '火泽睽', '水山蹇', '雷水解',
  '山泽损', '风雷益', '泽天夬', '天风姤', '泽地萃', '地风升', '泽水困', '水风井',
  '泽火革', '火风鼎', '震为雷', '艮为山', '风山渐', '雷泽归妹', '雷火丰', '火山旅',
  '巽为风', '兑为泽', '风水涣', '水泽节', '风泽中孚', '雷山小过', '水火既济', '火水未济',
]

export default function LiuyaoPage() {
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

  const [result, setResult] = useState<string | null>(null)

  const cast = () => {
    const upperIdx = Math.floor(Math.random() * 8)
    const lowerIdx = Math.floor(Math.random() * 8)
    const changingUpper = Math.floor(Math.random() * 8)
    const changingLower = Math.floor(Math.random() * 8)
    const hexagramNum = upperIdx * 8 + lowerIdx
    const name = hexagramNames[hexagramNum] || hexagramNames[0]
    setResult(`上卦: ${trigrams[upperIdx].symbol} ${trigrams[upperIdx].name}\n下卦: ${trigrams[lowerIdx].symbol} ${trigrams[lowerIdx].name}\n本卦: ${name}\n变卦上卦: ${trigrams[changingUpper].symbol} ${trigrams[changingUpper].name}\n变卦下卦: ${trigrams[changingLower].symbol} ${trigrams[changingLower].name}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-red-900 font-serif mb-3">{getT('liuyao.title')}</h1>
      <p className="text-gray-600 mb-8">{getT('liuyao.desc')}</p>

      <div className="bg-white rounded-xl border border-red-100 p-6 mb-8 text-center">
        <button onClick={cast} className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg text-lg transition-colors">
          ☯ {getT('liuyao.startDivination')}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{getT('liuyao.resultTitle')}</h2>
          <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}
