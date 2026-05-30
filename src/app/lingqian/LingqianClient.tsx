'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ALL_CATEGORIES, LEVEL_COLORS } from './lingqian-data'
import type { LingqianCategory, LingqianItem } from './types'

// ======== 签筒摇晃动画 CSS ========
const SHAKE_KEYFRAMES = `
@keyframes qian-shake {
  0% { transform: rotate(-3deg) translateX(0); }
  10% { transform: rotate(4deg) translateX(-2px); }
  20% { transform: rotate(-5deg) translateX(3px); }
  30% { transform: rotate(6deg) translateX(-4px); }
  40% { transform: rotate(-4deg) translateX(5px); }
  50% { transform: rotate(7deg) translateX(-3px); }
  60% { transform: rotate(-3deg) translateX(2px); }
  70% { transform: rotate(5deg) translateX(-1px); }
  80% { transform: rotate(-2deg) translateX(0); }
  90% { transform: rotate(1deg) translateX(0); }
  100% { transform: rotate(0deg) translateX(0); }
}
@keyframes qian-fly {
  0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
  30% { transform: translateY(-120px) rotate(-20deg) scale(1.1); opacity: 1; }
  60% { transform: translateY(-40px) rotate(10deg) scale(0.95); opacity: 0.9; }
  80% { transform: translateY(-80px) rotate(-5deg) scale(1.05); opacity: 0.95; }
  100% { transform: translateY(-60px) rotate(0deg) scale(1); opacity: 1; }
}
@keyframes qian-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(251,191,36,0.3); }
  50% { box-shadow: 0 0 20px rgba(251,191,36,0.6), 0 0 40px rgba(251,191,36,0.3); }
}
@keyframes stick-pop {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.15) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes incense-spiral {
  0% { opacity: 0.6; transform: translateY(0) translateX(0) scale(1); }
  25% { opacity: 0.3; transform: translateY(-15px) translateX(8px) scale(0.9); }
  50% { opacity: 0.5; transform: translateY(-30px) translateX(-5px) scale(0.8); }
  75% { opacity: 0.2; transform: translateY(-45px) translateX(10px) scale(0.7); }
  100% { opacity: 0; transform: translateY(-60px) translateX(0) scale(0.5); }
}
`

// ======== 签筒 SVG 组件 ========
function QianTong({ shaking, showResult }: { shaking: boolean; showResult: boolean }) {
  return (
    <svg viewBox="0 0 200 280" className="w-48 h-64 sm:w-56 sm:h-72 mx-auto drop-shadow-xl"
      style={{ animation: shaking ? 'qian-shake 0.4s ease-in-out infinite' : 'none' }}>
      {/* 签筒身体 - 竹筒纹理 */}
      <defs>
        <linearGradient id="bamboo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="20%" stopColor="#d97706" />
          <stop offset="40%" stopColor="#b45309" />
          <stop offset="60%" stopColor="#d97706" />
          <stop offset="80%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="bambooInner" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="50%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <filter id="shadow2">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* 签筒底部 */}
      <ellipse cx="100" cy="250" rx="65" ry="12" fill="#78350f" />
      {/* 签筒身体 */}
      <path d="M35,90 L25,245 Q25,255 35,255 L165,255 Q175,255 175,245 L165,90 Z" fill="url(#bamboo)" filter="url(#shadow2)" />
      {/* 签筒内胆 */}
      <path d="M40,95 L30,240 Q30,248 40,248 L160,248 Q170,248 170,240 L160,95 Z" fill="url(#bambooInner)" />
      {/* 竹节纹理 */}
      <line x1="38" y1="140" x2="162" y2="140" stroke="#78350f" strokeWidth="1.5" opacity="0.4" />
      <line x1="36" y1="180" x2="164" y2="180" stroke="#78350f" strokeWidth="1.5" opacity="0.4" />
      <line x1="34" y1="220" x2="166" y2="220" stroke="#78350f" strokeWidth="1.5" opacity="0.4" />
      {/* 筒口金边 */}
      <ellipse cx="100" cy="90" rx="65" ry="15" fill="#f59e0b" />
      <ellipse cx="100" cy="92" rx="62" ry="13" fill="#d97706" />
      <ellipse cx="100" cy="95" rx="58" ry="11" fill="#78350f" />
      {/* 签筒中的签 */}
      {!showResult && Array.from({length: 12}).map((_, i) => (
        <line key={i} x1={75 + Math.sin(i*0.8)*25} y1={95} x2={70 + Math.sin(i*0.8)*30} y2={35 - i*1.5}
          stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" opacity={0.5 + Math.random()*0.3}
          style={{ animation: shaking ? `stick-pop 0.3s ease-out ${i*0.05}s` : 'none' }}
        />
      ))}
      {/* 跳出签 */}
      {showResult && (
        <g style={{ animation: 'qian-fly 0.8s ease-out forwards' }}>
          <text x="100" y="30" textAnchor="middle" fill="#fcd34d" fontSize="12" fontWeight="bold"
            style={{ animation: 'qian-glow 1.5s ease-in-out infinite' }}>
            ──
          </text>
          <text x="100" y="10" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">灵签</text>
        </g>
      )}
      {/* 装饰绳结 */}
      <circle cx="100" cy="253" r="4" fill="#dc2626" />
      <circle cx="100" cy="253" r="2" fill="#ef4444" />
      {/* 香火烟雾 */}
      {shaking && Array.from({length: 3}).map((_, i) => (
        <g key={`smoke-${i}`}
          style={{ animation: `incense-spiral 2s ease-out ${i*0.4}s infinite`, transformOrigin: `${70+i*30}px 260px` }}>
          <circle cx={70+i*30} cy="260" r="3" fill="#fef3c7" opacity="0.30" />
        </g>
      ))}
    </svg>
  )
}

