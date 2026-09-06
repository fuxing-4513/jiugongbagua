'use client'

import { useEffect, useRef, useState } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import {
  PALACES, CATS, LUCK, buildWalk, guessCategory,
  ELEMENT_LEGEND,
} from './xiaoliuren-data'
import type { CatKey, Palace, WalkEv, PhaseName } from './xiaoliuren-data'

/* ── 盘面几何（viewBox 480×480，中心 240,240） ── */
const CX = 240
const CY = 240
const NODE_R = 150        // 宫位圆心到盘心距离
const NODE_RING = 50      // 宫位圆半径
const ARC_R = 209         // 走盘轨迹弧半径
const deg = (i: number) => -90 + i * 60
const pt = (a: number, r: number) => ({
  x: CX + r * Math.cos((a * Math.PI) / 180),
  y: CY + r * Math.sin((a * Math.PI) / 180),
})
// 弧线：顺时针从 a1° 画到 a2°
function arcPath(a1: number, a2: number, r: number) {
  const p1 = pt(a1, r)
  const p2 = pt(a2, r)
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
}

/* ── 推演状态 ── */
interface RunState {
  walk: ReturnType<typeof buildWalk>
  evs: WalkEv[]          // 展示用事件序列
  ranges: [number, number][] // 每阶段（月/日/时）在 evs 中的 [起, 止]
  pace: number
  tick: number           // 当前事件下标
  playing: boolean
  done: boolean
}

const PHASE_NAMES: PhaseName[] = ['月', '日', '时']
const NODE_COORDS = PALACES.map((_, i) => pt(deg(i), NODE_R))

