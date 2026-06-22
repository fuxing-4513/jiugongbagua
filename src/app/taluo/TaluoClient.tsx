'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import TarotCard from '@/components/TarotCard'
import {
  SPREADS,
  SPREAD_LIST,
  drawForSpread,
  interpretCard,
} from '@/lib/tarot-engine'
import type { DrawnCard } from '@cometpisces/tarot-kit'

// ── Types ──
type Phase = 'menu' | 'shuffling' | 'placing' | 'reading'
type ReadingTab = 'core' | 'context' | 'overview'

// ── Shuffle texts ──
const SHUFFLE_TEXTS = [
  '集中精神，默念你的问题……',
  '牌在手中翻飞，能量在流转……',
  '聆听你内心深处的声音……',
  '让直觉引导你……',
  '塔罗的能量正在聚合……',
]

// ── Inline keyframes (injected via style jsx) ──
const KEYFRAMES = `
@keyframes tarotCardEnter {
  from { opacity: 0; transform: translateY(30px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes shuffleFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(-3deg); }
  50% { transform: translateY(5px) rotate(2deg); }
  75% { transform: translateY(-10px) rotate(-1deg); }
}
@keyframes spreadCardEnter {
  from { opacity: 0; transform: translateY(-40px) scale(0.6); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 8px rgba(168, 136, 45, 0.2); }
  50% { box-shadow: 0 0 20px rgba(168, 136, 45, 0.4); }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
`


// ── Spread icon map - single icon per spread for consistent display ──
const SPREAD_ICONS: Record<string, string> = {
  daily: '🌅',
  three: '🌘',
  celtic: '✝️',
  relationship: '💞',
  career: '💼',
  yesno: '🔮',
}

