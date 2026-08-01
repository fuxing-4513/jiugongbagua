'use client'

import { useRef, useEffect, useState } from 'react'

interface DayunYear {
  year: number
  gz: string
  age: number
}

interface DayunPeriod {
  gz: string
  age: number
  years: DayunYear[]
}

interface Props {
  dayun: DayunPeriod[]
  currentAge?: number
  birthYear?: number
}

// 纳音五行色
const nyColors: Record<string, string> = {
  '金': 'border-gold-500/60 bg-gold-500/10',
  '木': 'border-gold-500/60 bg-gold-500/10',
  '水': 'border-gold-500/60 bg-gold-500/10',
  '火': 'border-gold-500/60 bg-gold-500/10',
  '土': 'border-gold-500/60 bg-gold-500/10',
}

// 干支→纳音五行
function gz2wx(gz: string): string {
  const map: Record<string, string> = {
    '甲子':'金','乙丑':'金','丙寅':'火','丁卯':'火','戊辰':'木','己巳':'木',
    '庚午':'土','辛未':'土','壬申':'金','癸酉':'金','甲戌':'火','乙亥':'火',
    '丙子':'水','丁丑':'水','戊寅':'土','己卯':'土','庚辰':'金','辛巳':'金',
    '壬午':'木','癸未':'木','甲申':'水','乙酉':'水','丙戌':'土','丁亥':'土',
    '戊子':'火','己丑':'火','庚寅':'木','辛卯':'木','壬辰':'水','癸巳':'水',
    '甲午':'金','乙未':'金','丙申':'火','丁酉':'火','戊戌':'木','己亥':'木',
    '庚子':'土','辛丑':'土','壬寅':'金','癸卯':'金','甲辰':'火','乙巳':'火',
    '丙午':'水','丁未':'水','戊申':'土','己酉':'土','庚戌':'金','辛亥':'金',
    '壬子':'木','癸丑':'木','甲寅':'水','乙卯':'水','丙辰':'土','丁巳':'土',
    '戊午':'火','己未':'火','庚申':'木','辛酉':'木','壬戌':'水','癸亥':'水',
  }
  return map[gz] || '土'
}

export default function DayunChart({ dayun, currentAge }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [expandedDY, setExpandedDY] = useState<number | null>(null)

  // 找到当前所处大运
  const currentDYIndex = dayun.findIndex(d => {
    if (!currentAge) return false
    return currentAge >= d.age && currentAge < d.age + 10
  })

  // 自动滚动到当前大运
  useEffect(() => {
    if (scrollRef.current && currentDYIndex >= 0 && currentDYIndex < scrollRef.current.children.length) {
      const el = scrollRef.current.children[currentDYIndex] as HTMLElement
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [currentDYIndex])

  if (!dayun.length) return null

  return (
    <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-1">
        📊 大运流年
        {currentAge && <span className="text-xs text-gray-500 font-normal ml-2">当前 {currentAge} 岁</span>}
      </h3>
      <p className="text-[10px] text-gray-600 mb-4">横向滚动查看各十年大运 · 点击展开流年详情</p>

      {/* 横向时间轴 */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin"
        style={{ scrollbarWidth: 'thin' }}
      >
        {dayun.map((dy, dIdx) => {
          const wx = gz2wx(dy.gz)
          const isCurrent = dIdx === currentDYIndex
          const isExpanded = expandedDY === dIdx

          return (
            <div key={dIdx} className="flex-shrink-0">
              {/* 大运卡片 */}
              <button
                onClick={() => setExpandedDY(isExpanded ? null : dIdx)}
                className={`w-[110px] text-center rounded-xl border-2 p-3 transition-all ${
                  isCurrent
                    ? 'border-gold-500 bg-gold-500/15 shadow-lg shadow-gold-500/20 ring-1 ring-gold-500/30'
                    : `${nyColors[wx] || 'border-dark-600 bg-dark-700/50'} hover:border-gold-500/50`
                }`}
              >
                <div className="text-lg font-serif font-bold text-gold-500 mb-1">{dy.gz}</div>
                <div className="text-[10px] text-gray-500">大运</div>
                <div className={`text-xs font-semibold mt-1 ${isCurrent ? 'text-gold-600' : 'text-gray-400'}`}>
                  {dy.age}~{dy.age + 9}岁
                </div>
                {isCurrent && (
                  <div className="mt-1.5">
                    <span className="text-[9px] bg-gold-500/20 text-gold-600 px-1.5 py-0.5 rounded-full">
                      ● 当前
                    </span>
                  </div>
                )}
              </button>

              {/* 流年展开 */}
              {isExpanded && dy.years && (
                <div className="mt-2 bg-dark-700/50 rounded-lg border border-dark-600 p-2 w-[280px]">
                  <p className="text-[10px] text-gray-500 mb-2">
                    {dy.gz}运 · {dy.age}~{dy.age + 9}岁 · 流年
                  </p>
                  <div className="grid grid-cols-5 gap-1">
                    {dy.years.map((y, yIdx) => {
                      const isCurYear = currentAge === y.age
                      return (
                        <div
                          key={yIdx}
                          className={`text-center p-1 rounded border text-[10px] ${
                            isCurYear
                              ? 'border-gold-500 bg-gold-500/15 text-gold-600 font-semibold'
                              : 'border-dark-600 bg-dark-800/50 text-gray-400'
                          }`}
                        >
                          <div className="text-[9px] text-gray-500">{y.year}</div>
                          <div className="font-serif">{y.gz}</div>
                          <div className="text-[9px] text-gray-600">{y.age}岁</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-dark-600">
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          <div className="w-3 h-3 rounded border-2 border-gold-500 bg-gold-500/15" />
          当前大运
        </div>
        {['金','木','水','火','土'].map(w => (
          <div key={w} className="flex items-center gap-1 text-[10px] text-gray-500">
            <div className={`w-3 h-3 rounded border ${nyColors[w]}`} />
            {w}
          </div>
        ))}
      </div>
    </div>
  )
}
