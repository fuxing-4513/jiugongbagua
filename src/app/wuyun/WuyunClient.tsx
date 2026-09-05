'use client'

// 五运六气排盘：输入年份 → 中运/司天/在泉/主客气 + 健康白话
import { useState } from 'react'
import { computeWuyun } from '@/lib/wuyun-engine'
import Breadcrumb from '@/components/Breadcrumb'

const ELEM_COLOR: Record<string, string> = {
  '木': 'text-emerald-600 dark:text-emerald-300',
  '火': 'text-red-500 dark:text-red-300',
  '土': 'text-amber-600 dark:text-amber-300',
  '金': 'text-gray-500 dark:text-gray-300',
  '水': 'text-blue-600 dark:text-blue-300',
}

export default function WuyunClient() {
  const now = new Date().getFullYear()
  const [year, setYear] = useState(now)
  const [result, setResult] = useState<ReturnType<typeof computeWuyun> | null>(null)

  const run = () => {
    const y = Math.max(1900, Math.min(2100, Number(year) || now))
    setYear(y)
    setResult(computeWuyun(y))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumb items={[{ label: '全部工具', href: '/tools' }, { label: '五运六气' }]} />
      <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-500/25 bg-white/85 dark:bg-[#13161c]/85 p-5 md:p-6 mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">☯️ 五运六气</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          依《黄帝内经·素问》运气七篇：天干化五运定中运，地支化六气定司天在泉——推全年气候大势与养生要点。传统时间医学框架，供生活参考。
        </p>
        <div className="flex gap-3 items-end flex-wrap">
          <label className="text-xs text-gray-500 dark:text-gray-400">年份
            <input type="number" value={year} min={1900} max={2100} onChange={e => setYear(+e.target.value)}
              className="mt-1 w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100" />
          </label>
          <button onClick={run} className="py-2 px-5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 shadow-lg shadow-emerald-500/20">
            ☯️ 推演运气
          </button>
          {result && <p className="text-xs text-gray-400">当前显示 {result.year} 年（{result.ganzhi}年）</p>}
        </div>
      </div>

      {result && (
        <>
          {/* 三柱核心 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-500/25 bg-white/85 dark:bg-[#13161c]/85 p-4">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">🔄 中运（大运）· {result.tianGan}年</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                <span className={ELEM_COLOR[result.zhongYun.element]}>{result.zhongYun.element}</span>运{result.zhongYun.yinyang === '阳' ? '太过' : '不及'}
              </p>
              <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{result.zhongYun.desc}</p>
            </div>
            <div className="rounded-2xl border border-sky-200/60 dark:border-sky-500/25 bg-white/85 dark:bg-[#13161c]/85 p-4">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">☁️ 司天 · {result.diZhi}年</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{result.siTian.qi}</p>
              <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">主管上半年气候</p>
            </div>
            <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-500/25 bg-white/85 dark:bg-[#13161c]/85 p-4">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">🌊 在泉 · {result.diZhi}年</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{result.zaiQuan.qi}</p>
              <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">主管下半年气候</p>
            </div>
          </div>

          {/* 全年气候 */}
          <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-500/25 bg-white/85 dark:bg-[#13161c]/85 p-5 mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">🌏 {result.year} 年气候大势</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {result.year} 年为{result.ganzhi}年（天干{result.tianGan}、地支{result.diZhi}）。
              中运为<strong className={ELEM_COLOR[result.zhongYun.element]}>{result.zhongYun.element}运{result.zhongYun.yinyang === '阳' ? '太过' : '不及'}</strong>，
              司天<strong>{result.siTian.qi}</strong>管上半年、在泉<strong>{result.zaiQuan.qi}</strong>管下半年。
              {result.yunDesc}
            </p>
          </div>

          {/* 六步气 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/50 bg-white/85 dark:bg-[#13161c]/85 p-5">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">📆 主气六步（固定）</h3>
              <div className="space-y-2">
                {result.zhuQi.map(q => (
                  <div key={q.step} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                    <span className="text-gray-400 w-6">{q.step}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-200 flex-1">{q.qi}</span>
                    <span className="text-gray-400">{q.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/50 bg-white/85 dark:bg-[#13161c]/85 p-5">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">🔄 客气六步（{result.year} 年）</h3>
              <div className="space-y-2">
                {result.keQi.map(q => {
                  const isSiTian = q.qi === result.siTian.qi
                  const isZaiQuan = q.qi === result.zaiQuan.qi
                  return (
                    <div key={q.step} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                      <span className="text-gray-400 w-6">{q.step}</span>
                      <span className={`font-medium flex-1 ${isSiTian ? 'text-sky-600 dark:text-sky-300' : isZaiQuan ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>{q.qi}</span>
                      {isSiTian && <span className="text-[9px] bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 px-1.5 py-0.5 rounded">司天</span>}
                      {isZaiQuan && <span className="text-[9px] bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded">在泉</span>}
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">客气随司天而变：三之气为司天（上半年主政），六之气为在泉（下半年主政）。</p>
            </div>
          </div>

          {/* 健康提示 */}
          <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-500/25 bg-white/85 dark:bg-[#13161c]/85 p-5">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">💚 {result.year} 年养生要点</h3>
            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {result.healthTips.map((t, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">·</span>{t}</li>)}
            </ul>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">五运六气是古人对气候规律的宏观归纳，个体体质与当地气候差异更大——本文仅供健康生活参考，不替代医嘱。</p>
          </div>
        </>
      )}
    </div>
  )
}
