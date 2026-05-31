'use client'

import { useState, useMemo, useCallback } from 'react'
import { useLocale } from '@/lib/i18n'
import { DICT } from './ceziDict'
import { ZHUGE_384, type ZhugeQianData } from './zhuge384'

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
  k?: string; p?: string; y?: string; r?: string; e?: SancaiExplanation;
}

const DICT_SIZE = Object.keys(DICT).length

const WUXING_COLORS: Record<string, string> = {
  '金':'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  '木':'bg-green-900/40 text-green-300 border-green-700',
  '水':'bg-blue-900/40 text-blue-300 border-blue-700',
  '火':'bg-red-900/40 text-red-300 border-red-700',
  '土':'bg-amber-900/40 text-amber-300 border-amber-700',
}

const LEVEL_COLORS: Record<string, string> = {
  '上上':'bg-green-900/50 text-green-300 border-green-700',
  '上吉':'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  '中吉':'bg-blue-900/50 text-blue-300 border-blue-700',
  '中平':'bg-amber-900/50 text-amber-300 border-amber-700',
  '中下':'bg-orange-900/50 text-orange-300 border-orange-700',
  '下下':'bg-red-900/50 text-red-300 border-red-700',
}

const HOT_CHARS = ['福','禄','寿','喜','财','吉','安','和','龙','凤','梦','缘','心','运','成','家','爱','德','善','诚','信','智','仁','义','美','乐','天','地','人','金','木','水','火','土','山','海','春','秋','明','马','龙','鹏','鹤','昌','盛','强','伟','毅']

/* ===== 诸葛测字核心算法 ===== */
// 诸葛神数：以三字的笔画数之和 ÷ 384 余数定签
function zhugeTest(char1: string, char2: string, char3: string): { data: ZhugeQianData; strokes: number[]; guaciId: number } | null {
  const getStroke = (ch: string): number => {
    const entry = DICT[ch]
    if (entry) return entry.s
    // Fallback: estimate from character code
    const code = ch.charCodeAt(0)
    if (code >= 0x4E00 && code <= 0x9FFF) return Math.floor((code - 0x4E00) / 30) + 3
    return 5
  }

  const s1 = getStroke(char1)
  const s2 = getStroke(char2)
  const s3 = getStroke(char3)
  const total = s1 + s2 + s3
  // 384 签，余数 1-384（余0 = 384）
  const idx = total % 384 === 0 ? 384 : total % 384
  const qian = ZHUGE_384.find(q => q.id === idx)
  if (!qian) return null
  return { data: qian, strokes: [s1, s2, s3], guaciId: idx }
}

