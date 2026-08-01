'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale, useT } from '@/lib/i18n'

// ── 64卦数据 ──
import { HD, type HexagramData } from './hexagram-data'
const H = HD

const TRI: Record<string, string> = { '乾': '☰', '兑': '☱', '离': '☲', '震': '☳', '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷' }

// ── 八宫五行六亲 ──
const GONG_WX: Record<string, string> = { '乾': '金', '兑': '金', '离': '火', '震': '木', '巽': '木', '坎': '水', '艮': '土', '坤': '土' }
const WX_SHENG: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
const WX_KE: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }

function getLiuQin(yaoWx: string, gongWx: string): string {
  if (yaoWx === gongWx) return '兄弟'
  if (WX_SHENG[gongWx] === yaoWx) return '子孙'
  if (WX_SHENG[yaoWx] === gongWx) return '父母'
  if (WX_KE[gongWx] === yaoWx) return '妻财'
  return '官鬼'
}

const LIUQIN_COLOR: Record<string, string> = {
  '父母': 'text-gold-600', '兄弟': 'text-shui-600', '子孙': 'text-jade-600',
  '妻财': 'text-tu-600', '官鬼': 'text-zhuhong',
}

// ── 卦宫归属 ──
const GONG_SHIXU: Record<string, number[]> = {
  '乾': [1,44,13,10,9,14,43,5], '坎': [29,59,60,3,63,47,48,6],
  '艮': [52,53,62,56,31,33,39,15], '震': [51,16,40,54,55,34,17,24],
  '巽': [57,9,37,42,50,44,28,32], '离': [30,56,22,36,21,55,38,7],
  '坤': [2,20,35,45,16,12,46,11], '兑': [58,47,45,5,38,43,54,17],
}

function getGong(num: number): { gong: string; shiIdx: number; shiYao: number; yingYao: number } {
  for (const [gong, nums] of Object.entries(GONG_SHIXU)) {
    const idx = nums.indexOf(num)
    if (idx >= 0) {
      const yaoMap = [6, 1, 2, 3, 4, 5, 4, 3]
      const shi = yaoMap[idx] || 6
      const ying = shi <= 3 ? shi + 3 : shi - 3
      return { gong, shiIdx: idx, shiYao: shi, yingYao: ying }
    }
  }
  return { gong: '乾', shiIdx: 0, shiYao: 6, yingYao: 3 }
}

// ── 爻五行 ──
const YAO_WX: Record<string, string[]> = {
  '乾': ['木','木','土','土','水','水'], '坤': ['土','土','火','火','木','木'],
  '震': ['木','木','土','土','金','金'], '巽': ['木','木','火','火','金','金'],
  '坎': ['木','木','土','土','金','金'], '离': ['木','木','土','土','金','金'],
  '艮': ['木','木','水','水','金','金'], '兑': ['木','木','土','土','金','金'],
}