export default function XiaoliurenClient() {
  const [n1, setN1] = useState('3')
  const [n2, setN2] = useState('6')
  const [n3, setN3] = useState('9')
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')

  const [run, setRun] = useState<RunState | null>(null)
  const [browse, setBrowse] = useState<number | null>(null) // 手动浏览某宫（null = 无）
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  /* ── 读数 ── */
  const readNums = (): { a: number; b: number; c: number } | null => {
    const a = parseInt(n1, 10)
    const b = parseInt(n2, 10)
    const c = parseInt(n3, 10)
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || a < 1 || b < 1 || c < 1) {
      setError('请把三个数字都填上，1 以上的整数即可。')
      return null
    }
    setError('')
    return { a, b, c }
  }

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = null }

  const stopRun = (runState: RunState | null) => {
    clearTimer()
    setRun(runState)
  }

  const startRun = (withAnim: boolean) => {
    const nums = readNums()
    if (!nums) return
    const walk = buildWalk(nums.a, nums.b, nums.c)
    const perCount = walk.total <= 30            // 数位太多就自动简化成三落宫演示
    const display: WalkEv[] = perCount
      ? walk.evs
      : [walk.evs[nums.a - 1], walk.evs[nums.a + nums.b - 1], walk.evs[walk.total - 1]]
    // 各阶段在展示序列中的范围
    const ranges: [number, number][] = []
    let ph = display[0].phase
    let start = 0
    display.forEach((e, i) => {
      if (e.phase !== ph) {
        ranges.push([start, i - 1])
        ph = e.phase
        start = i
      }
    })
    ranges.push([start, display.length - 1])
    const pace = perCount ? 330 : 1100
    if (withAnim) {
      setBrowse(null)
      stopRun({ walk, evs: display, ranges, pace, tick: 0, playing: true, done: false })
    } else {
      setBrowse(null)
      stopRun({ walk, evs: display, ranges, pace, tick: display.length - 1, playing: false, done: true })
    }
  }

  // 动画循环：当前拍展示后，延迟推进到下一拍 / 收尾
  useEffect(() => {
    if (!run || !run.playing || run.done) return
    if (run.tick >= run.evs.length - 1) {
      const finish = setTimeout(() => {
        setRun(prev => (prev && prev.playing ? { ...prev, playing: false, done: true } : prev))
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 280)
      }, run.pace + 500)
      timerRef.current = finish
      return
    }
    const t = setTimeout(() => {
      setRun(prev => prev && prev.playing && prev.tick === run.tick ? { ...prev, tick: prev.tick + 1 } : prev)
    }, run.pace)
    timerRef.current = t
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.tick, run?.playing])

  const resetAll = () => {
    stopRun(null)
    setBrowse(null)
    setQuestion('')
    setN1('3'); setN2('6'); setN3('9')
  }

  const randomFill = () => {
    const r = (m: number) => String(Math.floor(Math.random() * m) + 1)
    setN1(r(12)); setN2(r(12)); setN3(r(12))
    setError('')
  }

  const fillExample = (a: number, b: number, c: number) => {
    setN1(String(a)); setN2(String(b)); setN3(String(c)); setError('')
  }

  /* ── 当前展示的掌诀：优先手动浏览，其次推演结果 ── */
  const ev = run ? run.evs[run.tick] : null
  const shownNode = browse !== null ? browse : run && run.done ? run.walk.finalNode : null
  const shownPalace = shownNode !== null ? PALACES[shownNode] : null
  const catHit = guessCategory(question)

  // 已走过的弧段数：当前数到的事件 = 从大安起的累计步数（同宫起数不额外前进）
  let lit = 0
  if (run && run.tick >= 0 && ev) {
    const p = PHASE_NAMES.indexOf(ev.phase)
    const before = p === 0 ? 0 : p === 1 ? run.walk.n1 - 1 : run.walk.n1 + run.walk.n2 - 2
    lit = Math.max(before + ev.count - 1, 0)
  }
  const litArcs = Math.min(lit, 6)

  const phaseStatus = (p: number): 'wait' | 'run' | 'done' => {
    if (!run) return 'wait'
    if (run.done) return 'done'
    const [s] = run.ranges[p]
    const t = run.tick
    if (t < s) return 'wait'
    const [, e] = run.ranges[p]
    return t <= e ? 'run' : 'done'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Breadcrumb items={[{ label: '全部工具', href: '/tools' }, { label: '小六壬' }]} />

      {/* ═══ 输入卡 ═══ */}
      <div className="rounded-2xl border border-amber-200/70 dark:border-amber-400/20 bg-white/85 dark:bg-[#171614]/85 p-5 md:p-6 mb-5">
        <div className="flex items-start gap-3 mb-1">
          <div className="text-2xl leading-none mt-0.5">☝️</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
              小六壬
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
              古法掐指六宫：大安 · 留连 · 速喜 · 赤口 · 小吉 · 空亡。心里默念想问的事，
              随手报三个数（或按农历月、日、时填），跟着盘面一步一步看它走到哪一宫。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 md:gap-3 mt-5">
          {[
            { v: n1, set: setN1, label: '第 1 个数', hint: '传统为月，1 起' },
            { v: n2, set: setN2, label: '第 2 个数', hint: '传统为日，1 起' },
            { v: n3, set: setN3, label: '第 3 个数', hint: '传统为时辰，1 起' },
          ].map(f => (
            <label key={f.label} className="block">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1">{f.label}</span>
              <input
                type="number" min={1} inputMode="numeric"
                value={f.v}
                disabled={!!run && run.playing}
                onChange={e => f.set(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center text-lg font-semibold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500/50 disabled:opacity-50"
              />
              <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-0.5">{f.hint}</span>
            </label>
          ))}
        </div>

        {/* 快捷报数 */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 mr-0.5">随手试试：</span>
          {[[3, 6, 9], [2, 5, 8], [4, 7, 10]].map(arr => (
            <button key={arr.join('')} onClick={() => fillExample(arr[0], arr[1], arr[2])}
              className="text-[10px] px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-300 transition-colors">
              {arr.join(' · ')}
            </button>
          ))}
          <button onClick={randomFill}
            className="text-[10px] px-2 py-1 rounded-full border border-violet-200 dark:border-violet-500/30 text-violet-600 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors">
            🎲 随机三数
          </button>
        </div>

        {/* 所问之事 */}
        <div className="mt-3.5">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 block mb-1">
            想问的事（选填，可点下面快捷问法）
          </span>
          <input
            value={question}
            disabled={!!run && run.playing}
            onChange={e => setQuestion(e.target.value)}
            placeholder="例如：最近这段合作能成吗？"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 disabled:opacity-50"
          />
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {CATS.map(c => (
              <button key={c.key} onClick={() => setQuestion(`想问问${c.label}：${c.icon} 我心里在惦记的事，会有好结果吗？`)}
                className="text-[10px] px-2 py-1 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors">
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-3">⚠️ {error}</p>}

        <div className="flex flex-wrap items-center gap-2.5 mt-4">
          <button
            onClick={() => startRun(true)}
            disabled={!!run && run.playing}
            className="px-5 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-[#241a02] font-semibold text-sm transition-all active:scale-95"
          >
            🔮 开始推演（分步动画）
          </button>
          <button
            onClick={() => startRun(false)}
            disabled={!!run && run.playing}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-300 text-sm transition-colors disabled:opacity-50"
          >
            直接出结果
          </button>
          <button onClick={resetAll}
            className="px-3 py-2.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            清空重来
          </button>
        </div>

        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
          起数口诀（白话版）：① 第 1 个数从「大安」起数；② 第 2 个数在上一数落下的宫继续数；
          ③ 第 3 个数同理——数完落下的那宫，就是这卦的掌诀。数字大就顺着盘多绕几圈，规则不变。
        </p>
      </div>

      {/* ═══ 盘面 + 推演台 ═══ */}
      <div className="rounded-2xl border border-amber-200/70 dark:border-amber-400/20 bg-white/85 dark:bg-[#171614]/85 p-5 md:p-6 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* ── SVG 六宫盘 ── */}
          <div className="mx-auto w-full max-w-[420px] select-none">
            <svg viewBox="0 0 480 480" className="w-full h-auto" role="img" aria-label="小六壬六宫掌诀盘">
              {/* 走盘轨迹：底弧 + 已走过的金弧 */}
              {PALACES.map((_, k) => {
                const a1 = deg(k) + 8
                const a2 = deg(k + 1) - 8
                const d = arcPath(a1, a2, ARC_R)
                const litNow = k < litArcs
                const mid = pt(deg(k) + 30, ARC_R)
                return (
                  <g key={k}>
                    <path d={d} fill="none"
                      className="stroke-gray-200 dark:stroke-gray-700"
                      strokeWidth={2.4} strokeLinecap="round" />
                    {litNow && (
                      <path d={d} fill="none"
                        className="stroke-gold-400 dark:stroke-gold-300"
                        strokeWidth={3} strokeLinecap="round" />
                    )}
                    {/* 方向箭头 */}
                    <g
                      transform={`translate(${mid.x.toFixed(2)} ${mid.y.toFixed(2)}) rotate(${(
                        (Math.atan2(Math.cos((deg(k) + 30) * Math.PI / 180), -Math.sin((deg(k) + 30) * Math.PI / 180)) * 180) / Math.PI
                      ).toFixed(1)})`}
                      className={litNow ? 'fill-gold-500 dark:fill-gold-300' : 'fill-gray-300 dark:fill-gray-600'}
                    >
                      <path d="M0 -4.4 L9.5 0 L0 4.4 Z" />
                    </g>
                  </g>
                )
              })}

              {/* 中心区 */}
              <circle cx={CX} cy={CY} r={62} fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth={1.2} />
              {run && run.playing && ev ? (
                <g>
                  <text x={CX} y={CY - 22} textAnchor="middle" fontSize={12}
                    className="fill-gray-500 dark:fill-gray-400">
                    {ev.phase}数 · 第 {ev.count} 数
                  </text>
                  <text x={CX} y={CY + 8} textAnchor="middle" fontSize={36} fontWeight={700} fontFamily="var(--font-serif)"
                    fill={PALACES[ev.node].hex}>
                    {PALACES[ev.node].name}
                  </text>
                  <text x={CX} y={CY + 28} textAnchor="middle" fontSize={11}
                    className="fill-gray-500 dark:fill-gray-400">
                    数到这里
                  </text>
                </g>
              ) : (
                <g>
                  <text x={CX} y={CY - 12} textAnchor="middle" fontSize={24} fontWeight={700}
                    fontFamily="var(--font-serif)"
                    className="fill-gold-500 dark:fill-gold-300">
                    六宫掌诀
                  </text>
                  <text x={CX} y={CY + 10} textAnchor="middle" fontSize={11}
                    className="fill-gray-500 dark:fill-gray-400">
                    顺时针掐数 · 大安起
                  </text>
                  {run && run.done && (
                    <text x={CX} y={CY + 28} textAnchor="middle" fontSize={10.5}
                      className="fill-gray-500 dark:fill-gray-400">
                      落宫见下方解读
                    </text>
                  )}
                </g>
              )}

              {/* 六宫节点 */}
              {PALACES.map((p, i) => {
                const c = NODE_COORDS[i]
                const active = run && run.playing && ev && ev.node === i
                const isResult = run && run.done && run.walk.finalNode === i
                const browseOn = browse === i
                const luck = LUCK[p.fortune]
                return (
                  <g key={p.name} transform={`translate(${c.x.toFixed(2)} ${c.y.toFixed(2)})`}
                    className="cursor-pointer"
                    onClick={() => { if (!(run && run.playing)) setBrowse(prev => prev === i ? null : i) }}
                    opacity={active || isResult || browseOn ? 1 : 0.92}
                  >
                    {(active || (isResult && run.done && !browse)) && (
                      <circle r={NODE_RING + 7} fill="none"
                        className={`stroke-gold-500 dark:stroke-gold-300 ${active ? 'animate-pulse' : ''}`}
                        strokeWidth={2.6} strokeDasharray="none" />
                    )}
                    {browseOn && !active && (
                      <circle r={NODE_RING + 7} fill="none"
                        className="stroke-violet-400 dark:stroke-violet-300"
                        strokeWidth={2} strokeOpacity={0.9} />
                    )}
                    <circle r={NODE_RING} fill={p.hex}
                      fillOpacity={active ? 0.16 : browseOn ? 0.12 : 0.07}
                      stroke={active ? '#b08d2e' : p.hex}
                      strokeOpacity={active ? 1 : browseOn ? 0.95 : 0.6}
                      strokeWidth={active ? 2.4 : 1.6}
                    />
                    <text y={-17} textAnchor="middle" fontSize={21} fontWeight={700}
                      fontFamily="var(--font-serif)"
                      className="fill-gray-800 dark:fill-gray-100">
                      {p.name}
                    </text>
                    <text y={0} textAnchor="middle" fontSize={12.5} fontWeight={700} className={luck.fill}>
                      {p.fortune}
                    </text>
                    <text y={15} textAnchor="middle" fontSize={10}
                      className="fill-gray-500 dark:fill-gray-400">
                      {p.element} · {p.colorName}色
                    </text>
                    <text y={29} textAnchor="middle" fontSize={9.5}
                      className="fill-gray-400 dark:fill-gray-500">
                      {p.pos}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* 五行色图例 */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
              {ELEMENT_LEGEND.map((e, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: e.hex }} />
                  {e.element} · {e.colorName}
                </span>
              ))}
            </div>
          </div>

          {/* ── 推演台 ── */}
          <div className="flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                🧮 推演过程
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                !run ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                  : run.playing ? 'border-gold-500/50 text-gold-600 dark:text-gold-300 bg-gold-500/5 animate-pulse'
                  : run.done ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-300 bg-emerald-500/5'
                  : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
              }`}>
                {!run ? '待开始' : run.playing ? '掐数中…' : run.done ? '已落宫' : '待开始'}
              </span>
            </div>

            {/* 月日时三行 */}
            <div className="space-y-2">
              {PHASE_NAMES.map((pn, pi) => {
                const st = phaseStatus(pi)
                const num = (pi === 0 ? run?.walk.n1 : pi === 1 ? run?.walk.n2 : run?.walk.n3) ?? 0
                const to = run ? PALACES[run.walk.landIdx[pi]].name : ''
                const from = run ? (pi === 0 ? '大安' : PALACES[run.walk.landIdx[pi - 1]].name) : ''
                const [rs, re] = run ? run.ranges[pi] : [0, 0]
                const curCount = run && st === 'run' ? run.tick - rs + 1 : 0
                return (
                  <div key={pn} className={`rounded-xl border px-3 py-2 transition-colors ${
                    st === 'run'
                      ? 'border-gold-500/60 bg-gold-500/5'
                      : st === 'done'
                        ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/5'
                        : 'border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02]'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-6 h-6 shrink-0 rounded-full text-center text-[11px] leading-6 font-bold ${
                          st === 'done' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                            : st === 'run' ? 'bg-gold-500/15 text-gold-600 dark:text-gold-300'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500'
                        }`}>
                          {pn}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {!run
                            ? `${pn}数：从${pi === 0 ? '大安' : '上一落宫'}起数`
                            : st === 'wait'
                              ? `${pn}数 ${num}：等上一步落宫`
                              : st === 'done'
                                ? `${pn}数 ${num} 已数完：${from} → ${to}`
                                : re > rs
                                  ? `${pn}数 · 正在第 ${curCount} 数（共 ${num} 数）`
                                  : `${pn}数 ${num}：直接落 ${to}`}
                        </span>
                      </div>
                      {st === 'done' && (
                        <span className="text-[10px] font-semibold shrink-0 text-emerald-600 dark:text-emerald-300">落 {to} ✓</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 中央解说区 */}
            <div className="flex-1 mt-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02] px-4 py-3 min-h-[104px] flex flex-col justify-center">
              {!run && (
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                  填好三个数，点「开始推演」——盘面会从大安起，一步一停地数给你看；
                  也可以先点盘上任意一宫，浏览它的完整解读。
                </p>
              )}
              {run && run.playing && ev && (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                    {ev.phase}数 · 第 {ev.count} 数
                    {ev.count === 1 && `（起数之宫即第 1 数）`}
                  </p>
                  <p className="text-lg font-bold font-serif text-gray-800 dark:text-gray-100">
                    落：{PALACES[ev.node].name}
                    <span className={`ml-2 text-xs align-middle font-sans ${LUCK[PALACES[ev.node].fortune].txt}`}>
                      {PALACES[ev.node].fortune}
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    顺时针再数下一位 → {PALACES[(ev.node + 1) % 6].name}
                  </p>
                </>
              )}
              {run && !run.playing && !run.done && (
                <p className="text-xs text-gray-400 dark:text-gray-500">盘面已就绪，点「开始推演」逐宫走给你看。</p>
              )}
              {run && run.done && (
                <>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-0.5">三个数都数完，落宫掌诀是：</p>
                  <p className="text-xl font-bold font-serif" style={{ color: PALACES[run.walk.finalNode].hex }}>
                    {PALACES[run.walk.finalNode].name}
                    <span className={`ml-2 text-sm align-middle font-sans ${LUCK[PALACES[run.walk.finalNode].fortune].txt}`}>
                      {PALACES[run.walk.finalNode].fortune}
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {PALACES[run.walk.finalNode].quick}
                  </p>
                </>
              )}
            </div>

            {/* 控制按钮 */}
            <div className="flex flex-wrap gap-2 mt-3">
              {run && run.playing && (
                <button onClick={() => {
                  clearTimer()
                  setRun(prev => prev ? { ...prev, playing: false, done: true, tick: prev.evs.length - 1 } : prev)
                  setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 160)
                }}
                  className="px-3.5 py-2 text-xs rounded-lg border border-violet-300 dark:border-violet-500/40 text-violet-600 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors">
                  ⏭ 跳过动画，直接看结果
                </button>
              )}
              {run && run.done && (
                <button onClick={() => {
                  setBrowse(null)
                  stopRun({ ...run, playing: true, done: false, tick: 0 })
                }}
                  className="px-3.5 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-300 transition-colors">
                  ↻ 再演一遍
                </button>
              )}
              {run && run.done && (
                <button onClick={() => stopRun(null)}
                  className="px-3.5 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-300 transition-colors">
                  收起，换个问题
                </button>
              )}
              {run && run.playing && (
                <button onClick={resetAll}
                  className="px-3.5 py-2 text-xs rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  停止并清空
                </button>
              )}
            </div>

            {run && run.done && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
                你的三个数：{run.walk.n1} · {run.walk.n2} · {run.walk.n3}
                {question.trim() && ` ｜所问：${question.trim()}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ 解读区 ═══ */}
      <div ref={resultRef} className="scroll-mt-24">
        {browse !== null && run && run.done && run.walk.finalNode !== browse && (
          <button onClick={() => setBrowse(null)}
            className="text-[11px] text-violet-600 dark:text-violet-300 hover:underline mb-2">
            ← 返回本次推演结果（{PALACES[run.walk.finalNode].name}）
          </button>
        )}
        {shownPalace ? (
          <PalaceDetail palace={shownPalace} catHit={catHit} isResult={!!run && run.done && shownNode === run.walk.finalNode} />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center">
            <p className="text-2xl mb-2">🖐️</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {run && run.playing
                ? '盘面正在掐数中… 数完会自动落宫并给出解读。'
                : '输入三个数开始推演，或点下方任一掌诀先浏览详解。'}
            </p>
          </div>
        )}
      </div>

      {/* ═══ 六宫速览 ═══ */}
      <div className="mt-5">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2.5">
          📖 六宫掌诀速览
          <span className="ml-2 text-[10px] font-normal text-gray-400 dark:text-gray-500">点任一掌诀查看完整解读</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PALACES.map((p, i) => {
            const active = browse === i || (run && run.done && run.walk.finalNode === i && browse === null)
            const luck = LUCK[p.fortune]
            return (
              <button key={p.name} onClick={() => { if (!(run && run.playing)) setBrowse(i) }}
                className={`text-left rounded-2xl border p-3 transition-all hover:-translate-y-0.5 ${
                  active
                    ? 'border-gold-500/70 bg-gold-500/5 shadow-sm'
                    : 'border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-white/[0.03] hover:border-gray-200 dark:hover:border-gray-600'
                }`}>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-base font-bold text-gray-800 dark:text-gray-100">{p.name}</span>
                  <span className="w-2 h-2 rounded-full" style={{ background: p.hex }} />
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-[10px] px-1.5 py-px rounded ${luck.chip} border`}>{p.fortune}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{p.element}·{p.colorName}</span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">{p.pos}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══ 方法说明 ═══ */}
      <div className="mt-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-white/[0.03] p-5">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">🧭 小六壬怎么用</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          <div className="rounded-xl bg-gray-50/70 dark:bg-white/[0.03] p-3.5">
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">① 报数 / 择时</p>
            最常用是「随手报三数」：心里默念问题，第一念想到的三个数即可。
            传统上也可用当下的农历月、日、时辰三个数。
          </div>
          <div className="rounded-xl bg-gray-50/70 dark:bg-white/[0.03] p-3.5">
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">② 掐数走六宫</p>
            六宫按「大安→留连→速喜→赤口→小吉→空亡」顺时针循环，
            第 1 个数从大安起，第 2、3 个数从上一步落下的宫接着数。
          </div>
          <div className="rounded-xl bg-gray-50/70 dark:bg-white/[0.03] p-3.5">
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">③ 落宫读象</p>
            最后落下的掌诀就是结果。三吉三凶中还有程度差异——
            建议结合所问之事，参考本页分场景解读，理性看待。
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
            小六壬是流传已久的民间简易占法，讲究「心诚则灵、一事一问」，适合给日常小事一个参考角度；
            它不替代专业意见——感情、健康、投资等重大决定，请以现实情况与专业人士的判断为准。
          </p>
        </div>
      </div>
    </div>
  )
}

/* ═════════════ 掌诀详解卡 ═════════════ */
function PalaceDetail({ palace, catHit, isResult }: { palace: Palace; catHit: CatKey | null; isResult: boolean }) {
  const luck = LUCK[palace.fortune]
  return (
    <div className={`rounded-2xl overflow-hidden border ${isResult ? 'border-gold-500/40' : 'border-gray-200/70 dark:border-gray-700/50'} bg-white/85 dark:bg-[#171614]/85`}>
      {/* 头部色条 */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${palace.hex}, ${palace.hex}55, transparent)` }} />
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {isResult && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/40 text-gold-600 dark:text-gold-300 font-semibold">
              本次结果
            </span>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${luck.chip} border`}>{palace.fortune} · {palace.fortuneDesc}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
            五行：{palace.element}（{palace.colorName}色）
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
            📍 {palace.pos}
          </span>
        </div>

        <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-gray-50 mt-2">
          {palace.name}
          <span className="ml-2 inline-block align-middle w-3 h-3 rounded-full" style={{ background: palace.hex }} />
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{palace.quick}</p>

        <div className="mt-4 space-y-2.5">
          {palace.read.map((para, i) => (
            <p key={i} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{para}</p>
          ))}
        </div>

        {/* 宜忌 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 p-3.5">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-300 mb-2">✅ 宜</p>
            <ul className="space-y-1.5">
              {palace.yis.map((y, i) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed flex gap-1.5">
                  <span className="text-emerald-500 shrink-0">·</span>{y}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-red-500/[0.05] border border-red-500/15 p-3.5">
            <p className="text-xs font-bold text-red-500 dark:text-red-400 mb-2">⛔ 忌</p>
            <ul className="space-y-1.5">
              {palace.jis.map((j, i) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed flex gap-1.5">
                  <span className="text-red-400 shrink-0">·</span>{j}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 分场景解读 */}
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-5 mb-2.5">
          分场景白话解读
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CATS.map(c => {
            const hit = catHit === c.key
            return (
              <div key={c.key}
                className={`rounded-xl p-3.5 transition-colors ${
                  hit
                    ? 'bg-gold-500/[0.07] border border-gold-500/40'
                    : 'bg-gray-50/80 dark:bg-white/[0.03] border border-transparent'
                }`}>
                <p className={`text-xs font-semibold mb-1 flex items-center gap-1.5 ${
                  hit ? 'text-gold-600 dark:text-gold-300' : 'text-gray-700 dark:text-gray-200'
                }`}>
                  <span>{c.icon}</span>{c.label}
                  {hit && <span className="text-[9px] px-1.5 py-px rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-300 border border-gold-500/30">与你所问相关</span>}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{palace.cats[c.key]}</p>
              </div>
            )
          })}
        </div>

        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4">
          参考解读仅供参考与自我对照，落宫是一面「镜子」，怎么走还是由你决定。
        </p>
      </div>
    </div>
  )
}