export default function CeziClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  // Tab state: 'single' | 'zhuge'
  const [tab, setTab] = useState<'single'|'zhuge'>('single')

  // Single char state
  const [input, setInput] = useState('')
  const [result, setResult] = useState<CharData | null>(null)
  const [notFound, setNotFound] = useState(false)

  // Zhuge state
  const [zgChars, setZgChars] = useState(['', '', ''])
  const [zgResult, setZgResult] = useState<{ data: ZhugeQianData; strokes: number[]; guaciId: number } | null>(null)

  const analyze = () => {
    const c = input.trim()
    setResult(null)
    setNotFound(false)
    if (c.length !== 1) return
    if (DICT[c]) setResult(DICT[c])
    else setNotFound(true)
  }

  const handleZgInput = (idx: number, val: string) => {
    const ch = val.slice(-1)
    const newChars = [...zgChars]
    newChars[idx] = ch
    setZgChars(newChars)
    setZgResult(null)
  }

  const analyzeZhuge = () => {
    if (zgChars.some(c => c.length !== 1)) return
    const r = zhugeTest(zgChars[0], zgChars[1], zgChars[2])
    setZgResult(r)
  }

  const quickHotChar = (c: string) => {
    setInput(c)
    setResult(null)
    setNotFound(false)
    setTimeout(() => {
      if (DICT[c]) { setResult(DICT[c]); setNotFound(false) }
      else setNotFound(true)
    }, 50)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{tk('cezi.title', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('cezi.desc', lang)}</p>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-6 bg-dark-800/80 rounded-xl p-1 border border-dark-600 max-w-md mx-auto">
        <button onClick={() => { setTab('single'); setZgResult(null) }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${tab === 'single' 
            ? 'bg-gold-600 text-dark-900 shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>
          单字测字
        </button>
        <button onClick={() => { setTab('zhuge'); setResult(null) }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${tab === 'zhuge'
            ? 'bg-gold-600 text-dark-900 shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>
          诸葛测字
        </button>
      </div>

      {/* ===== Single Char Tab ===== */}
      {tab === 'single' && (
        <>
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
              <button onClick={analyze} disabled={input.length !== 1}
                className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 active:scale-95">
                {tk('common.submit', lang)}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">收录 {DICT_SIZE} 个汉字，含生僻字康熙字源</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {HOT_CHARS.map(c => (
                <button key={c} onClick={() => quickHotChar(c)}
                  className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-gold-300 px-2 py-1 rounded border border-dark-600 transition-colors">
                  {c}
                </button>
              ))}
            </div>
          </div>

          {notFound && (
            <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-amber-700/40 p-6 text-center">
              <p className="text-amber-400">暂未收录 &ldquo;{input}&rdquo; 字的解读，请尝试其他汉字。</p>
              <p className="text-xs text-gray-500 mt-2">已收录 {DICT_SIZE} 个汉字，覆盖日常常用字的90%以上。</p>
            </div>
          )}

          {result && <SingleCharResult data={result} />}
        </>
      )}

      {/* ===== Zhuge Tab ===== */}
      {tab === 'zhuge' && (
        <>
          {/* Description */}
          <div className="bg-gradient-to-r from-gold-900/20 to-dark-800 rounded-xl border border-gold-600/30 p-5 mb-6">
            <h3 className="text-sm font-semibold text-gold-300 mb-2">🔮 诸葛神数测字</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              输入三个汉字，系统以三字笔画总和查诸葛神数384签，为你解读吉凶运势。
              此法源自三国时期诸葛亮（诸葛武侯）所创，融合易经八卦与数理玄机。
            </p>
          </div>

          <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-6">
            <label className="block text-xs text-gray-400 mb-4 text-center">请输入三个汉字（每字一格）</label>
            <div className="flex justify-center gap-4 mb-4">
              {[0,1,2].map(i => (
                <input key={i} type="text" value={zgChars[i]} onChange={e => handleZgInput(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') analyzeZhuge() }}
                  maxLength={1} placeholder={`字${i+1}`}
                  className="w-20 h-20 bg-dark-700 border-2 border-dark-600 rounded-xl text-3xl font-bold text-center text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold-500 font-serif transition-colors"
                />
              ))}
            </div>
            <div className="flex justify-center">
              <button onClick={analyzeZhuge} disabled={zgChars.some(c => c.length !== 1)}
                className="bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-dark-900 font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg">
                诸葛起卦
              </button>
            </div>
            {zgChars.filter(c => c.length === 1).length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  已输入：{zgChars.filter(c => c).join('、')}
                  {zgChars.filter(c => c).length === 3 && (
                    <span className="text-gold-400 ml-2">✓ 三字已全</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {zgResult && <ZhugeResult data={zgResult.data} strokes={zgResult.strokes} id={zgResult.guaciId} chars={zgChars} />}
        </>
      )}
    </div>
  )
}

/* ===== 单字结果组件 ===== */
function SingleCharResult({ data: result }: { data: CharData }) {
  return (
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

      {/* 康熙字典字段 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {result.y && (
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">拼音</p>
            <p className="text-xs text-gray-200 font-mono">{result.y}</p>
          </div>
        )}
        {result.r && (
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">部首</p>
            <p className="text-xs text-gray-200">{result.r}</p>
          </div>
        )}
        {result.p && (
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">繁体</p>
            <p className="text-xs text-gray-200">{result.p}</p>
          </div>
        )}
        {result.s && (
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">笔画</p>
            <p className="text-xs text-gray-200">{result.s}画</p>
          </div>
        )}
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
  )
}

/* ===== 诸葛测字结果组件 ===== */
function ZhugeResult({ data, strokes, id, chars }: { data: ZhugeQianData; strokes: number[]; id: number; chars: string[] }) {
  const total = strokes.reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      {/* 签号与总笔画 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">所测三字</p>
          <p className="text-xl font-serif text-gold-400">{chars.join(' · ')}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">笔画</p>
          <p className="text-sm font-mono text-gray-300">{strokes[0]}+{strokes[1]}+{strokes[2]}={total}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">诸葛神数</p>
          <p className="text-2xl font-bold text-amber-400">第{id}签</p>
        </div>
      </div>

      {/* 签文 */}
      <div className={`rounded-xl border p-5 ${LEVEL_COLORS[data.level] || 'bg-dark-700 border-dark-600'}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[data.level] || 'bg-dark-600 text-gray-400'}`}>
            {data.level}
          </span>
          <h3 className="text-base font-semibold text-gray-100">{data.title}</h3>
        </div>
        <div className="bg-dark-900/40 rounded-lg p-4 mb-3 font-serif">
          <p className="text-sm text-gold-300 italic leading-relaxed">{data.poem}</p>
        </div>
      </div>

      {/* 解签 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h4 className="text-xs font-semibold text-gold-400 mb-2">🔍 签文解读</h4>
        <p className="text-sm text-gray-300 leading-relaxed">{data.explanation}</p>
      </div>

      <div className="bg-gradient-to-r from-amber-900/20 to-dark-800 rounded-xl border border-amber-700/30 p-5">
        <h4 className="text-xs font-semibold text-amber-400 mb-2">💡 提示</h4>
        <p className="text-sm text-amber-300/80">{data.hint}</p>
      </div>

      {/* 笔画解析 */}
      <details className="bg-dark-700/50 rounded-xl border border-dark-600 p-4 group">
        <summary className="text-xs font-semibold text-gray-400 cursor-pointer list-none flex items-center gap-2 group-open:text-gold-400">
          <span className="text-xs">📐</span> 笔画数理解析
          <span className="text-[10px] text-gray-600 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-3 space-y-2 text-xs text-gray-400">
          <p>第一字 <span className="text-gray-200 font-mono">{chars[0]}</span>：{strokes[0]}画</p>
          <p>第二字 <span className="text-gray-200 font-mono">{chars[1]}</span>：{strokes[1]}画</p>
          <p>第三字 <span className="text-gray-200 font-mono">{chars[2]}</span>：{strokes[2]}画</p>
          <div className="pt-2 border-t border-dark-600">
            <p>三字笔画总和：<span className="text-gold-400 text-sm font-bold">{total}</span></p>
            <p>余数 {total} ÷ 384 = {total % 384 || 384} → 第{id}签</p>
          </div>
        </div>
      </details>
    </div>
  )
}
