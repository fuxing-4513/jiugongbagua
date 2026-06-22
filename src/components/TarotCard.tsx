'use client'

import type { MouseEventHandler, ReactNode } from 'react'

// ── Props ──
export interface TarotCardProps {
  /** The card data (when provided, shows the front face on flip) */
  card?: {
    name: string       // Chinese name
    nameEn: string     // English name
    element: string    // Element text
  }
  /** Whether the card is currently flipped (showing front face) */
  flipped: boolean
  /** If true, show the ornate card back even when not flipped (vs showing a placeholder) */
  faceDown?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  selected?: boolean
  /** Optional position label shown below the card */
  positionLabel?: ReactNode
  /** Optional animation delay (ms) for staggered entrance */
  enterDelay?: number
}

// ── Size map ──
const SIZES = {
  sm:  { w: 80, h: 130, fs: 10, fsEn: 8, fsEl: 8 },
  md:  { w: 120, h: 195, fs: 12, fsEn: 9, fsEl: 9 },
  lg:  { w: 160, h: 260, fs: 14, fsEn: 11, fsEl: 11 },
} as const

// ── Card back pattern SVG ──
const CardBackPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <pattern id="bgrid" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="100" height="100" fill="url(#bgrid)" />
  </svg>
)

// ── Eight Trigrams ring ──
const TRIGRAMS = ['☰', '☱', '☲', '☳', '☯', '☴', '☵', '☶', '☷']

export default function TarotCard({
  card,
  flipped,
  faceDown = true,
  onClick,
  size = 'md',
  disabled = false,
  selected = false,
  positionLabel,
  enterDelay = 0,
}: TarotCardProps) {
  const dims = SIZES[size]
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    if (!disabled && onClick) onClick()
  }

  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled && !flipped}
        aria-label={flipped && card ? card.name : '塔罗牌'}
        style={{
          width: dims.w,
          height: dims.h,
          perspective: '1000px',
          animation: enterDelay > 0
            ? `tarotCardEnter 0.5s ease-out ${enterDelay}ms both`
            : undefined,
        }}
        className={`
          block outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 rounded-xl
          ${disabled && !flipped ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          ${!disabled && onClick ? 'hover:scale-105 active:scale-95' : ''}
          transition-transform duration-200
        `}
      >
        {/* 3D flip container */}
        <div
          className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-[0.6s] ease-in-out rounded-xl"
          style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* ───── CARD BACK ───── */}
          <div
            className="absolute inset-0 rounded-xl [backface-visibility:hidden] overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #2a1e14 0%, #3d2817 30%, #1a0f08 100%)',
              border: '2px solid rgba(168, 136, 45, 0.5)',
              boxShadow: selected
                ? '0 0 20px rgba(168, 136, 45, 0.5), inset 0 0 30px rgba(168, 136, 45, 0.05)'
                : '0 4px 12px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.3)',
            }}
          >
            {/* Grid pattern */}
            <CardBackPattern />

            {/* Trigrams ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[72%] h-[72%]">
                {TRIGRAMS.map((tri, i) => {
                  const angle = (i / TRIGRAMS.length) * 360
                  const r = 50
                  const rad = (angle * Math.PI) / 180
                  const x = 50 + r * Math.cos(rad)
                  const y = 50 + r * Math.sin(rad)
                  return (
                    <span
                      key={tri}
                      className="absolute text-[10px] text-gold-500/40"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {tri}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Center ☯ symbol */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-gold-500/40 flex items-center justify-center bg-dark-950/30">
                <span className="text-lg opacity-70" style={{ filter: 'drop-shadow(0 0 4px rgba(168,136,45,0.3))' }}>
                  ☯
                </span>
              </div>
            </div>

            {/* Corner ornaments */}
            <span className="absolute top-1.5 left-2 text-[9px] text-gold-500/30">☰</span>
            <span className="absolute top-1.5 right-2 text-[9px] text-gold-500/30">☷</span>
            <span className="absolute bottom-1.5 left-2 text-[9px] text-gold-500/30">☵</span>
            <span className="absolute bottom-1.5 right-2 text-[9px] text-gold-500/30">☲</span>

            {/* "塔罗" text */}
            <span
              className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] tracking-[0.2em] text-gold-500/25"
              style={{ fontFamily: 'serif' }}
            >
              塔 羅
            </span>
          </div>

          {/* ───── CARD FRONT ───── */}
          <div
            className="absolute inset-0 rounded-xl [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden flex flex-col items-center justify-center px-2"
            style={{
              background: 'linear-gradient(180deg, #1c1814 0%, #14111a 50%, #1c1814 100%)',
              border: '2px solid rgba(168, 136, 45, 0.6)',
              boxShadow: selected
                ? '0 0 24px rgba(168, 136, 45, 0.6), inset 0 0 40px rgba(168, 136, 45, 0.08)'
                : 'inset 0 0 30px rgba(0,0,0,0.4)',
            }}
          >
            {/* Inner border */}
            <div className="absolute inset-[5px] rounded-lg border border-gold-500/15 pointer-events-none" />

            {card ? (
              <>
                {/* Element indicator */}
                <div className="absolute top-2 left-2 text-[9px] text-gold-500/40">
                  {card.element === '火' ? '🔥' : card.element === '水' ? '💧' : card.element === '风' ? '💨' : card.element === '土' ? '🪨' : '✨'}
                </div>

                {/* Card number / suit indicator - top right */}
                <div className="absolute top-2 right-2 text-[6px] text-gold-500/30 tracking-widest">
                  {card.nameEn.toUpperCase()}
                </div>

                {/* Chinese name */}
                <p
                  className="font-serif text-gold-400 text-center leading-tight mb-0.5"
                  style={{ fontSize: dims.fs, fontWeight: 600 }}
                >
                  {card.name}
                </p>

                {/* English name */}
                <p
                  className="text-gray-500 text-center leading-tight mb-1"
                  style={{ fontSize: dims.fsEn }}
                >
                  {card.nameEn}
                </p>

                {/* Element label */}
                <p
                  className="text-jade-400 text-center"
                  style={{ fontSize: dims.fsEl }}
                >
                  {card.element}
                </p>

                {/* Bottom decoration */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
              </>
            ) : (
              <span className="text-2xl opacity-30">🃏</span>
            )}
          </div>
        </div>
      </button>

      {/* Position label below card */}
      {positionLabel && (
        <span className="text-[10px] text-gray-500 text-center leading-tight max-w-[var(--label-w)]"
          style={{ '--label-w': `${dims.w + 20}px` } as React.CSSProperties}
        >
          {positionLabel}
        </span>
      )}
    </div>
  )
}