// ── 铜钱动画组件 (大尺寸，正反面清晰可见) ──
function Coin({ result, settled, delay, tossing, size }: { result: boolean; settled: boolean; delay: number; tossing: boolean; size?: 'lg' | 'xl' }) {
  const isLg = size === 'lg'
  const isXl = size === 'xl'
  const dims = isXl ? 'w-20 h-20 sm:w-24 sm:h-24' : isLg ? 'w-16 h-16 sm:w-18 sm:h-18' : 'w-12 h-12 sm:w-14 sm:h-14'
  const hole = isXl ? 'w-5 h-5' : isLg ? 'w-4 h-4' : 'w-3 h-3'
  const borderW = isXl ? '4px' : isLg ? '3px' : '2px'
  const textSize = isXl ? 'text-[11px]' : isLg ? 'text-[9px]' : 'text-[7px]'
  const tinyText = isXl ? 'text-[8px]' : isLg ? 'text-[7px]' : 'text-[6px]'

  const transformStyle = tossing
    ? undefined
    : settled
      ? `rotateY(${result ? 0 : 180}deg)`
      : 'rotateY(0deg)'

  return (
    <div className={`relative ${dims}`} style={{ perspective: '400px' }}>
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: settled ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          transform: transformStyle,
          animation: tossing ? `coinFlip${delay % 3} 0.48s linear infinite` : 'none',
        }}
      >
        {/* 正面：字面（乾隆通宝） */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            background: 'radial-gradient(circle at 35% 35%, #f8e8b0, #d4a030 40%, #c89020 65%, #8b6508 100%)',
            border: `${borderW} solid #b8860b`,
            boxShadow: '0 3px 12px rgba(0,0,0,0.6), inset 0 1px 4px rgba(255,255,200,0.5), inset 0 -2px 4px rgba(0,0,0,0.2)',
          }}
        >
          {/* 方孔 */}
          <div className={`${hole} border-2 border-gold-500/60 rounded-[2px] bg-dark-950/50`} />
          {/* 四字 */}
          <span className={`absolute ${textSize} font-bold text-jade-500/80`} style={{ top: isXl ? '4px' : '2px' }}>乾</span>
          <span className={`absolute ${textSize} font-bold text-jade-500/80`} style={{ bottom: isXl ? '4px' : '2px' }}>隆</span>
          <span className={`absolute ${textSize} font-bold text-jade-500/80`} style={{ left: isXl ? '4px' : '2px' }}>通</span>
          <span className={`absolute ${textSize} font-bold text-jade-500/80`} style={{ right: isXl ? '4px' : '2px' }}>寶</span>
          {/* 内圈 */}
          <div className={`absolute inset-2 rounded-full border border-gold-500/15 pointer-events-none`} />
        </div>
        {/* 背面：满文 */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'radial-gradient(circle at 35% 35%, #f0d888, #c89020 40%, #b07810 65%, #7a5c00 100%)',
            border: `${borderW} solid #a07828`,
            boxShadow: '0 3px 12px rgba(0,0,0,0.6), inset 0 1px 4px rgba(255,255,200,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
          }}
        >
          <div className={`${hole} border-2 border-gold-500/60 rounded-[2px] bg-dark-950/50`} />
          <div className="absolute inset-2 rounded-full border border-gold-500/25 pointer-events-none" />
          <div className="absolute inset-3 rounded-full border border-gold-500/15 pointer-events-none" />
          <span className={`absolute ${tinyText} text-jade-500/50 font-bold`} style={{ top: isXl ? '5px' : '3px' }}>滿</span>
          <span className={`absolute ${tinyText} text-jade-500/50 font-bold`} style={{ bottom: isXl ? '5px' : '3px' }}>文</span>
        </div>
      </div>
    </div>
  )
}

// ── 单爻渲染 ──
function YaoLine({ v, idx, shiYao, yingYao, gong }: { v: number; idx: number; shiYao: number; yingYao: number; gong: string; hexNum: number }) {
  const isShi = idx === shiYao; const isYing = idx === yingYao
  const yaos = YAO_WX[gong] || YAO_WX['乾']
  const wx = yaos[6 - idx] || '土'
  const lq = getLiuQin(wx, GONG_WX[gong] || '金')
  return (
    <div className={`flex items-center gap-1 py-0.5 ${isShi || isYing ? 'bg-gold-900/15 -mx-2 px-2 rounded' : ''}`}>
      <span className="w-5 text-[9px] text-gray-500 text-right">{idx}</span>
      {v === 0 ? (
        <><span className="block w-5 h-0.5 bg-gold-400 rounded" /><span className="block w-2 h-0.5 bg-dark-700" /><span className="block w-5 h-0.5 bg-gold-400 rounded" /></>
      ) : (
        <><span className="block w-5 h-0.5 bg-gold-500/10 rounded" /><span className="block w-0.5 h-0.5 bg-gold-500/10 rounded-full" /><span className="block w-5 h-0.5 bg-gold-500/10 rounded" /></>
      )}
      <span className={`text-[9px] ${LIUQIN_COLOR[lq]} w-8`}>{lq}</span>
      {isShi && <span className="text-[8px] text-gold-400 font-bold ml-1">世</span>}
      {isYing && <span className="text-[8px] text-gold-500 ml-1">应</span>}
    </div>
  )
}

