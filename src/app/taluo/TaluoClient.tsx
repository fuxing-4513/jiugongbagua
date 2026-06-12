'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useLocale } from '@/lib/i18n'
import {
  ALL_CARDS, calcLean, interpretLean, LEAN_DESCRIPTIONS,
  QUESTION_GUIDES, TarotCard
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
type ThreePhase = 'shuffle' | 'shuffling' | 'picking' | 'reading'
type YesNoPhase = 'input' | 'shuffling' | 'showing' | 'reading'

const POSITIONS = [
  { key: 'past', label: '过去', desc: '是什么塑造了当下', icon: '🌘' },
  { key: 'now', label: '现在', desc: '你此刻的真实处境', icon: '🌕' },
  { key: 'future', label: '未来', desc: '趋势与可能走向', icon: '🌖' },
]

interface DrawnCard {
  card: TarotCard
  position?: string
  positionIcon?: string
}

const SHUFFLE_TEXTS = ['集中精神，默念你的问题……', '牌在手中翻飞，能量在流转……', '聆听内心的声音……']

// 牌面展示（组件外定义）
function CardFace({ card, reversed, small }: { card: TarotCard; reversed?: boolean; small?: boolean }) {
  const w = small ? 64 : 76
  const h = small ? 107 : 127
  const reversed_ = reversed ?? false
  return (
    <div className={`bg-dark-700 border-2 ${reversed_ ? 'border-rose-500/40' : 'border-gold-500/40'} rounded-lg shadow-lg flex flex-col overflow-hidden`}
      style={{ width: w, height: h }}>
      <p className={`text-[${small ? 8 : 9}px] font-semibold text-gold-400 text-center leading-tight px-0.5 pt-0.5`}>{card.name}</p>
      <p className={`text-[${small ? 7 : 8}px] text-gray-600 text-center truncate px-0.5`}>{card.nameEn}</p>
      <p className={`text-[${small ? 7 : 8}px] text-center mt-auto ${reversed_ ? 'text-rose-400' : 'text-emerald-400'} font-medium`}>
        {reversed_ ? '逆位' : '正位'}
      </p>
      <p className={`text-[${small ? 6 : 7}px] text-gray-500 text-center pb-0.5`}>{card.element}</p>
    </div>
  )
}

// 牌背图片（组件外定义）
function CardBack({ onClick, label, disabled }: {
  onClick?: () => void; label?: string; disabled?: boolean
}) {
  return (
    <button type="button" onClick={disabled ? undefined : onClick}
      aria-label={label || '牌'}
      disabled={disabled}
      className={`relative w-[76px] h-[127px] rounded-lg bg-gradient-to-br from-gold-700 to-dark-800 border border-gold-600/60 shadow-lg shadow-black/40 flex items-center justify-center transition-all duration-300
        ${!disabled && onClick ? 'cursor-pointer hover:border-gold-400 hover:scale-105 hover:shadow-gold-900/40' : 'cursor-default'}
        ${disabled ? 'opacity-40' : ''}
        active:scale-95`}>
      <span className="text-3xl opacity-60">🃏</span>
      {label && <span className="absolute -bottom-5 text-[9px] text-gray-500 whitespace-nowrap">{label}</span>}
    </button>
  )
}

export default function TaluoClient() {
  const { t } = useLocale()
  const lang = t as unknown as Record<string, unknown>
  const [mode, setMode] = useState<Mode>('select')

  // 三牌状态
  const [threePhase, setThreePhase] = useState<ThreePhase>('shuffle')
  const [shuffleText, setShuffleText] = useState('')
  const [isShuffling, setIsShuffling] = useState(false)
  const [selectedPos, setSelectedPos] = useState(0)
  const [fanCards] = useState(() => ALL_CARDS.sort(() => Math.random() - 0.5).slice(0, 24))
  const [picked, setPicked] = useState<DrawnCard[]>([])
  const [showReading, setShowReading] = useState(false)
  const [flippedCard, setFlippedCard] = useState<number | null>(null)
  const [flyingCard, setFlyingCard] = useState<{ card: TarotCard; from: number; to: number } | null>(null)
  const [fanOffsets] = useState(() => Array.from({ length: 24 }, () => Math.random() * 10))

  // Yes/No 状态
  const [ynQuestion, setYnQuestion] = useState('')
  const [ynPhase, setYnPhase] = useState<YesNoPhase>('input')
  const [ynCard, setYnCard] = useState<DrawnCard | null>(null)
  const [ynFlipped, setYnFlipped] = useState(false)
  const [ynReversed, setYnReversed] = useState(false)

  const shuffler = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => () => { if (shuffler.current) clearInterval(shuffler.current) }, [])

  // ===== 三牌 =====

  const startThreeShuffle = useCallback(() => {
    if (isShuffling) return
    setIsShuffling(true)
    setThreePhase('shuffling')
    setShowReading(false)
    setSelectedPos(0)
    setPicked([])
    setFlippedCard(null)
    setFlyingCard(null)

    let idx = 0
    setShuffleText(SHUFFLE_TEXTS[0])
    shuffler.current = setInterval(() => {
      idx = (idx + 1) % SHUFFLE_TEXTS.length
      setShuffleText(SHUFFLE_TEXTS[idx])
    }, 800)

    setTimeout(() => {
      if (shuffler.current) clearInterval(shuffler.current)
      setIsShuffling(false)
      setThreePhase('picking')
    }, 2500)
  }, [isShuffling])

  const pickCard = useCallback((cardIdx: number) => {
    if (threePhase !== 'picking' || selectedPos >= 3) return
    const card = fanCards[cardIdx]
    if (picked.find(p => p.card.id === card.id)) return

    const pos = POSITIONS[selectedPos]
    const newPick: DrawnCard = { card, position: pos.label, positionIcon: pos.icon }
    const newPicked = [...picked, newPick]
    setPicked(newPicked)
    setFlyingCard({ card, from: cardIdx, to: selectedPos })

    setTimeout(() => {
      setFlyingCard(null)
      setSelectedPos(prev => prev + 1)
      if (newPicked.length >= 3) {
        setTimeout(() => { setThreePhase('reading'); setShowReading(true) }, 400)
      }
    }, 500)
  }, [threePhase, selectedPos, fanCards, picked])

  const resetThree = useCallback(() => {
    setIsShuffling(false)
    setThreePhase('shuffle')
    setSelectedPos(0)
    setPicked([])
    setFlippedCard(null)
    setShowReading(false)
    setFlyingCard(null)
  }, [])

  // ===== Yes/No =====

  const startYnDraw = useCallback(() => {
    if (!ynQuestion.trim()) return
    setYnPhase('shuffling')
    setYnFlipped(false)
    setYnCard(null)

    setTimeout(() => {
      const pickIdx = Math.floor(Math.random() * ALL_CARDS.length)
      const card = ALL_CARDS[pickIdx]
      setYnReversed(Math.random() < 0.4)
      setYnCard({ card, position: '你的答案', positionIcon: '🔮' })

      setTimeout(() => {
        setYnFlipped(true)
        setTimeout(() => setYnPhase('reading'), 500)
      }, 600)
    }, 2000)
  }, [ynQuestion])

  const resetYn = useCallback(() => {
    setYnPhase('input')
    setYnCard(null)
    setYnFlipped(false)
  }, [])

  // ===== 渲染 =====

  // 牌扇角度计算
  const FAN_COUNT = 22
  const FAN_ANGLE_RANGE = 100
  const getCardAngle = (i: number) => -FAN_ANGLE_RANGE / 2 + (i / (FAN_COUNT - 1)) * FAN_ANGLE_RANGE

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-2">{tk('modules.taluo.name', lang)}</h1>
      <p className="text-gray-400 mb-8">{tk('modules.taluo.desc', lang)}</p>

      {/* ====== 模式选择 ====== */}
      {mode === 'select' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => setMode('three')}
            className="group bg-dark-800/80 border border-dark-600 rounded-2xl p-8 text-left hover:border-gold-500/50 transition-all hover:shadow-lg hover:shadow-gold-900/10">
            <span className="text-4xl mb-3 block">🌘</span>
            <h2 className="text-lg font-bold text-gold-400 mb-2">基础三牌塔罗</h2>
            <p className="text-sm text-gray-400 leading-relaxed">经典的「过去–现在–未来」三牌牌阵。洗牌、抽牌、翻牌——让仪式感不止是文字，而是你亲手完成的过程。</p>
            <p className="text-xs text-gray-500 mt-3">· 仅正位，解读更干净 · 亲手从牌扇中抽牌</p>
          </button>
          <button onClick={() => setMode('yesno')}
            className="group bg-dark-800/80 border border-dark-600 rounded-2xl p-8 text-left hover:border-gold-500/50 transition-all hover:shadow-lg hover:shadow-gold-900/10">
            <span className="text-4xl mb-3 block">🔮</span>
            <h2 className="text-lg font-bold text-gold-400 mb-2">Yes / No 塔罗</h2>
            <p className="text-sm text-gray-400 leading-relaxed">一张牌自动抽取，快速获得清晰方向。适合需要一个干脆的提示时。</p>
            <p className="text-xs text-gray-500 mt-3">· 完整78张含逆位 · 倾向分0–100 + 具体建议</p>
          </button>
        </div>
      )}

      {/* ====== 三牌占卜 ====== */}
      {mode === 'three' && (
        <>
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-widest text-gold-500/70">三牌牌阵</p>
            <div className="mt-2 mb-1">
              <span className="text-xs text-gray-500">
                {threePhase === 'shuffle' && '轻触牌堆开始洗牌'}
                {threePhase === 'shuffling' && '洗牌中……'}
                {threePhase === 'picking' && `请选第 ${selectedPos + 1} 张牌 — ${POSITIONS[selectedPos].icon} ${POSITIONS[selectedPos].label}`}
                {threePhase === 'reading' && '🌘 翻牌查看解读'}
              </span>
            </div>
            {threePhase === 'shuffle' && (
              <div className="max-w-md mx-auto">
                <p className="text-sm text-gray-400">明确并专注于心中的问题</p>
                <p className="text-xs text-gray-600 mt-1">先深呼吸一次，把问题想清楚。准备好后开始洗牌——然后为过去、现在、未来各抽一张牌。</p>
              </div>
            )}
          </div>

          {/* 牌扇区域 */}
          {threePhase !== 'reading' && (
            <div className="relative flex justify-center items-end h-[350px] mb-8 overflow-hidden">
              <div className="relative" style={{ width: 160, height: 300, transformOrigin: 'bottom center' }}>
                {fanCards.slice(0, FAN_COUNT).map((card, i) => {
                  const angle = getCardAngle(i)
                  const isPicked = picked.findIndex(p => p.card.id === card.id) >= 0
                  const flying = flyingCard?.from === i

                  return (
                    <button key={card.id} type="button" disabled={isPicked || isShuffling}
                      onClick={() => {
                        if (threePhase === 'shuffle') startThreeShuffle()
                        else if (threePhase === 'picking') pickCard(i)
                      }}
                      className={`absolute bottom-0 left-1/2 transition-all duration-500 ${isShuffling ? 'animate-shuffleCard' : ''}`}
                      style={{
                        transform: isShuffling
                          ? `translateX(-50%) rotate(${angle * 0.5}deg) translateY(${(fanOffsets[i] || 0)}px)`
                          : isPicked
                            ? `translateX(-50%) rotate(0deg) translateY(-200px) scale(0.5)`
                            : flying
                              ? `translateX(-50%) rotate(0deg) translateY(-150px) scale(0.7)`
                              : `translateX(-50%) rotate(${angle}deg) translateY(0px)`,
                        zIndex: isPicked || flying ? 0 : FAN_COUNT - i,
                        transitionDuration: isShuffling ? '200ms' : '500ms',
                        opacity: isPicked ? 0 : threePhase === 'shuffling' ? 0.7 : 1,
                        pointerEvents: (isPicked || isShuffling || threePhase === 'shuffle') ? 'none' : 'auto',
                      }}>
                      <CardBack
                        label={threePhase === 'shuffle' ? '' : (isPicked ? '' : `${i + 1}`)}
                        disabled={isPicked || isShuffling} />
                    </button>
                  )
                })}
              </div>

              {/* 洗牌提示覆盖 */}
              {threePhase === 'shuffle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                  <p className="text-xs text-gold-500 absolute bottom-16">轻触以洗牌</p>
                </div>
              )}

              {threePhase === 'shuffling' && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <p className="text-sm text-gold-400 animate-pulse">{shuffleText}</p>
                </div>
              )}
            </div>
          )}

          {/* 已选位置指示 */}
          {threePhase === 'picking' && (
            <div className="flex justify-center gap-4 mb-4">
              {POSITIONS.map((pos, i) => (
                <div key={pos.key} className={`text-center p-2 rounded-lg border ${i === selectedPos ? 'border-gold-500/60 bg-dark-800' : i < selectedPos ? 'border-emerald-500/30 bg-dark-800' : 'border-dark-600 bg-dark-800/50'}`}>
                  <span className="text-lg">{pos.icon}</span>
                  <p className={`text-xs mt-0.5 ${i === selectedPos ? 'text-gold-400' : i < selectedPos ? 'text-emerald-400' : 'text-gray-600'}`}>{pos.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* 已选卡片预览 */}
          {threePhase === 'picking' && picked.length > 0 && (
            <div className="flex justify-center gap-3 mb-4">
              {picked.map((p, i) => (
                <div key={i} className="text-center">
                  <CardFace card={p.card} small />
                  <p className="text-[9px] text-gray-500 mt-0.5">{p.position}</p>
                </div>
              ))}
            </div>
          )}

          {threePhase === 'shuffle' && (
            <button onClick={startThreeShuffle}
              className="mx-auto block bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-all active:scale-95">
              🀄 开始洗牌
            </button>
          )}

          {(threePhase === 'picking' || threePhase === 'reading') && (
            <button onClick={resetThree}
              className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 block mx-auto mt-2">重新洗牌</button>
          )}

          {/* ====== 三牌解读 ====== */}
          {showReading && picked.length === 3 && (
            <div className="mt-4 space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {picked.map((item, i) => {
                  const isFlipped = flippedCard === i
                  return (
                    <div key={i} className="text-center">
                      <p className="text-xs text-gray-500 mb-1">
                        {POSITIONS[i].icon} {POSITIONS[i].label}
                        <span className="text-gray-600 ml-1">· {POSITIONS[i].desc}</span>
                      </p>
                      <button onClick={() => setFlippedCard(isFlipped ? null : i)}
                        className="mx-auto block [perspective:600px]">
                        <div className={`relative transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                          style={{ width: 76, height: 127 }}>
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gold-700 to-dark-800 border-2 border-gold-600 flex items-center justify-center [backface-visibility:hidden]">
                            <span className="text-3xl opacity-50">🃏</span>
                          </div>
                          <div className="absolute inset-0 rounded-lg bg-dark-700 border-2 border-gold-500/40 p-1.5 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col">
                            <p className="text-[9px] font-semibold text-gold-400 text-center leading-tight">{item.card.name}</p>
                            <p className="text-[7px] text-gray-500 text-center">{item.card.nameEn}</p>
                            <p className="text-[7px] text-gray-500 text-center">{item.card.element} · 大阿卡纳</p>
                            <p className="text-[7px] text-gray-400 text-center mt-auto leading-tight">{item.card.keywords}</p>
                            <p className="text-[7px] text-emerald-400 text-center py-0.5">正位</p>
                          </div>
                        </div>
                      </button>
                      <p className="text-[9px] text-gray-600 mt-1">{isFlipped ? '点击翻回' : '点击翻牌'}</p>
                      {isFlipped && (
                        <div className="mt-2 bg-dark-900/60 rounded-lg p-2.5 border border-dark-600/50 text-left">
                          <p className="text-[10px] text-gray-300 leading-relaxed">{item.card.meaning}</p>
                          <p className="text-[9px] text-gray-500 mt-1">💡 {item.card.advice}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-center">
                <ShareResult
                  text={`🌘 三牌塔罗占卜结果\n\n${picked.map((d, i) =>
                    `${POSITIONS[i].icon} ${POSITIONS[i].label}：${d.card.name}\n${d.card.meaning}`
                  ).join('\n\n')}`}
                  label="📋 复制结果" />
              </div>
            </div>
          )}

          {threePhase === 'reading' && !showReading && (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-gray-500 animate-pulse">牌面已就绪……</p>
            </div>
          )}
        </>
      )}

      {/* ====== Yes/No 占卜 ====== */}
      {mode === 'yesno' && (
        <>
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-widest text-gold-500/70">Yes / No</p>
          </div>

          {ynPhase === 'input' && (
            <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-6">
              <p className="text-sm text-gray-300 mb-3">🔮 问一个清晰的「是/否」问题</p>
              <div className="flex gap-2 mb-3">
                <input type="text" value={ynQuestion} onChange={e => setYnQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && startYnDraw()}
                  placeholder="如：这周该不该主动联系ta？" className="flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold-500 text-sm" />
                <button onClick={startYnDraw}
                  className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-5 py-2 rounded-lg transition-colors">开始占卜</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUESTION_GUIDES.map(g => (
                  <div key={g.label} className="relative group/guide">
                    <span className="text-xs bg-dark-700 text-gray-500 px-2 py-0.5 rounded cursor-default">{g.label}</span>
                    <div className="absolute bottom-full left-0 mb-1 hidden group-hover/guide:block z-10">
                      <div className="bg-dark-700 border border-dark-600 rounded-lg p-2 w-56 shadow-xl">
                        {g.examples.map((ex, i) => (
                          <button key={i} onClick={() => setYnQuestion(ex)}
                            className="block text-xs text-gray-300 hover:text-gold-400 py-1 px-1 w-full text-left rounded hover:bg-dark-600">{ex}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ynPhase === 'shuffling' && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="relative w-20 h-28">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-700 to-dark-800 border border-gold-600 flex items-center justify-center text-4xl opacity-70"
                    style={{ animation: `shuffleSlide 1s ease-in-out ${i * 0.15}s infinite`, zIndex: 10 - i }}>
                    🃏
                  </div>
                ))}
              </div>
              <p className="text-sm text-gold-400 animate-pulse">抽取牌中……</p>
            </div>
          )}

          {ynPhase === 'showing' && ynCard && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="[perspective:600px]">
                <div className={`relative transition-transform duration-700 [transform-style:preserve-3d] ${ynFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                  style={{ width: 76, height: 127 }}>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gold-700 to-dark-800 border-2 border-gold-600 flex items-center justify-center [backface-visibility:hidden]">
                    <span className="text-3xl opacity-50">🃏</span>
                  </div>
                  <div className="absolute inset-0 rounded-lg bg-dark-700 border-2 border-gold-500/40 p-1.5 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center">
                    <p className="text-[9px] font-semibold text-gold-400 text-center">{ynCard.card.name}</p>
                    <p className="text-[7px] text-gray-500 text-center">{ynCard.card.nameEn}</p>
                    <p className="text-[7px] text-gray-500 text-center">{ynCard.card.element}</p>
                  </div>
                </div>
              </div>
              {ynFlipped && <p className="text-xs text-gray-500">已翻开</p>}
            </div>
          )}

          {ynPhase === 'reading' && ynCard && (() => {
            const score = calcLean(ynCard.card, ynReversed)
            const lean = interpretLean(score)
            return (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-dark-800/80 rounded-2xl border border-dark-600 p-6 flex flex-col sm:flex-row gap-6 items-center">
                  <div>
                    <CardFace card={ynCard.card} reversed={ynReversed} />
                  </div>
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
                        {ynReversed ? '逆位 · ' : '正位 · '}{lean.label}
                      </p>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-3">{LEAN_DESCRIPTIONS[lean.label] || ''}</p>
                    <p className="text-xs text-gray-500"><span className="text-gold-400">建议：</span>{ynCard.card.advice}</p>
                    <div className="flex justify-center sm:justify-end mt-4">
                      <ShareResult text={`🔮 Yes/No 塔罗\n\n问题：${ynQuestion}\n\n抽到：${ynCard.card.name}（${ynReversed ? '逆位' : '正位'}）\n倾向分：${score}/100（${lean.label}）\n\n${ynCard.card.meaning}\n\n建议：${ynCard.card.advice}`} label="📋 复制结果" />
                    </div>
                  </div>
                </div>
                <div className="bg-dark-900/60 rounded-xl border border-dark-600/50 p-5">
                  <p className="text-xs text-gold-500/80 mb-2">📜 {ynCard.card.name} 解读</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{ynCard.card.meaning}</p>
                  <div className="mt-3 pt-3 border-t border-dark-600">
                    <p className="text-xs text-gray-500 mb-1">💡 行动建议</p>
                    <p className="text-sm text-gray-400">{ynCard.card.advice}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-dark-600">
                    <p className="text-xs text-gray-500 mb-1">🤔 自我提问</p>
                    <p className="text-sm text-gray-400 italic">{ynCard.card.reflection}</p>
                  </div>
                </div>
                <button onClick={resetYn} className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 block mx-auto">重新占卜</button>
              </div>
            )
          })()}
        </>
      )}

      {/* 返回选择 */}
      {mode !== 'select' && (
        <button onClick={() => { setMode('select'); resetThree(); resetYn() }}
          className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 block mx-auto mt-8">返回选择占卜方式</button>
      )}

      <style jsx>{`
        @keyframes shuffleSlide {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(-2deg); }
          50% { transform: translateY(2px) rotate(1deg); }
          75% { transform: translateY(-4px) rotate(-1deg); }
        }
        .animate-shuffleCard {
          animation: shuffleSlide 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
