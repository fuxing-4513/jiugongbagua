'use client'

import { useState, useMemo } from 'react'
import { useLocale } from '@/lib/i18n'
import { DICT } from './ceziDict'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let v: unknown = lang
  for (const k of keys) {
    if (typeof v !== 'object' || v === null) return key
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : key
}

export interface SancaiExplanation {
  总论: string; 性格: string; 意志: string; 事业: string; 家庭: string;
  婚姻: string; 子女: string; 社交: string; 精神: string;
  财运: string; 健康: string; 老运: string;
}

export interface CharData {
  c: string; s: number; w: string; m: string; i: string;
  k?: string; e?: SancaiExplanation;
}

const DICT_SIZE = Object.keys(DICT).length

const WUXING_COLORS: Record<string, string> = {
  '金':'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  '木':'bg-green-900/40 text-green-300 border-green-700',
  '水':'bg-blue-900/40 text-blue-300 border-blue-700',
  '火':'bg-red-900/40 text-red-300 border-red-700',
  '土':'bg-amber-900/40 text-amber-300 border-amber-700',
}

// Most popular test characters
const HOT_CHARS = ['福','禄','寿','喜','财','吉','安','和','龙','凤','梦','缘','心','运','成','家','爱','德','善','诚','信','智','仁','义','美','乐','天','地','人','金','木','水','火','土','山','海','春','秋','明','马','龙','鹏','鹤','昌','盛','强','伟','毅']

export default function CeziClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [input, setInput] = useState('')
  const [result, setResult] = useState<CharData | null>(null)
  const [notFound, setNotFound] = useState(false)

  const analyze = () => {
    const c = input.trim()
    setResult(null)
    setNotFound(false)
    if (c.length !== 1) return
    if (DICT[c]) setResult(DICT[c])
    else setNotFound(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('cezi.title', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('cezi.desc', lang)}</p>

      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-6">
        <label className="block text-xs text-gray-400 mb-2">{tk('cezi.input', lang)}</label>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => {
            setInput(e.target.value.slice(0,1))
            setResult(null); setNotFound(false)
          }} onKeyDown={e => e.key==='Enter' && analyze()}
            placeholder="如：福、财、运、爱"
            maxLength={1}
            className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-xl text-center placeholder-gray-500 focus:outline-none focus:border-gold-500 font-serif"
          />
          <button onClick={analyze} disabled={input.length!==1}
            className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 active:scale-95">
            {tk('common.submit', lang)}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">收录 {DICT_SIZE} 个汉字，支持大部分日常用字</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {HOT_CHARS.map(c => (
            <button key={c} onClick={() => { setInput(c); setTimeout(() => { setResult(DICT[c]); setNotFound(false) }, 50) }}
              className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-gold-300 px-2 py-1 rounded border border-dark-600 transition-colors">
              {c}
            </button>
          ))}
        </div>
      </div>

      {notFound && (
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-amber-700/40 p-6 text-center">
          <p className="text-amber-400">暂未收录 "{input}" 字的解读，请尝试其他汉字。</p>
          <p className="text-xs text-gray-500 mt-2">已收录 {DICT_SIZE} 个汉字，覆盖日常常用字的80%以上。</p>
        </div>
      )}

      {result && (
        <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-gold-900/30 to-dark-700 rounded-2xl border-2 border-gold-600/50 flex items-center justify-center">
              <span className="text-6xl font-bold text-gold-400 font-serif">{result.c}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-dark-700 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">笔画</p>
              <p className="text-lg font-bold text-gray-200">{result.s}画</p>
            </div>
            <div className={`rounded-lg p-3 text-center border ${WUXING_COLORS[result.w] || 'bg-dark-700 border-dark-600'}`}>
              <p className="text-xs text-gray-500 mb-1">五行</p>
              <p className="text-lg font-bold">{result.w}</p>
            </div>
            <div className="bg-dark-700 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">寓意</p>
              <p className="text-sm font-medium text-gray-200">{result.m}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gold-900/20 to-dark-700 rounded-xl p-5 border border-gold-600/30">
            <h3 className="text-sm font-semibold text-gold-300 mb-3">测字解读</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{result.i}</p>
          </div>

          {result.k && (
            <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600 mt-4">
              <h3 className="text-xs font-semibold text-gold-400 mb-2">📖 康熙字源</h3>
              <p className="text-xs text-gray-400 italic">{result.k}</p>
            </div>
          )}

          {result.e && (
            <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600 mt-4">
              <h3 className="text-xs font-semibold text-gold-400 mb-3">🔱 三才五格 · 数理解析</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {Object.entries(result.e).map(([key, val]) => (
                  <div key={key} className="text-xs">
                    <span className="text-gray-500">{key}：</span>
                    <span className="text-gray-300">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