// ── Component ──
export default function TaluoClient() {
  const [phase, setPhase] = useState<Phase>('menu')
  const [selectedSpread, setSelectedSpread] = useState<string>('three')
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [shuffleText, setShuffleText] = useState('')
  const [showInterpretation, setShowInterpretation] = useState(false)
  const [readingTab, setReadingTab] = useState<ReadingTab>('core')
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set())
  const [visibleInterpretation, setVisibleInterpretation] = useState(false)

  const shufflerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (shufflerRef.current) clearInterval(shufflerRef.current)
    }
  }, [])

  // ── Start shuffle → place → read flow ──
  const startReading = useCallback(
    (spreadId: string) => {
      setSelectedSpread(spreadId)
      setPhase('shuffling')
      setShowInterpretation(false)
      setFlippedIndices(new Set())
      setVisibleInterpretation(false)
      setReadingTab('core')

      // Draw cards now (server-safe; data is loaded at build)
      const cards = drawForSpread(spreadId)
      setDrawnCards(cards)

      // Start shuffle text rotation
      let idx = 0
      setShuffleText(SHUFFLE_TEXTS[0])
      shufflerRef.current = setInterval(() => {
        idx = (idx + 1) % SHUFFLE_TEXTS.length
        setShuffleText(SHUFFLE_TEXTS[idx])
      }, 700)

      // After 2.5s → placing phase
      setTimeout(() => {
        if (shufflerRef.current) clearInterval(shufflerRef.current)
        setPhase('placing')

        // After 1.2s for cards to animate in → reading phase
        setTimeout(() => {
          setPhase('reading')
          // Auto-flip cards one by one with staggered delay
          const count = cards.length
          for (let i = 0; i < count; i++) {
            const delay = 400 + i * 500
            setTimeout(() => {
              setFlippedIndices((prev) => new Set(prev).add(i))
              // When last card is flipped, show interpretation
              if (i === count - 1) {
                setTimeout(() => {
                  setShowInterpretation(true)
                  setTimeout(() => setVisibleInterpretation(true), 100)
                }, 800)
              }
            }, delay)
          }
        }, 1200)
      }, 2500)
    },
    [],
  )

  // ── Reset to menu ──
  const resetToMenu = useCallback(() => {
    if (shufflerRef.current) clearInterval(shufflerRef.current)
    setPhase('menu')
    setDrawnCards([])
    setShowInterpretation(false)
    setFlippedIndices(new Set())
    setVisibleInterpretation(false)
  }, [])

  // ── Restart same spread ──
  const restartSpread = useCallback(() => {
    if (shufflerRef.current) clearInterval(shufflerRef.current)
    startReading(selectedSpread)
  }, [selectedSpread, startReading])

  // ── Toggle individual card flip ──
  const toggleCardFlip = useCallback(
    (index: number) => {
      setFlippedIndices((prev) => {
        const next = new Set(prev)
        if (next.has(index)) {
          next.delete(index)
        } else {
          next.add(index)
        }
        return next
      })
    },
    [],
  )

  // ── Get spread object ──
  const spread = SPREADS[selectedSpread]
  const positions = spread?.positions ?? []

  // =============================================
  // RENDER HELPERS
  // =============================================

  /** Render card with its spread layout position */
  const renderCardAtPosition = (index: number, extraClassName = '') => {
    const drawn = drawnCards[index]
    const pos = positions[index]
    if (!drawn) return null

    const flipped = flippedIndices.has(index)
    const card = drawn.card
    const orientation = drawn.orientation

    return (
      <div
        key={`card-${index}`}
        className={`inline-flex flex-col items-center gap-1.5 ${extraClassName}`}
        style={{
          animation:
            phase === 'placing'
              ? `spreadCardEnter 0.5s ease-out ${index * 0.15}s both`
              : undefined,
        }}
      >
        <TarotCard
          card={{
            name: card.name.zh,
            nameEn: card.name.en,
            element:
              card.arcana === 'major'
                ? '大阿卡纳'
                : (card.suit === 'wands'
                    ? '权杖'
                    : card.suit === 'cups'
                      ? '圣杯'
                      : card.suit === 'swords'
                        ? '宝剑'
                        : '星币'),
          }}
          flipped={flipped}
          size={drawnCards.length > 5 ? 'sm' : drawnCards.length > 3 ? 'sm' : 'md'}
          onClick={() => toggleCardFlip(index)}
          positionLabel={
            <span>
              {pos.icon} {pos.name}
            </span>
          }
          enterDelay={0}
        />
        {flipped && (
          <span
            className={`text-[9px] font-medium ${orientation === 'upright' ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            {orientation === 'upright' ? '▲ 正位' : '▼ 逆位'}
          </span>
        )}
      </div>
    )
  }

  /** Render the spread layout */
  const renderSpreadLayout = () => {
    if (phase === 'menu') return null
    const count = drawnCards.length

    // Common wrapper
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="relative flex flex-wrap items-center justify-center gap-4 sm:gap-6 my-8 min-h-[260px]">
        {children}
      </div>
    )

    if (selectedSpread === 'daily') {
      return (
        <Wrapper>
          <div className="flex justify-center w-full">
            {renderCardAtPosition(0)}
          </div>
        </Wrapper>
      )
    }

    if (selectedSpread === 'three') {
      return (
        <Wrapper>
          {[0, 1, 2].map((i) => renderCardAtPosition(i))}
        </Wrapper>
      )
    }

    if (selectedSpread === 'relationship') {
      return (
        <Wrapper>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 w-full max-w-lg">
            {[0, 1, 2, 3, 4].map((i) => renderCardAtPosition(i))}
          </div>
          {count >= 3 && (
            <div className="w-full text-center mt-2">
              <div className="inline-flex items-center gap-1 text-[11px] text-gray-600 bg-amber-50/80 px-3 py-1 rounded-full border border-amber-200">
                <span>↑ 你</span>
                <span className="text-gray-600">·</span>
                <span>对方</span>
                <span className="text-gray-600">·</span>
                <span>你们之间</span>
                <span className="text-gray-600">·</span>
                <span>障碍</span>
                <span className="text-gray-600">·</span>
                <span>发展</span>
              </div>
            </div>
          )}
        </Wrapper>
      )
    }

    if (selectedSpread === 'career') {
      return (
        <Wrapper>
          {[0, 1, 2, 3, 4].map((i) => renderCardAtPosition(i))}
        </Wrapper>
      )
    }

    if (selectedSpread === 'celtic') {
      // Celtic cross: cross + staff arrangement
      return (
        <Wrapper>
          <div className="relative flex flex-col items-center gap-2 w-full max-w-md">
            {/* Cross (top 6 cards in cross formation) */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
              {/* Card 4 (past) - left */}
              <div className="opacity-80 transform -translate-x-2">{renderCardAtPosition(3, 'scale-90')}</div>
              {/* Card 1 + 2 (center cross) */}
              <div className="relative">
                {renderCardAtPosition(0)}
                {count > 1 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="scale-75 opacity-60">{renderCardAtPosition(1)}</div>
                  </div>
                )}
              </div>
              {/* Card 6 (future) - right */}
              <div className="opacity-80 transform translate-x-2">{renderCardAtPosition(5, 'scale-90')}</div>
            </div>
            {/* Card 3 (below) + Card 5 (above) */}
            <div className="flex items-center justify-center gap-6">
              <div className="opacity-80">{renderCardAtPosition(2, 'scale-90')}</div>
              <span className="text-[9px] text-gray-600">↑</span>
              <div className="opacity-80">{renderCardAtPosition(4, 'scale-90')}</div>
            </div>

            {/* Staff (cards 7-10) */}
            {count >= 7 && (
              <div className="flex flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-amber-100 w-full">
                {[6, 7, 8, 9].map((i) => renderCardAtPosition(i))}
              </div>
            )}
          </div>
          <div className="w-full text-center mt-1">
            <span className="text-[10px] text-gray-600">①现状 ②辅助 ③根源 ④过去 ⑤最佳 ⑥未来 ⑦态度 ⑧环境 ⑨希望 ⑩结果</span>
          </div>
        </Wrapper>
      )
    }

    // Fallback: horizontal row
    return (
      <Wrapper>
        {Array.from({ length: count }, (_, i) => renderCardAtPosition(i))}
      </Wrapper>
    )
  }

  /** Render the interpretation section */
  const renderInterpretation = () => {
    if (!showInterpretation || drawnCards.length === 0) return null

    return (
      <div
        className={`transition-all duration-500 ease-out ${
          visibleInterpretation
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Tab bar */}
        <div className="flex gap-1 mb-4 bg-amber-50 rounded-lg p-1 border border-amber-200 max-w-md mx-auto">
          {[
            { key: 'core' as ReadingTab, label: '📖 核心含义' },
            { key: 'context' as ReadingTab, label: '💡 情景视角' },
            { key: 'overview' as ReadingTab, label: '🎴 全部牌面' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setReadingTab(tab.key)}
              className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-all font-medium ${
                readingTab === tab.key
                  ? 'bg-gold-600 text-dark-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-amber-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-3">
          {readingTab === 'core' &&
            drawnCards.map((drawn, i) => {
              const pos = positions[i]
              if (!pos) return null
              const interp = interpretCard(drawn.card, drawn.orientation, pos)
              return (
                <div
                  key={`core-${i}`}
                  className="bg-white/80 border border-amber-200/50 rounded-xl p-4"
                  style={{
                    animation: `fadeSlideUp 0.4s ease-out ${i * 0.1}s both`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{pos.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gold-700">
                        {interp.title}
                      </p>
                      <p className="text-[10px] text-gray-600">
                        {pos.name} · {drawn.orientation === 'upright' ? '正位' : '逆位'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm leading-relaxed">
                    <p className="text-gray-700">
                      <span className="text-gold-600/90 text-[11px]">核心含义：</span>
                      {interp.core}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-emerald-600/80 text-[11px]">{pos.name}方面：</span>
                      {interp.aspect}
                    </p>
                    <div className="pt-2 border-t border-amber-100">
                      <p className="text-gray-500 text-xs">
                        <span className="text-gold-600/80">💡 建议：</span>
                        {interp.advice}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}

          {readingTab === 'context' &&
            drawnCards.map((drawn, i) => {
              const pos = positions[i]
              if (!pos) return null
              const interp = interpretCard(drawn.card, drawn.orientation, pos)
              return (
                <div
                  key={`ctx-${i}`}
                  className="bg-white/80 border border-amber-200/50 rounded-xl p-4"
                  style={{
                    animation: `fadeSlideUp 0.4s ease-out ${i * 0.1}s both`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{pos.icon}</span>
                    <p className="text-sm font-medium text-gold-700">
                      {interp.title}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm leading-relaxed">
                    {interp.contextual ? (
                      <p className="text-gray-700">
                        <span className="text-rose-600/80 text-[11px]">
                          {pos.context === 'love'
                            ? '❤️ 感情视角：'
                            : pos.context === 'work'
                              ? '💼 事业视角：'
                              : pos.context === 'interpersonal'
                                ? '🤝 人际视角：'
                                : '📌 综合视角：'}
                        </span>
                        {interp.contextual}
                      </p>
                    ) : (
                      <p className="text-gray-600 text-xs italic">
                        该位置不涉及具体情景视角
                      </p>
                    )}
                    <div className="pt-2 border-t border-amber-100">
                      <p className="text-gray-500 text-xs">
                        <span className="text-gold-600/80">💡 {pos.name}建议：</span>
                        {interp.advice}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}

          {readingTab === 'overview' && (
            <div className="bg-white/80 border border-amber-200/50 rounded-xl p-5">
              <p className="text-[11px] text-gold-600/80 mb-3 tracking-wider uppercase">
                {spread?.name} · 全部牌面
              </p>
              <div className="space-y-3">
                {drawnCards.map((drawn, i) => {
                  const pos = positions[i]
                  if (!pos) return null
                  const isUp = drawn.orientation === 'upright'
                  return (
                    <div
                      key={`ov-${i}`}
                      className="flex items-start gap-3 pb-3 border-b border-amber-200/40 last:border-0"
                    >
                      <span className="text-lg mt-0.5 shrink-0">{pos.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gold-700">
                          {drawn.card.name.zh}
                          <span className={`text-[10px] ml-1.5 ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isUp ? '▲正位' : '▼逆位'}
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {pos.name}
                          {drawn.card.arcana === 'major' ? ' · 大阿卡纳' : ` · ${drawn.card.suit}`}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {drawn.card.meaning[isUp ? 'upright' : 'reversed'].zh}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // =============================================
  // MAIN RENDER
  // =============================================

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gold-700 font-serif mb-2">
          塔罗牌
        </h1>
        <p className="text-sm text-gray-600 max-w-lg mx-auto">
          基于韦特塔罗78张完整牌库，多牌阵深度解读
        </p>
      </div>

      {/* ───── MENU PHASE: Spread selection ───── */}
      {phase === 'menu' && (
        <div className="space-y-6">
          {/* Description */}
          <p className="text-sm text-gray-500 text-center">
            选择一个牌阵，开始你的解读之旅
          </p>

          {/* Spread grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPREAD_LIST.map((spr) => (
              <button
                key={spr.id}
                type="button"
                onClick={() => startReading(spr.id)}
                className="group bg-amber-50/80 border border-amber-200/50 rounded-2xl p-5 text-left hover:border-gold-400/60 hover:bg-amber-50 transition-all hover:shadow-md hover:shadow-gold-200/30 active:scale-[0.98] min-h-[200px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg shrink-0">
                      {SPREAD_ICONS[spr.id] || '🃏'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-gold-700 truncate">
                        {spr.name}
                      </h3>
                      <p className="text-[10px] text-gray-500 truncate">{spr.descriptionShort}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {spr.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {spr.positions.map((p) => (
                    <span
                      key={p.key}
                      className="text-[10px] text-gray-600 bg-amber-100/70 px-2 py-0.5 rounded whitespace-nowrap"
                    >
                      {p.icon}{p.name}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ───── SHUFFLING PHASE ───── */}
      {phase === 'shuffling' && (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
          {/* Flying cards */}
          <div className="relative w-48 h-64">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-xl border border-gold-500/30 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #2a1e14, #1a0f08)',
                  animation: `shuffleFloat 0.6s ease-in-out ${i * 0.08}s infinite`,
                  transform: `rotate(${(i - 4) * 6}deg)`,
                  zIndex: 10 - i,
                }}
              >
                <span className="text-3xl opacity-30">☯</span>
              </div>
            ))}
          </div>

          {/* Shuffle text */}
          <p className="text-sm text-gold-400 animate-pulse text-center max-w-xs">
            {shuffleText}
          </p>
        </div>
      )}

      {/* ───── PLACING PHASE ───── */}
      {phase === 'placing' && (
        <div className="flex flex-col items-center gap-4 min-h-[300px] pt-8">
          <p className="text-sm text-gold-600/80 animate-pulse mb-2">
            ✨ 牌已就位……
          </p>
          {renderSpreadLayout()}
        </div>
      )}

      {/* ───── READING PHASE ───── */}
      {phase === 'reading' && (
        <div className="space-y-6">
          {/* Current spread name */}
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.15em] text-gold-600/80 mb-1">
              {spread?.name}
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-600">
              {spread?.positions.map((p) => (
                <span key={p.key}>
                  {p.icon}{p.name}
                </span>
              ))}
            </div>
          </div>

          {/* Card layout */}
          <div className="bg-white/60 border border-amber-200/40 rounded-2xl p-6 sm:p-8">
            {renderSpreadLayout()}

            {/* Flip hint (only show if some cards aren't flipped yet) */}
            {flippedIndices.size < drawnCards.length && (
              <p className="text-center text-[10px] text-gray-600 mt-4 animate-pulse">
                {flippedIndices.size === 0
                  ? '牌正在依次翻开……'
                  : '点击未翻开的牌可单独查看'}
              </p>
            )}
          </div>

          {/* Interpretation */}
          {renderInterpretation()}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={restartSpread}
              className="inline-flex items-center gap-1.5 bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold text-sm px-5 py-2.5 rounded-lg transition-all active:scale-95"
            >
              💫 重新抽牌
            </button>
            <button
              type="button"
              onClick={resetToMenu}
              className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
            >
              返回选择牌阵
            </button>
          </div>
        </div>
      )}

      {/* Global keyframes */}
      <style jsx>{KEYFRAMES}</style>
    </div>
  )
}
