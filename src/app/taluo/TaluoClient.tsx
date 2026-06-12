'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useLocale } from '@/lib/i18n'
import {
  ALL_CARDS, calcLean, interpretLean, LEAN_DESCRIPTIONS,
  THREE_POSITIONS, SHUFFLE_TEXTS, QUESTION_GUIDES,
  TarotCard
} from '@/lib/tarot-data'
import ShareResult from '@/components/ShareResult'

function tk(key: string, lang: Record<string, unknown>): string {
  const keys = key.split('.')
  let v: unknown = lang
  for (const k of keys) {
    if (typeof v !== 'object' || v === null) return key
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : key
}

type Mode = 'select' | 'three' | 'yesno'
type Phase = 'idle' | 'question' | 'shuffling' | 'showing' | 'reading'

interface DrawnCard {
  card: TarotCard
  reversed: boolean
  position?: string
  positionDesc?: string
  positionIcon?: string
}

export default function TaluoClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>

  const [mode, setMode] = useState<Mode>('select')
  const [question, setQuestion] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [drawn, setDrawn] = useState<DrawnCard[]>([])
  const [flipped, setFlipped] = useState<boolean[]>([])
  const [shuffleText, setShuffleText] = useState('')
  const [showInput, setShowInput] = useState(false)

  const shuffleTimer = useRef<ReturnType<typeof setInterval>>(undefined)
  const flipTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  // 清理定时器
  const clearAllTimers = useCallback(() => {
    if (shuffleTimer.current) clearInterval(shuffleTimer.current)
    flipTimers.current.forEach(t => clearTimeout(t))
    flipTimers.current = []
  }, [])

  useEffect(() => clearAllTimers, [clearAllTimers])

  // 洗牌动画
  const startShuffle = useCallback(() => {
    setPhase('shuffling')
    setFlipped([])

    let idx = 0
    setShuffleText(SHUFFLE_TEXTS[0])
    shuffleTimer.current = setInterval(() => {
      idx = (idx + 1) % SHUFFLE_TEXTS.length
      setShuffleText(SHUFFLE_TEXTS[idx])
    }, 800)

    return new Promise<void>(resolve => {
      setTimeout(() => {
        if (shuffleTimer.current) clearInterval(shuffleTimer.current)
        resolve()
      }, 2800)
    })
  }, [])

  // 抽牌
  const drawCards = useCallback(async () => {
    clearAllTimers()
    if (!question.trim()) {
      setShowInput(false)
      setPhase('idle')
      return
    }

    await startShuffle()

    if (mode === 'three') {
      const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5).slice(0, 3)
      setPhase('showing')
      const result: DrawnCard[] = shuffled.map((card, i) => ({
        card,
        reversed: false,
        position: THREE_POSITIONS[i].label,
        positionDesc: THREE_POSITIONS[i].desc,
        positionIcon: THREE_POSITIONS[i].icon,
      }))
      setDrawn(result)
      // 逐个翻转
      result.forEach((_, i) => {
        const timer = setTimeout(() => {
          setFlipped(prev => { const n = [...prev]; n[i] = true; return n })
          if (i === result.length - 1) {
            setTimeout(() => setPhase('reading'), 600)
          }
        }, (i + 1) * 700)
        flipTimers.current.push(timer)
      })
    } else {
      // Yes/No: 抽一张，含逆位
      const pick = ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)]
      const reversed = Math.random() < 0.4
      setPhase('showing')
      const result: DrawnCard[] = [{
        card: pick,
        reversed,
        position: '你的答案',
        positionDesc: '这张牌给你方向',
        positionIcon: '🔮',
      }]
      setDrawn(result)
      setTimeout(() => {
        setFlipped([true])
        setTimeout(() => setPhase('reading'), 500)
      }, 800)
    }
  }, [mode, question, startShuffle, clearAllTimers])

  // 重置
  const reset = useCallback(() => {
    clearAllTimers()
    setPhase('idle')
    setDrawn([])
    setFlipped([])
    setShowInput(false)
  }, [clearAllTimers])

  // 开始占卜
  const beginReading = (m: 'three' | 'yesno') => {
    setMode(m)
    setShowInput(true)
    setPhase('question')
    setDrawn([])
  }

  // 示例问题点击
  const pickExample = (ex: string) => {
    setQuestion(ex)
  }

  // ==================== RENDER ====================

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">{tk('modules.taluo.name', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('modules.taluo.desc', lang)}</p>

      {/* ==== 选择模式 ==== */}
      {mode === 'select' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => beginReading('three')}
            className="group bg-dark-800/80 border border-dark-600 rounded-2xl p-8 text-left hover:border-gold-500/50 transition-all hover:shadow-lg hover:shadow-gold-900/10">
            <span className="text-4xl mb-3 block">🌘</span>
            <h2 className="text-lg font-bold text-gold-400 mb-2">基础三牌塔罗</h2>
            <p className="text-sm text-gray-400 leading-relaxed mt-2">
              经典的「过去–现在–未来」三牌牌阵。洗牌、抽牌、翻牌——让仪式感不止是文字，而是你亲手完成的过程。
            </p>
            <p className="text-xs text-gray-500 mt-3">
              · 仅正位，解读更干净
              <br />· 逐张翻转，按自己的节奏翻开
            </p>
          </button>
          <button onClick={() => beginReading('yesno')}
            className="group bg-dark-800/80 border border-dark-600 rounded-2xl p-8 text-left hover:border-gold-500/50 transition-all hover:shadow-lg hover:shadow-gold-900/10">
            <span className="text-4xl mb-3 block">🔮</span>
            <h2 className="text-lg font-bold text-gold-400 mb-2">Yes / No 塔罗</h2>
            <p className="text-sm text-gray-400 leading-relaxed mt-2">
              一张牌自动抽取，快速获得清晰方向。适合你需要一个干脆的「是/否」提示时。
            </p>
            <p className="text-xs text-gray-500 mt-3">
              · 完整 78 张牌含逆位
              <br />· 倾向分 0–100 + 具体建议
            </p>
          </button>
        </div>
      )}

      {/* ==== 问题输入 ==== */}
      {showInput && (
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-6">
          <p className="text-sm text-gray-300 mb-3">
            {mode === 'three' ? '🌘 集中精神，想一个真实的问题' : '🔮 问一个清晰的「是/否」问题'}
          </p>

          <div className="flex gap-2 mb-3">
            <input type="text" value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && drawCards()}
              placeholder={mode === 'three' ? '如：这段关系当前最重要的是什么？' : '如：这周该不该主动联系ta？'}
              className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500 text-sm"
            />
            <button onClick={drawCards}
              disabled={phase === 'shuffling'}
              className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50">
              {phase === 'shuffling' ? '洗牌中…' : mode === 'three' ? '开始抽牌' : '开始占卜'}
            </button>
          </div>

          {/* 示例问题 */}
          <div className="flex flex-wrap gap-1.5">
            {QUESTION_GUIDES.map(g => (
              <div key={g.label} className="relative group/guide">
                <span className="text-xs bg-dark-700 text-gray-500 px-2 py-0.5 rounded cursor-default">{g.label}</span>
                <div className="absolute bottom-full left-0 mb-1 hidden group-hover/guide:block z-10">
                  <div className="bg-dark-700 border border-dark-600 rounded-lg p-2 w-56 shadow-xl">
                    {g.examples.map((ex, i) => (
                      <button key={i} onClick={() => pickExample(ex)}
                        className="block text-xs text-gray-300 hover:text-gold-400 py-1 px-1 w-full text-left rounded hover:bg-dark-600">
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(phase === 'shuffling' || phase === 'showing' || phase === 'reading') && (
            <button onClick={reset}
              className="text-xs text-gray-500 hover:text-gray-300 mt-3 underline underline-offset-2">重新开始</button>
          )}
        </div>
      )}

      {/* ==== 洗牌动画 ==== */}
      {phase === 'shuffling' && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative w-20 h-28">
            {[0,1,2,3].map(i => (
              <div key={i}
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-700 to-dark-800 border border-gold-600 flex items-center justify-center text-4xl opacity-70"
                style={{
                  animation: `shuffleSlide 1s ease-in-out ${i * 0.15}s infinite`,
                  zIndex: 10 - i,
                }}>
                🃏
              </div>
            ))}
          </div>
          <p className="text-sm text-gold-400 animate-pulse">{shuffleText}</p>
        </div>
      )}

      {/* ==== 翻牌中/刚出牌 ==== */}
      {phase === 'showing' && drawn.length > 0 && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          {drawn.map((_, i) => {
            const isFlipped = flipped[i]
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-12 h-17 rounded-lg ${isFlipped ? 'bg-gold-600/30 border border-gold-500/50' : 'bg-dark-700 border border-dark-600'} transition-all duration-500 flex items-center justify-center`}>
                  {isFlipped ? <span className="text-sm">✨</span> : <span className="text-xs text-gray-600">🃏</span>}
                </div>
                <span className={`text-xs transition-opacity duration-500 ${isFlipped ? 'text-gold-400' : 'text-gray-600'}`}>
                  {isFlipped ? `第 ${i+1} 张已翻开` : '翻开中…'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* ==== 读取结果 ==== */}
      {phase === 'reading' && drawn.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          {/* 三牌占卜 */}
          {mode === 'three' && (
            <>
              <div className={`grid gap-4 ${drawn.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
                {drawn.map((item, i) => (
                  <CardDisplay key={i} item={item}
                    isReversed={item.reversed}
                    showPosition />
                ))}
              </div>

              {/* 三牌连贯解读 */}
              <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
                <p className="text-xs text-gold-500/80 mb-2">📖 牌阵解读</p>
                <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
                  {drawn.map((item, i) => (
                    <p key={i}>
                      <span className="text-gold-400 font-medium">
                        {THREE_POSITIONS[i]?.icon} {THREE_POSITIONS[i]?.label}：
                      </span>
                      {item.card.meaning}
                    </p>
                  ))}
                  <div className="flex justify-end mt-3">
                    <ShareResult
                      text={`🌘 三牌塔罗占卜结果\n\n问题：${question}\n\n${drawn.map((d,i) =>
                        `${THREE_POSITIONS[i]?.icon} ${THREE_POSITIONS[i]?.label}：${d.card.name}（正位）\n${d.card.meaning}`
                      ).join('\n\n')}`}
                      label="📋 复制结果"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Yes/No 占卜 */}
          {mode === 'yesno' && drawn.length === 1 && (() => {
            const item = drawn[0]
            const score = calcLean(item.card, item.reversed)
            const lean = interpretLean(score)
            return (
              <div className="space-y-4">
                {/* 倾向分仪表盘 */}
                {item.position && (
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-xl">{item.positionIcon || '🔮'}</span>
                    <span className="text-sm text-gold-400 font-medium">{item.position}</span>
                    <span className="text-xs text-gray-500">— {item.positionDesc}</span>
                  </div>
                )}

                <div className="bg-dark-800/80 rounded-2xl border border-dark-600 p-6 flex flex-col sm:flex-row gap-6 items-center">
                  <CardDisplay item={item} isReversed={item.reversed} />

                  <div className="flex-1 text-center sm:text-left">
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">倾向分</p>
                      <div className="flex items-center gap-3 justify-center sm:justify-start">
                        <div className="relative w-40 h-2.5 bg-dark-700 rounded-full overflow-hidden">
                          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500 transition-all duration-1000"
                            style={{ width: `${score}%` }} />
                        </div>
                        <span className={`text-lg font-bold ${lean.color}`}>{score}</span>
                      </div>
                      <p className={`text-sm font-semibold mt-1 ${lean.color}`}>
                        {item.reversed ? '逆位 · ' : '正位 · '}{lean.label}
                      </p>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed mb-3">
                      {LEAN_DESCRIPTIONS[lean.label] || ''}
                    </p>

                    <p className="text-xs text-gray-500">
                      <span className="text-gold-400">建议：</span>
                      {item.card.advice}
                    </p>

                    <div className="flex justify-center sm:justify-end mt-4">
                      <ShareResult
                        text={`🔮 Yes/No 塔罗占卜结果\n\n问题：${question}\n\n抽到：${item.card.name}（${item.reversed ? '逆位' : '正位'}）\n倾向分：${score}/100（${lean.label}）\n\n核心含义：${item.card.meaning}\n\n建议：${item.card.advice}`}
                        label="📋 复制结果"
                      />
                    </div>
                  </div>
                </div>

                {/* 详细解读 */}
                <div className="bg-dark-900/60 rounded-xl border border-dark-600/50 p-5">
                  <p className="text-xs text-gold-500/80 mb-2">📜 {item.card.name} 解读</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{item.card.meaning}</p>
                  <div className="mt-3 pt-3 border-t border-dark-600">
                    <p className="text-xs text-gray-500 mb-1">💡 行动建议</p>
                    <p className="text-sm text-gray-400">{item.card.advice}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-dark-600">
                    <p className="text-xs text-gray-500 mb-1">🤔 自我提问</p>
                    <p className="text-sm text-gray-400 italic">{item.card.reflection}</p>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      <style jsx>{`
        @keyframes shuffleSlide {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(-2deg); }
          50% { transform: translateY(2px) rotate(1deg); }
          75% { transform: translateY(-4px) rotate(-1deg); }
        }
      `}</style>
    </div>
  )
}

/** 单张卡牌展示 */
function CardDisplay({ item, isReversed, showPosition }: {
  item: DrawnCard; isReversed: boolean; showPosition?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const borderColor = isReversed ? 'border-rose-500/40' : 'border-gold-500/40'

  return (
    <div className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {showPosition && item.position && (
        <p className="text-xs text-gray-500 text-center mb-1">
          {item.positionIcon || '🃏'} {item.position}
          {item.positionDesc && <span className="text-gray-600 ml-1">· {item.positionDesc}</span>}
        </p>
      )}
      <div className="relative h-72 cursor-pointer [perspective:600px]"
        onClick={() => setHovered(!hovered)}>
        <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${hovered ? '[transform:rotateY(180deg)]' : ''}`}>
          {/* 牌背 */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-700 to-dark-800 border-2 border-gold-600 flex items-center justify-center [backface-visibility:hidden]">
            <span className="text-5xl opacity-50">🃏</span>
          </div>
          {/* 牌面 */}
          <div className={`absolute inset-0 rounded-xl bg-dark-700 border-2 ${borderColor} p-3 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col overflow-auto`}>
            <p className="text-xs font-semibold text-gold-400 text-center leading-tight">{item.card.name}</p>
            <p className="text-[10px] text-gray-500 text-center">{item.card.nameEn}</p>
            <p className={`text-[10px] text-center mt-1 font-medium ${isReversed ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isReversed ? '逆位' : '正位'}
            </p>
            <p className="text-[10px] text-gray-500 text-center mt-0.5">
              {item.card.element}{item.card.suit && item.card.suit !== 'major' ? ` · ${item.card.suit}` : ' · 大阿卡纳'}
            </p>
            <p className="text-[9px] text-gray-400 text-center mt-1 leading-relaxed">
              {item.card.keywords}
            </p>
            <div className="mt-auto pt-1.5 border-t border-dark-600">
              <p className="text-[9px] text-gray-400 leading-relaxed line-clamp-4">
                {isReversed ? item.card.reversed : item.card.upright}
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[9px] text-gray-600 text-center mt-1">点击翻转</p>
    </div>
  )
}
