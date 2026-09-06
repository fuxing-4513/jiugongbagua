'use client'

import { useT, useTArray } from '@/lib/i18n'

interface Scholar {
  period: string
  school: string
  name: string
  work: string
  desc: string
}

// 朝代权重（用于谱系排序）
const DYNASTY_ORDER = ['汉', '魏晋', '晋', '南北朝', '隋', '唐', '五代', '宋', '元', '明', '清', '民国']
function dynastyOf(period: string): string {
  for (const d of DYNASTY_ORDER) if (period.includes(d)) return d
  return '宋'
}

export default function HeritageSection() {
  const getT = useT()
  const getTArray = useTArray()

  const scholars = getTArray('heritage.scholars') as Scholar[]
  // 朝代分组排序（汉 → 民国）
  const groups: { dynasty: string; items: Scholar[] }[] = []
  const sorted = [...scholars].sort((a, b) => DYNASTY_ORDER.indexOf(dynastyOf(a.period)) - DYNASTY_ORDER.indexOf(dynastyOf(b.period)))
  for (const s of sorted) {
    const d = dynastyOf(s.period)
    const g = groups.find(x => x.dynasty === d)
    if (g) g.items.push(s)
    else groups.push({ dynasty: d, items: [s] })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-[26px] font-bold font-serif text-gray-900 dark:text-gray-50 mb-3 text-center tracking-wide">
        {getT('heritage.sectionTitle')}
      </h2>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-12 max-w-2xl mx-auto leading-relaxed">
        {getT('heritage.sectionDesc')}
      </p>

      {/* 谱系时间轴（纵向——朝代节点 → 人物 → 今日九宫） */}
      <div className="relative pl-8 md:pl-12">
        {/* 主线 */}
        <div className="absolute left-[10px] md:left-[14px] top-1 bottom-1 w-px bg-gradient-to-b from-gold-400/50 via-gold-500/30 to-gold-400/60" />
        {groups.map((g, gi) => (
          <div key={g.dynasty} className="relative mb-10">
            {/* 朝代节点 */}
            <div className="absolute -left-8 md:-left-12 top-0 w-5 h-5 md:w-6 md:h-6 -translate-x-1/2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-gold-500 bg-white dark:bg-[#171614]" />
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3 mb-3">
              <span className="text-lg font-serif font-bold text-gold-600 dark:text-gold-400">{g.dynasty}</span>
              <span className="text-[11px] text-gray-400">{g.items.length} 位 · 承先启后</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {g.items.map((s, i) => (
                <div key={i} className="rounded-xl border border-gray-200/80 dark:border-gray-700/50 bg-white/70 dark:bg-[#131210]/70 p-4 hover:border-gold-400/40 transition-colors">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-base font-bold font-serif text-gray-900 dark:text-gray-100">{s.name}</h3>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400 shrink-0">{s.school}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 italic mb-1.5">{s.work}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 终端：今日 → 九宫 AI */}
        <div className="relative">
          <div className="absolute -left-8 md:-left-12 top-1 w-5 h-5 md:w-6 md:h-6 -translate-x-1/2 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full border border-gold-400 bg-gradient-to-br from-gold-300 to-gold-600 shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
          </div>
          <div className="rounded-xl border border-gold-300/50 dark:border-gold-500/25 bg-gradient-to-r from-[#fdf9ee]/80 to-transparent dark:from-[#1c1a13] p-4">
            <p className="text-[10px] text-gold-500/80 mb-0.5">今日 · 数字时代</p>
            <p className="text-base font-serif font-bold text-gray-900 dark:text-gray-50">
              九宫 AI <span className="text-xs font-normal text-gray-400">——两千年术数思想，汇入时空推演引擎</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">古籍原典 · 确定性排盘算法 · AI 白话解读——让先人的观时之道，照见今天的每一次抉择。</p>
          </div>
        </div>
      </div>

      {getT('heritage.copyrightNote') !== 'heritage.copyrightNote' && (
        <p className="text-center text-[10px] text-gray-500 mt-8">{getT('heritage.copyrightNote')}</p>
      )}
    </div>
  )
}