// ======== 签文卡片 ========
function QianCard({ item, visible }: { item: LingqianItem; visible: boolean }) {
  if (!visible || !item) return null
  const lc = LEVEL_COLORS[item.level] || 'bg-dark-800/80 border-dark-600'
  return (
    <div className="space-y-4 animate-[stick-pop_0.5s_ease-out]">
      {/* 签头：签号+吉凶+签题 */}
      <div className={`rounded-xl border-2 p-5 text-center ${lc} backdrop-blur`}
        style={{ animation: 'qian-glow 2s ease-in-out infinite' }}>
        <p className="text-xs opacity-70 mb-1">第 {item.id} 签</p>
        <p className="text-sm font-bold mb-2">{item.level} · {item.title}</p>
        <div className="w-16 h-0.5 mx-auto rounded-full bg-current opacity-30" />
      </div>

      {/* 签诗 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2 flex items-center gap-2">
          <span>📜</span> 签诗
        </h3>
        <p className="text-sm text-gray-200 leading-loose whitespace-pre-line font-serif tracking-wide">
          {item.poem}
        </p>
      </div>

      {/* 断语 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-gold-600/30 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2 flex items-center gap-2">
          <span>🏷️</span> 断语
        </h3>
        <p className="text-base font-bold text-gold-300 leading-relaxed">{item.verdict}</p>
      </div>

      {/* 签意 */}
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2 flex items-center gap-2">
          <span>💡</span> 签意解析
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">{item.meaning}</p>
        {item.advice && (
          <div className="mt-3 pt-3 border-t border-dark-600">
            <p className="text-xs text-gold-400/70 mb-1">📌 建议</p>
            <p className="text-sm text-gray-300">{item.advice}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ======== 主组件 ========
export default function LingqianClient() {
  const [selectedCat, setSelectedCat] = useState<string>(ALL_CATEGORIES[0]?.key || '')
  const [qian, setQian] = useState<LingqianItem | null>(null)
  const [shaking, setShaking] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [userQ, setUserQ] = useState('')
  const [phase, setPhase] = useState<'idle'|'praying'|'shaking'|'done'>('idle')
  const styleRef = useRef<HTMLStyleElement>(null)

  const category = ALL_CATEGORIES.find(c => c.key === selectedCat) || ALL_CATEGORIES[0]
  const drawCount = category?.items?.length || 0

  const draw = useCallback(() => {
    if (shaking || !drawCount) return

    setShowResult(false)
    setQian(null)
    setPhase('praying')

    // Phase 1: 诚心祈祷 (1.5s)
    setTimeout(() => {
      setPhase('shaking')
      setShaking(true)

      // Phase 2: 摇签 (1.5-2.5s)
      setTimeout(() => {
        setShaking(false)
        const idx = Math.floor(Math.random() * drawCount)
        const selected = category!.items[idx]
        setQian(selected)

        // Phase 3: 签弹出 (0.3s后显示结果)
        setTimeout(() => {
          setShowResult(true)
          setPhase('done')
        }, 300)
      }, 1800 + Math.random() * 800)
    }, 1500)
  }, [shaking, drawCount, category])

  const reset = () => {
    setQian(null)
    setShowResult(false)
    setPhase('idle')
    setShaking(false)
  }

  if (!category) return <div className="max-w-2xl mx-auto px-4 py-10 text-red-400">加载灵签数据失败</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <style ref={styleRef}>{SHAKE_KEYFRAMES}</style>

      {/* 标题 */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gold-400 font-serif mb-1">灵签占卜</h1>
        <p className="text-sm text-gray-400">心生诚念，默问所求，然后摇签</p>
      </div>

      {/* 签种选择器 — 随时可切换，切换后自动重置可摇 */}
      <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
        {ALL_CATEGORIES.map(cat => (
          <button key={cat.key}
            onClick={() => {
              if (selectedCat === cat.key) return
              reset()
              setSelectedCat(cat.key)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCat === cat.key
                ? 'bg-gold-600 text-dark-900 shadow-lg shadow-gold-600/20'
                : 'bg-dark-700/50 text-gray-300 border border-dark-600 hover:border-gold-500/50 hover:bg-dark-700'
            }`}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* 签筒区 */}
      <div className="bg-dark-800/60 backdrop-blur rounded-2xl border border-dark-600 p-6 mb-6 text-center">
        {/* 问事输入 */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-2">心中所问（可选）</label>
          <input type="text" value={userQ} onChange={e=>setUserQ(e.target.value)}
            placeholder={`如：求姻缘、事业、财运…`}
            className="w-full px-4 py-2.5 bg-dark-700/70 border border-dark-600 rounded-xl text-gray-200 text-sm text-center placeholder-gray-500 focus:border-gold-500/50 focus:outline-none transition-colors"
            disabled={phase !== 'idle'} />
        </div>

        {/* 签筒 */}
        <div className="relative py-2">
          <QianTong shaking={shaking} showResult={showResult} />

          {/* 状态文字 */}
          <div className="mt-3 text-sm">
            {phase === 'idle' && (
              <p className="text-gray-400">🙏 诚心默念后点击下方摇签</p>
            )}
            {phase === 'praying' && (
              <p className="text-gold-400 animate-pulse">🙏 诚心祈请中...</p>
            )}
            {phase === 'shaking' && (
              <p className="text-gold-300" style={{ animation: 'qian-glow 0.5s ease-in-out infinite' }}>
                🎋 正在摇签...
              </p>
            )}
            {phase === 'done' && (
              <p className="text-emerald-400">✨ 签已落定</p>
            )}
          </div>
        </div>

        {/* 摇签按钮 */}
        <button onClick={draw} disabled={phase !== 'idle'}
          className={`mt-2 px-10 py-3 rounded-xl text-base font-bold transition-all active:scale-95 ${
            phase === 'idle'
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-dark-900 shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30'
              : 'bg-dark-600 text-gray-400 cursor-not-allowed'
          }`}>
          {phase === 'idle' ? '🎋 摇签' : '🎋 请稍候...'}
        </button>

        {phase === 'done' && (
          <p className="mt-2 text-xs text-gray-500">
            签筒中共 {drawCount} 支灵签 · 第 {qian?.id} 签
          </p>
        )}

        {/* 当前签种说明 */}
        {phase === 'idle' && (
          <p className="mt-3 text-xs text-gray-500">
            {category.icon} {category.name} · 共 {category.total} 签
          </p>
        )}
      </div>

      {/* 结果展示 */}
      <div className="transition-all duration-500">
        {qian && <QianCard item={qian} visible={showResult} />}
      </div>

      {/* 再摇一次 */}
      {phase === 'done' && (
        <div className="text-center mt-6">
          <button onClick={reset}
            className="px-6 py-2 rounded-lg text-sm text-gray-300 bg-dark-700 border border-dark-600 hover:border-gold-500/50 transition-colors">
            🔄 再摇一次
          </button>
        </div>
      )}
    </div>
  )
}
