'use client'

import { useState } from 'react'
import { computeNumerology, NUM_READ } from '@/lib/numerology'
import { NUM_DEEP } from '@/data/numerology-deep'
import Breadcrumb from '@/components/Breadcrumb'

export default function NumerologyClient() {
  const [name, setName] = useState('')
  const [date, setDate] = useState('1990-01-15')
  const [result, setResult] = useState<ReturnType<typeof computeNumerology> | null>(null)
  const [err, setErr] = useState('')

  const run = () => {
    if (!name.trim()) { setErr('请输入姓名'); return }
    if (!date) { setErr('请选择出生日期'); return }
    setErr('')
    try { setResult(computeNumerology(name.trim(), date)) }
    catch { setErr('计算失败——请检查姓名是否为中文或拼音') }
  }

  const cards = result ? [
    { label: '生命路径数', num: result.lifePath, sub: '你的人生主线与天赋使命', icon: '🌱' },
    { label: '表达数', num: result.expression, sub: '你的才能与外在表达方式', icon: '🎙️' },
    { label: '灵魂冲动数', num: result.soulUrge, sub: '内心深处的渴望与动力', icon: '💗' },
    { label: '人格数', num: result.personality, sub: '你给人的第一印象', icon: '🎭' },
  ] : []

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumb items={[{ label: '全部工具', href: '/tools' }, { label: '生命灵数' }]} />
      <div className="rounded-2xl border border-violet-200/60 dark:border-violet-500/25 bg-white/85 dark:bg-[#171614]/85 p-5 md:p-6 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">🔢 生命灵数</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          毕达哥拉斯数字体系：姓名与出生日期都藏着频率。本工具帮你译出四个核心数字——认识自己的天赋剧本，参考而不迷信。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <label className="text-xs text-gray-500 dark:text-gray-400">姓名（中文/拼音）
            <input value={name} onChange={e => setName(e.target.value)} placeholder="如：李小明 / Li Xiaoming"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100" />
          </label>
          <label className="text-xs text-gray-500 dark:text-gray-400">出生日期
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100" />
          </label>
          <button onClick={run} className="py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 shadow-lg shadow-violet-500/20">
            🔢 测算灵数
          </button>
        </div>
        {err && <p className="text-xs text-red-500 mt-3">{err}</p>}
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {cards.map(c => {
              const read = NUM_READ[c.num]
              return (
                <div key={c.label} className="rounded-2xl border border-violet-200/60 dark:border-violet-500/25 bg-white/85 dark:bg-[#171614]/85 p-4 text-center">
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">{c.icon} {c.label}</p>
                  <p className="text-3xl font-bold text-violet-600 dark:text-violet-300">{c.num}</p>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mt-1">{read?.name || '—'}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{c.sub}</p>
                </div>
              )
            })}
          </div>

          {/* 生命路径详解 */}
          {result.lifePath > 0 && NUM_READ[result.lifePath] && (
            <div className="rounded-2xl border border-violet-200/60 dark:border-violet-500/25 bg-white/85 dark:bg-[#171614]/85 p-5 md:p-6 mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 mb-1">
                🌱 生命路径 {result.lifePath} · {NUM_READ[result.lifePath].name}
              </h3>
              <p className="text-[11px] text-violet-500 dark:text-violet-300 mb-3">{NUM_READ[result.lifePath].tag}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{NUM_READ[result.lifePath].read}</p>
              {NUM_DEEP[result.lifePath] && (
                <div className="space-y-3 mb-4">
                  <div className="rounded-xl border border-violet-200/50 dark:border-violet-500/15 p-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">🔍 深度解析（毕达哥拉斯原型体系）</p>
                    <div className="space-y-2">
                      {NUM_DEEP[result.lifePath].core.map((c, i) => <p key={i} className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{c}</p>)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-4">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">🧗 人生课题</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{NUM_DEEP[result.lifePath].challenge}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-violet-50/60 dark:bg-violet-500/10 p-3.5">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">💞 感情模式</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{NUM_READ[result.lifePath].love}</p>
                </div>
                <div className="rounded-xl bg-indigo-50/60 dark:bg-indigo-500/10 p-3.5">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">💼 事业方向</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{NUM_READ[result.lifePath].career}</p>
                </div>
              </div>
            </div>
          )}

          {/* 其他数字简读 */}
          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/50 bg-white/85 dark:bg-[#171614]/85 p-5">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">📖 四个数字怎么理解</h3>
            <div className="space-y-2.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {cards.filter(c => c.num !== result.lifePath).map(c => (
                <p key={c.label}><span className="font-semibold text-gray-700 dark:text-gray-200">{c.label} {c.num}（{NUM_READ[c.num]?.name}）</span>：{NUM_READ[c.num]?.tag}</p>
              ))}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 pt-1">灵数是自我认知的参考框架，不是命运的判决书——数字描述倾向，选择决定人生。</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