// ── 动爻标记 ──
function YaoLineWithChange({ v, idx, shiYao, yingYao, gong, hexNum, changing }: { v: number; idx: number; shiYao: number; yingYao: number; gong: string; hexNum: number; changing: number[] }) {
  const isChanging = changing.includes(6 - idx)
  return (
    <div className="flex items-center gap-1 py-0.5">
      <YaoLine v={v} idx={idx} shiYao={shiYao} yingYao={yingYao} gong={gong} hexNum={hexNum} />
      {isChanging && (
        <span className="text-[8px] text-gold-500 animate-pulse">○</span>
      )}
    </div>
  )
}

export default function LiuyaoClient() {
  const { locale } = useLocale()
  const getT = useT()
  const [mode, setMode] = useState<'auto' | 'manual'>('manual')
  const [result, setResult] = useState<{lines: number[]; changing: number[]; hexagram: HexagramData; cv: HexagramData | null; gong: string; shiYao: number; yingYao: number} | null>(null)

  // ── 手动摇卦状态 ──
  const [manualLines, setManualLines] = useState<number[]>([])
  const [manualChangings, setManualChangings] = useState<number[]>([])
  const [isTossing, setIsTossing] = useState(false)
  const [coinResults, setCoinResults] = useState<boolean[]>([])
  const [coinSettled, setCoinSettled] = useState(false)
  const [tossCount, setTossCount] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [currentLineDesc, setCurrentLineDesc] = useState('')

  // ── 自动起卦动画状态 ──
  const [autoAnimating, setAutoAnimating] = useState(false)
  const [autoAnimLines, setAutoAnimLines] = useState<number[]>([])
  const [autoAnimStep, setAutoAnimStep] = useState(0)
  const [autoCoinPhase, setAutoCoinPhase] = useState<'idle'|'tossing'|'landed'|'done'>('idle')  // idle→tossing(翻转)→landed(落定展示)→done(该爻完成)
  const [autoCurrentCoins, setAutoCurrentCoins] = useState<boolean[]>([true, false, true])  // 当前展示的三枚铜钱
  const [autoCurrentDesc, setAutoCurrentDesc] = useState('')                 // 当前爻文字描述
  const autoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const tossCoin = () => Math.random() < 0.5

  // ── 解析投掷结果 ──
  const parseToss = (heads: number) => {
    // 3阳 = 老阳 (变爻) → line 0, changing
    // 2阳1阴 = 少阳 → line 1
    // 1阳2阴 = 少阴 → line 0
    // 3阴 = 老阴 (变爻) → line 1, changing
    if (heads === 3) return { line: 0, changing: true }
    if (heads === 2) return { line: 1, changing: false }
    if (heads === 1) return { line: 0, changing: false }
    return { line: 1, changing: true }
  }

  const getLineDesc = (heads: number) => {
    if (heads === 3) return '老阳 ▬▬▬ ⟶ ▬ ▬'
    if (heads === 2) return '少阳 ▬▬▬▬▬'
    if (heads === 1) return '少阴 ▬ ▬'
    return '老阴 ▬ ▬ ⟶ ▬▬▬'
  }

  // ── 手动摇卦：一次投掷 ──
  const doToss = () => {
    if (isTossing || tossCount >= 6) return
    setIsTossing(true)
    setCoinSettled(false)
    setCoinResults([])
    setShowResult(false)

    // 预计算结果
    const coins = [tossCoin(), tossCoin(), tossCoin()]

    // 先展示翻转动效
    setTimeout(() => {
      setCoinResults(coins)
      setCoinSettled(true)
      const heads = coins.filter(Boolean).length
      const { line, changing } = parseToss(heads)
      setCurrentLineDesc(getLineDesc(heads))

      const newLines = [...manualLines, line]
      const newChangings = changing ? [...manualChangings, tossCount] : manualChangings
      setManualLines(newLines)
      setManualChangings(newChangings)
      setIsTossing(false)

      // 1.5s后淡出当前结果
      setTimeout(() => {
        setShowResult(true)
        setTossCount(tossCount + 1)
        if (tossCount + 1 >= 6) {
          finishCast(newLines, newChangings)
        }
      }, 800)
    }, 1300)
  }

  // ── 自动起卦（带动画） ──
  const autoCast = () => {
    if (autoAnimating) return
    setResult(null)
    setManualLines([])
    setManualChangings([])
    setTossCount(0)
    setAutoAnimating(true)
    setAutoAnimLines([])
    setAutoAnimStep(0)
    setAutoCoinPhase('idle')
    setAutoCurrentDesc('')

    // 预生成全部六爻结果（不展示，只是后台准备）
    const lines: number[] = []
    const changing: number[] = []
    const allCoins: boolean[][] = []
    for (let i = 0; i < 6; i++) {
      const coins = [tossCoin(), tossCoin(), tossCoin()]
      allCoins.push(coins)
      const heads = coins.filter(Boolean).length
      const { line, changing: ch } = parseToss(heads)
      lines.push(line)
      if (ch) changing.push(i)
    }

    // 逐爻动画：每爻三阶段 → 翻转1.5s → 落定展示2s（让客户看清楚结果）→ 下一爻
    let step = 0
    const TOSS_MS = 1500   // 铜钱翻转时长
    const LAND_MS = 2000   // 落定展示时长（让用户清楚看到三枚铜钱的正/反面）

    const tossNext = () => {
      if (step >= 6) {
        setAutoAnimating(false)
        setAutoCoinPhase('idle')
        finishCast(lines, changing)
        return
      }

      const coins = allCoins[step]

      // === 阶段1: 开始翻转 ===
      // 铜钱进入翻转状态（显示随机面，CSS动画实际旋转）
      setAutoCoinPhase('tossing')
      setAutoCurrentCoins([Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5])
      setAutoCurrentDesc('')

      // === 阶段2: 时间到，铜钱落定 ===
      autoTimerRef.current = setTimeout(() => {
        // 设置正确的铜钱结果（setAutoCurrentCoins + setAutoCoinPhase('landed') 同步）
        // 这样 Coin 组件会从 tossing→animation:none 切换到 transform:rotateY，
        // 铜钱翻转显现出真实的正/背面结果
        setAutoCurrentCoins(coins)
        setAutoCoinPhase('landed')

        const heads = coins.filter(Boolean).length
        setAutoCurrentDesc(getLineDesc(heads))

        // 将这一爻加入已完成的卦象进度
        setAutoAnimLines(prev => [...prev, lines[step]])
        setAutoAnimStep(step + 1)

        // === 阶段3: 停留展示后，进入下一爻 ===
        autoTimerRef.current = setTimeout(() => {
          step++
          tossNext()
        }, LAND_MS)
      }, TOSS_MS)
    }

    // 开始第一爻
    autoTimerRef.current = setTimeout(tossNext, 400)
  }

  useEffect(() => {
    return () => { if (autoTimerRef.current) clearTimeout(autoTimerRef.current) }
  }, [])

  // ── 完成起卦 ──
  const finishCast = (lines: number[], changing: number[]) => {
    const lower = lines.slice(0, 3).reverse(); const upper = lines.slice(3, 6).reverse()
    let li = 0, ui = 0; for (let i = 0; i < 3; i++) { li = (li << 1) | lower[i]; ui = (ui << 1) | upper[i] }
    const num = ui * 8 + li + 1
    const h = H[num] || H[1]
    const { gong, shiYao, yingYao } = getGong(num)
    let cv: HexagramData | null = null
    if (changing.length > 0) {
      const cl = lines.map((v, i) => changing.includes(i) ? (v === 0 ? 1 : 0) : v)
      const cl2 = cl.slice(0, 3).reverse(); const cu = cl.slice(3, 6).reverse()
      let cli = 0, cui = 0; for (let i = 0; i < 3; i++) { cli = (cli << 1) | cl2[i]; cui = (cui << 1) | cu[i] }
      const cnum = cui * 8 + cli + 1
      cv = H[cnum] || H[1]
    }
    setResult({ lines, changing, hexagram: h, cv, gong, shiYao, yingYao })
  }

  // ── 重置 ──
  const reset = () => {
    setResult(null)
    setManualLines([])
    setManualChangings([])
    setTossCount(0)
    setCoinResults([])
    setCoinSettled(false)
    setIsTossing(false)
    setShowResult(false)
    setCurrentLineDesc('')
    setAutoAnimating(false)
    setAutoAnimLines([])
    setAutoAnimStep(0)
    setAutoCoinPhase('idle')
    setAutoCurrentDesc('')
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
  }

  const r = result
  const YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']
  const completedCount = manualLines.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{getT('liuyaoPage.title')}</h1>
      <p className="text-gray-400 mb-6">{getT('liuyaoPage.subtitle')}</p>

      {/* 模式切换 */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => { reset(); setMode('manual') }}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${mode === 'manual' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>
          {getT('liuyaoPage.modeManual')}
        </button>
        <button onClick={() => { reset(); setMode('auto') }}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${mode === 'auto' ? 'bg-gold-600 text-dark-900' : 'bg-dark-700 text-gray-400 border border-dark-600'}`}>
          {getT('liuyaoPage.modeAuto')}
        </button>
      </div>

      {/* ============ 手动摇卦区域 ============ */}
      {mode === 'manual' && !r && (
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-8">
          {/* 卦象进度 */}
          <div className="flex justify-center mb-6">
            <div className="flex flex-col-reverse items-center gap-0.5">
              {[5, 4, 3, 2, 1, 0].map(i => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-[9px] text-gray-500 w-8 text-right">{YAO_NAMES[i]}</span>
                  {i < completedCount ? (
                    manualLines[i] === 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="block w-6 h-0.5 bg-gold-400 rounded" />
                        <span className="block w-2 h-0.5 bg-dark-700" />
                        <span className="block w-6 h-0.5 bg-gold-400 rounded" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="block w-6 h-0.5 bg-gold-500/10 rounded" />
                        <span className="block w-0.5 h-0.5 bg-gold-500/10 rounded-full" />
                        <span className="block w-6 h-0.5 bg-gold-500/10 rounded" />
                      </div>
                    )
                  ) : (
                    <span className="text-gray-700 text-xs w-[58px] text-center">
                      {i === completedCount ? (isTossing ? '...' : '←') : '—'}
                    </span>
                  )}
                  {manualChangings.includes(i) && (
                    <span className="text-[8px] text-gold-500">○动</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 铜钱展示区 - 大尺寸 */}
          <div className="flex items-center justify-center gap-5 sm:gap-7 mb-5 min-h-[100px]">
            {[0, 1, 2].map(i => (
              <Coin
                key={`${tossCount}-${i}`}
                result={coinResults[i] ?? true}
                settled={coinSettled}
                delay={i}
                tossing={isTossing}
                size="lg"
              />
            ))}
          </div>

          {/* 当前爻说明 */}
          {coinSettled && !showResult && (
            <div className="text-center mb-3 animate-fadeIn">
              <p className="text-sm text-gray-300">
                {coinResults.filter(Boolean).length} 阳 {coinResults.filter(b => !b).length} 阴
              </p>
              <p className="text-sm font-semibold text-gold-400 mt-1">{currentLineDesc}</p>
            </div>
          )}

          {/* 摇卦按钮 */}
          <div className="text-center">
            {tossCount < 6 ? (
              <button
                onClick={doToss}
                disabled={isTossing}
                className="bg-gold-600 hover:bg-gold-500 disabled:bg-dark-600 disabled:text-gray-500 text-dark-900 font-semibold px-8 py-3 rounded-lg text-lg transition-all active:scale-95 disabled:cursor-not-allowed"
              >
                {isTossing ? getT('liuyaoPage.tossing') : getT('liuyaoPage.tossButton').replace('{n}', String(tossCount + 1))}
              </button>
            ) : (
              <p className="text-gold-400 text-sm">{locale === 'en' ? 'Hexagram formed ↓' : locale === 'ja' ? '卦已完成 ↓' : locale === 'ko' ? '괘 형성 ↓' : '卦已成形 ↓'}</p>
            )}
            <p className="text-[10px] text-gray-600 mt-2">
              {tossCount < 6 ? getT('liuyaoPage.progress').replace('{n}', String(completedCount)) : getT('liuyaoPage.complete')}
            </p>
          </div>

          {/* 已完成的爻记录 */}
          {completedCount > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-600">
              <p className="text-[10px] text-gray-500 mb-2">{getT('liuyaoPage.tossRecord')}</p>
              <div className="flex flex-wrap gap-1.5">
                {manualLines.map((v, i) => (
                  <span key={i} className={`text-[10px] px-2 py-0.5 rounded ${
                    v === 0
                      ? 'bg-gold-900/30 text-gold-400 border border-gold-700/40'
                      : 'bg-gold-500/10 text-gold-500 border border-gold-500/40'
                  }`}>
                    {YAO_NAMES[i]} {v === 0 ? '⚊' : '⚋'}
                    {manualChangings.includes(i) && ' ○'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ 自动起卦区域 ============ */}
      {mode === 'auto' && !r && (
        <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-8 mb-8 min-h-[420px]">
          {autoAnimating ? (
            <div className="flex flex-col items-center gap-6">
              {/* 当前爻次 */}
              <div className="flex items-center gap-3">
                <span className="text-gold-400 text-lg animate-pulse">☯</span>
                <span className="text-gold-400 text-base font-serif">
                  {autoAnimStep >= 6 ? (locale === 'en' ? 'Hexagram formed!' : locale === 'ja' ? '卦成！' : locale === 'ko' ? '괘 완성!' : '卦成！') : `${locale === 'en' ? 'Line' : locale === 'ja' ? '第' : locale === 'ko' ? '제 ' : '第 '}${autoAnimStep + 1}${locale === 'en' ? '' : locale === 'ja' ? '爻' : locale === 'ko' ? '효' : '爻'}`}
                </span>
              </div>

              {/* 三枚大铜钱 —— 独立展示当前爻的真实结果 */}
              <div className="flex items-center justify-center gap-6 sm:gap-8 py-4 min-h-[120px]">
                {[0, 1, 2].map(i => (
                  <Coin
                    key={`auto-${autoAnimStep}-${i}`}
                    result={autoCurrentCoins[i] ?? true}
                    settled={autoCoinPhase === 'landed'}
                    delay={i}
                    tossing={autoCoinPhase === 'tossing'}
                    size="xl"
                  />
                ))}
              </div>

              {/* 当前爻文字说明 - 落定后才显示 */}
              {autoCoinPhase === 'landed' && autoCurrentDesc && (
                <div className="text-center animate-fadeIn bg-dark-900/60 rounded-lg px-6 py-3 border border-gold-900/30">
                  <p className="text-sm text-gray-300">
                    {autoCurrentCoins.filter(Boolean).length} {locale === 'en' ? 'heads' : locale === 'ja' ? '陽' : locale === 'ko' ? '양' : '阳'} {autoCurrentCoins.filter(b => !b).length} {locale === 'en' ? 'tails' : locale === 'ja' ? '陰' : locale === 'ko' ? '음' : '阴'}
                  </p>
                  <p className="text-base font-bold text-gold-400 mt-1">{autoCurrentDesc}</p>
                </div>
              )}

              {/* 卦象进度 - 逐爻构建 */}
              <div className="flex flex-col-reverse items-center gap-1 w-64 mt-2">
                {[5, 4, 3, 2, 1, 0].map(i => {
                  const isCompleted = i < autoAnimStep
                  const isCurrent = i === autoAnimStep
                  return (
                    <div key={i} className="flex items-center gap-2 w-full justify-center">
                      <span className="text-[10px] text-gray-500 w-10 text-right">{YAO_NAMES[i]}</span>
                      <div className="flex-1 flex justify-center">
                        {isCompleted ? (
                          autoAnimLines[i] === 0 ? (
                            <div className="flex items-center gap-2 animate-fadeIn">
                              <span className="block w-8 h-0.5 bg-gold-400 rounded" />
                              <span className="block w-2 h-0.5 bg-dark-700" />
                              <span className="block w-8 h-0.5 bg-gold-400 rounded" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 animate-fadeIn">
                              <span className="block w-8 h-0.5 bg-gold-500/50 rounded" />
                              <span className="block w-0.5 h-0.5 bg-gold-500/50 rounded-full" />
                              <span className="block w-8 h-0.5 bg-gold-500/50 rounded" />
                            </div>
                          )
                        ) : isCurrent ? (
                          autoCoinPhase === 'landed' ? (
                            // 当前爻已落定，显示真实爻线
                            autoAnimLines[i] === 0 ? (
                              <div className="flex items-center gap-2 animate-fadeIn">
                                <span className="block w-8 h-0.5 bg-gold-400 rounded" />
                                <span className="block w-2 h-0.5 bg-dark-700" />
                                <span className="block w-8 h-0.5 bg-gold-400 rounded" />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 animate-fadeIn">
                                <span className="block w-8 h-0.5 bg-gold-500/50 rounded" />
                                <span className="block w-0.5 h-0.5 bg-gold-500/50 rounded-full" />
                                <span className="block w-8 h-0.5 bg-gold-500/50 rounded" />
                              </div>
                            )
                          ) : (
                            <span className="text-gold-400 text-sm animate-pulse">●●●</span>
                          )
                        ) : (
                          <span className="text-gray-700 text-xs">━━━━</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-[10px] text-gray-500">
                {autoCoinPhase === 'tossing' ? '🪙 ' + (locale === 'en' ? 'Coins flipping...' : locale === 'ja' ? '銅銭が回転中...' : locale === 'ko' ? '동전이 회전 중...' : '铜钱正在翻转中...') : autoCoinPhase === 'landed' ? (locale === 'en' ? '✓ This line set, moving to next...' : locale === 'ja' ? '✓ 本爻確定、次爻へ...' : locale === 'ko' ? '✓ 이 효 확정, 다음 효로...' : '✓ 本爻已定，即将进入下一爻...') : ''}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[360px] gap-6">
              {/* 静态展示三枚大铜钱 */}
              <div className="flex items-center justify-center gap-6 sm:gap-8">
                {[true, false, true].map((r, i) => (
                  <div key={i} className={`relative ${i === 1 ? '-mt-3' : ''}`} style={{ opacity: 0.6 }}>
                    <Coin result={r} settled delay={i} tossing={false} size="xl" />
                  </div>
                ))}
              </div>

              <p className="text-gray-400 text-sm">{getT('liuyaoPage.autoDesc')}</p>

              <button onClick={autoCast} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-10 py-4 rounded-lg text-xl transition-all active:scale-95 shadow-lg shadow-gold-900/20">
                {getT('liuyaoPage.autoCast')}
              </button>

              <p className="text-[10px] text-gray-600">{getT('liuyaoPage.autoSubtitle')}</p>
            </div>
          )}
        </div>
      )}

      {/* ============ 解卦结果 ============ */}
      {r && (() => {
        const hd = r.hexagram as HexagramData
        const cvd = r.cv as HexagramData | null
        return (
        <div className="space-y-4 animate-fadeIn">
          {/* 卦名 & 卦象 */}
          <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
            <div className="text-center mb-3">
              <p className="text-2xl text-gold-400 font-serif mb-1">
                {TRI[hd.upper]}{TRI[hd.lower]} {hd.name}
              </p>
              <p className="text-xs text-gray-400">
                第{hd.num}卦 · {hd.upper}上{hd.lower}下 · {r.gong}宫{GONG_WX[r.gong]}属性
              </p>
            </div>

            {/* 卦象展示 */}
            <div className="flex justify-center mb-3">
              <div className="flex flex-col items-center">
                {r.lines.map((v: number, i: number) => (
                  <YaoLineWithChange
                    key={5 - i}
                    v={v}
                    idx={6 - i}
                    shiYao={r.shiYao}
                    yingYao={r.yingYao}
                    gong={r.gong}
                    hexNum={hd.num}
                    changing={r.changing}
                  />
                ))}
              </div>
            </div>

            {r.changing.length > 0 && (
              <p className="text-xs text-gold-500 text-center mb-3">
                动爻：第{r.changing.map((c: number) => 6 - c).join('、')}爻
              </p>
            )}
          </div>

          {/* 卦辞 - 核心 */}
          <div className="bg-dark-800/80 rounded-xl border border-gold-600/30 p-5">
            <h3 className="text-xs text-gold-500 font-bold mb-2 tracking-widest">⚜ 卦辞</h3>
            <p className="text-sm text-gray-200 leading-relaxed">{hd.guaci}</p>
          </div>

          {/* 象辞 */}
          <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
            <h3 className="text-xs text-gray-500 font-bold mb-2 tracking-widest">📜 象辞</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{hd.xiangci}</p>
          </div>

          {/* 三位大师解读（三栏）*/}
          <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
            <h3 className="text-xs text-gray-500 font-bold mb-3 tracking-widest">🧙 三位大师解卦</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-dark-900/60 rounded-lg p-3 border border-dark-700">
                <p className="text-[10px] text-gold-600 font-bold mb-1">邵雍 · 河洛理数</p>
                <p className="text-[12px] text-gray-300 leading-relaxed">{hd.shaoyong}</p>
              </div>
              <div className="bg-dark-900/60 rounded-lg p-3 border border-dark-700">
                <p className="text-[10px] text-gold-600 font-bold mb-1">傅佩荣 · 解卦手册</p>
                <p className="text-[12px] text-gray-300 leading-relaxed">{hd.fupeirong}</p>
              </div>
              <div className="bg-dark-900/60 rounded-lg p-3 border border-dark-700">
                <p className="text-[10px] text-gold-600 font-bold mb-1">张铭仁 · 解卦</p>
                <p className="text-[12px] text-gray-300 leading-relaxed">{hd.zhangmingren}</p>
              </div>
            </div>
          </div>

          {/* 六大领域解读 */}
          <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
            <h3 className="text-xs text-gray-500 font-bold mb-3 tracking-widest">📋 六领域建议</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: '💼 事业', key: 'career' },
                { label: '🏪 经商', key: 'business' },
                { label: '🏆 求名', key: 'fame' },
                { label: '✈ 外出', key: 'travel' },
                { label: '💕 婚恋', key: 'love' },
                { label: '🎯 决策', key: 'decision' },
              ].map(item => (
                <div key={item.key} className="bg-dark-900/60 rounded-lg p-2.5 border border-dark-700">
                  <p className="text-[10px] text-gold-600 font-bold mb-0.5">{item.label}</p>
                  <p className="text-[12px] text-gray-300 leading-relaxed">{hd[item.key as keyof HexagramData]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 变卦 */}
          {cvd && (
            <div className="bg-dark-800/80 rounded-xl border border-gold-500/30 p-5">
              <div className="text-center mb-2">
                <p className="text-xs text-gold-500 mb-1">→ 变卦（动爻变化后的结果）</p>
                <p className="text-lg text-gold-400 font-serif">
                  {TRI[cvd.upper]}{TRI[cvd.lower]} {cvd.name}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">第{cvd.num}卦 · {cvd.upper}上{cvd.lower}下</p>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{cvd.guaci}</p>
              <p className="text-xs text-gray-400 leading-relaxed mt-2">{cvd.fupeirong}</p>
            </div>
          )}

          {/* 重新起卦 */}
          <div className="text-center">
            <button onClick={reset} className="text-xs text-gray-500 hover:text-gold-400 underline transition-colors">
              {locale === 'en' ? 'Recast' : locale === 'ja' ? '再起卦' : locale === 'ko' ? '다시 점치기' : '重新起卦'}
            </button>
          </div>
        </div>
        )
      })()}
    </div>
  )
}
