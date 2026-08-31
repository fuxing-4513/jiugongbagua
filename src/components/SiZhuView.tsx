'use client'

import { useMemo, useState } from 'react'
import {
  computeAllRelations, wuxingDetail, wuxingFlow, shenshaPower, liuqinOf,
  lifeStages, pillarPairs, calcMingGong, calcShenGong, calcTaiYuan,
  REL_COLOR, NODE_PILLAR, WX_CYCLE, WX_OF, type PillarLike, type BaziRelation,
} from '@/lib/bazi-relations'

// ═══ 浅色宣纸配色（参考图：米白底、深褐字、传统五行色） ═══
const PAPER = {
  bg: '#f6f1e3', card: '#fdfaf1', border: '#ddd3bc',
  text: '#3d382e', sub: '#8b8170', title: '#9a4f2a', line: '#c9bfa6',
}
const WX_HEX: Record<string, string> = {
  木: '#3f7d4e', 火: '#c2523f', 土: '#a97e3d', 金: '#8a8437', 水: '#3f6f8e',
}
const REL_LIGHT: Record<string, string> = {
  '同柱': '#6b6352', '生': '#3f7d4e', '克': '#c2523f', '五合': '#7a5c8e',
  '六合': '#2f7d4f', '三合': '#3f6f8e', '六冲': '#c0392b', '三刑': '#9c3f5f',
  '六害': '#a97e3d', '相破': '#d08a3f',
}

// ── 布局（参考图：四柱横排，干支垂直成对，日主居中最大） ──
const COL_X = [55, 145, 252, 348]
const GAN_Y = 62
const ZHI_Y = 150
const R = 27

interface Props {
  pills: PillarLike[]
  dayun: { gz: string; age: number; startYear: number }[]
  gender: '男' | '女'
  mingGong?: string
  shenGong?: string
  taiYuan?: string
  curAge?: number
}

export default function SiZhuView({ pills, dayun, gender, mingGong, shenGong, taiYuan, curAge }: Props) {
  // 左侧竖排导航（参考图）：流通 / 干支 / 宫位 / 六亲
  const [view, setView] = useState<'ganzhi' | 'peidui' | 'gongwei' | 'liuqin'>('ganzhi')
  const [selected, setSelected] = useState<string | null>(null)

  const { relations, byNode } = useMemo(() => computeAllRelations(pills), [pills])
  const wxDetail = useMemo(() => wuxingDetail(pills), [pills])
  const flow = useMemo(() => wuxingFlow(wxDetail), [wxDetail])
  const power = useMemo(() => shenshaPower(pills), [pills])
  const pairs = useMemo(() => pillarPairs(pills), [pills])
  const stages = useMemo(() => lifeStages(pills, dayun), [pills, dayun])

  const mg = mingGong || calcMingGong(pills[0].gan, pills[1].zhi, pills[3].zhi)
  const sg = shenGong || calcShenGong(pills[0].gan, pills[1].zhi, pills[3].zhi)
  const ty = taiYuan || calcTaiYuan(pills[1].gan, pills[1].zhi)

  const selRels = selected ? (byNode[selected] || []) : []
  const dayGan = pills[2]?.gan || ''

  const nodeXY = (id: string) => {
    const i = parseInt(id.slice(1))
    return id.startsWith('g') ? { x: COL_X[i], y: GAN_Y } : { x: COL_X[i], y: ZHI_Y }
  }
  const relKind = (r: BaziRelation) => {
    const ia = parseInt(r.a.slice(1)), ib = parseInt(r.b.slice(1))
    if (r.a.slice(1) === r.b.slice(1)) return 'tong'
    return Math.abs(ia - ib) === 1 ? 'lin' : 'ge'
  }
  const linePath = (r: BaziRelation) => {
    const p1 = nodeXY(r.a), p2 = nodeXY(r.b)
    if (relKind(r) === 'tong') return { d: `M${p1.x},${p1.y} L${p2.x},${p2.y}`, mx: p1.x, my: (p1.y + p2.y) / 2 }
    const dist = Math.abs(p2.x - p1.x)
    const curve = relKind(r) === 'lin' ? 14 : 36
    const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2
    return { d: `M${p1.x},${p1.y} Q${mx},${my - curve} ${p2.x},${p2.y}`, mx, my: my - curve }
  }

  const navBtn = (key: typeof view, label: string) => (
    <button onClick={() => { setView(key); setSelected(null) }}
      className={`w-full py-2.5 rounded-lg text-sm font-serif transition-colors ${view === key ? 'bg-[#9a4f2a] text-[#fdfaf1] shadow-sm' : 'text-[#8b8170] hover:text-[#3d382e] hover:bg-[#efe8d4]'}`}>
      {label}
    </button>
  )

  const renderNode = (id: string, ch: string, wx: string, isDay: boolean) => {
    const { x, y } = nodeXY(id)
    const on = selected === id
    const c = WX_HEX[wx] || '#8b8170'
    return (
      <g key={id} onClick={() => setSelected(on ? null : id)} className="cursor-pointer" style={{ transition: 'opacity .2s' }}>
        <circle cx={x} cy={y} r={isDay ? R + 6 : R}
          fill={on ? '#f3e7d3' : PAPER.card}
          stroke={c} strokeWidth={on ? 3 : isDay ? 2.6 : 1.8} />
        {isDay && <circle cx={x} cy={y} r={R + 11} fill="none" stroke={c} strokeWidth={0.9} strokeDasharray="3 3" opacity={0.85} />}
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize={isDay ? 28 : 21} fontWeight={700} fill={c} fontFamily="serif">{ch}</text>
      </g>
    )
  }

  const isCurStage = (idx: number) => curAge != null && (
    (idx === 0 && curAge <= 15) || (idx === 1 && curAge >= 16 && curAge <= 30) ||
    (idx === 2 && curAge >= 31 && curAge <= 45) || (idx === 3 && curAge >= 46)
  )

  return (
    <div className="rounded-xl p-4" style={{ background: PAPER.bg, border: `1px solid ${PAPER.border}`, color: PAPER.text }}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold font-serif" style={{ color: PAPER.title }}>四柱多视角</h3>
        <p className="text-[10px] mt-0.5" style={{ color: PAPER.sub }}>六亲 · 四柱气脉 · 先天三宫 · 五行分布（判读需回排盘页）</p>
      </div>

      <div className="flex gap-3">
        {/* 左侧竖排导航（参考图） */}
        <div className="w-16 shrink-0 flex flex-col gap-1.5 pt-1">
          {navBtn('ganzhi', '干支')}
          {navBtn('peidui', '流通')}
          {navBtn('gongwei', '宫位')}
          {navBtn('liuqin', '六亲')}
        </div>

        {/* 右侧内容 */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* ═══ 干支（先天气脉） ═══ */}
          {view === 'ganzhi' && (
            <>
              <div className="rounded-lg p-1 select-none" style={{ background: PAPER.card, border: `1px solid ${PAPER.border}` }}>
                <svg viewBox="0 0 400 200" className="w-full">
                  {/* 关系线：默认同柱+相邻，点击后含隔柱 */}
                  {relations.filter(r => selected || relKind(r) !== 'ge').map(r => {
                    const kind = relKind(r)
                    const active = !selected || selRels.some(sr => sr.id === r.id)
                    const { d, mx, my } = linePath(r)
                    const c = REL_LIGHT[r.type] || '#8b8170'
                    const isTong = kind === 'tong'
                    return (
                      <g key={r.id} opacity={active ? 1 : 0.15} style={{ transition: 'opacity .2s' }}>
                        <path d={d} fill="none" stroke={c} strokeWidth={active ? (isTong ? 1.7 : selected ? 1.8 : 1.2) : 0.6}
                          strokeDasharray={kind === 'ge' ? '5 3' : undefined} />
                        <g transform={`translate(${mx},${my})`}>
                          <rect x={-17} y={-7.5} width={34} height={15} rx={7.5} fill={PAPER.card} stroke={c} strokeWidth={0.6} />
                          <text textAnchor="middle" dominantBaseline="middle" fontSize={8} fill={c}>
                            {isTong ? r.sub.slice(0, 4) : r.type}
                          </text>
                        </g>
                      </g>
                    )
                  })}
                  {/* 柱名 */}
                  {NODE_PILLAR.map((n, i) => (
                    <text key={n} x={COL_X[i]} y={14} textAnchor="middle" fontSize={10.5} fill={PAPER.title} fontWeight={600} fontFamily="serif">{n}</text>
                  ))}
                  {/* 天干（上排） */}
                  {pills.map((p, i) => renderNode(`g${i}`, p.gan, WX_OF[p.gan] || '土', i === 2))}
                  {/* 地支（下排） */}
                  {pills.map((p, i) => renderNode(`z${i}`, p.zhi, WX_OF[p.zhi] || '土', false))}
                  {/* 十神（柱下方） */}
                  {pills.map((p, i) => (
                    <text key={'ss' + i} x={COL_X[i]} y={ZHI_Y + 38} textAnchor="middle" fontSize={9.5} fill={PAPER.sub}>
                      {i === 2 ? `日主·${p.ssG}` : `${p.ssG}·${p.ssZ}`}
                    </text>
                  ))}
                  {/* 用/体 */}
                  <text x={4} y={GAN_Y} textAnchor="start" fontSize={8} fill={PAPER.sub}>用·天干</text>
                  <text x={4} y={ZHI_Y} textAnchor="start" fontSize={8} fill={PAPER.sub}>体·地支</text>
                </svg>
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center pb-1.5">
                  {Object.entries(REL_LIGHT).map(([t, c]) => (
                    <span key={t} className="inline-flex items-center gap-1 text-[10px]" style={{ color: PAPER.sub }}>
                      <span className="w-3 h-[3px] inline-block rounded" style={{ background: c }} />{t}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[10px] leading-relaxed" style={{ color: PAPER.sub }}>
                {selected
                  ? `「${selected.startsWith('g') ? pills[parseInt(selected.slice(1))].gan : pills[parseInt(selected.slice(1))].zhi}」牵动 ${selRels.length} 条关系（相邻生克、同柱耦合、三合三会、隔柱刑冲）。`
                  : '点任一个字，高亮它牵动的全部关系（相邻生克、同柱耦合、三合三会、隔柱刑冲）。用=天干，外显的追求与取得资源的方式；体=地支，根基与藏蓄的能量。取象与喜忌判读需完整命局报告，可回八字排盘页查看。'}
              </p>

              {selected && (
                <div className="rounded-lg p-3" style={{ background: '#f3e7d3', border: `1px solid ${PAPER.line}` }}>
                  <p className="text-xs mb-2" style={{ color: PAPER.title }}>
                    {selected.startsWith('g') ? `天干 ${pills[parseInt(selected.slice(1))].gan}（${pills[parseInt(selected.slice(1))].ssG}）` : `地支 ${pills[parseInt(selected.slice(1))].zhi}（${pills[parseInt(selected.slice(1))].ssZ}）`} 牵动 {selRels.length} 条关系：
                  </p>
                  <div className="space-y-1">
                    {selRels.map(r => (
                      <p key={r.id} className="text-[11px] leading-relaxed" style={{ color: PAPER.text }}>
                        <span className="text-[10px] px-1.5 py-0.5 rounded mr-1" style={{ background: (REL_LIGHT[r.type] || '#888') + '22', color: REL_LIGHT[r.type] || '#888' }}>{r.type}</span>
                        {r.sub} <span style={{ color: PAPER.sub }}>（{r.pillars}）</span>
                        {r.note && <span style={{ color: '#b26a3a' }}> · {r.note}</span>}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 五行分布 + 特殊宫位（底部） */}
              <div className="rounded-lg p-3" style={{ background: PAPER.card, border: `1px solid ${PAPER.border}` }}>
                <p className="text-[11px] mb-2 text-center" style={{ color: PAPER.sub }}>五行分布（明干 + 藏干本气/中气/余气）</p>
                <div className="flex items-center gap-4 flex-wrap justify-center">
                  <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
                    {(() => {
                      const r = 44, cx = 60, cy = 60, total = Math.max(WX_CYCLE.reduce((s, k) => s + wxDetail[k].count, 0), 1)
                      let ang = -90
                      return WX_CYCLE.map((w, i) => {
                        const cnt = wxDetail[w].count
                        const frac = cnt / total
                        const a0 = ang, a1 = ang + frac * 360
                        ang = a1
                        const large = frac > 0.5 ? 1 : 0
                        const x0 = cx + r * Math.cos(a0 * Math.PI / 180), y0 = cy + r * Math.sin(a0 * Math.PI / 180)
                        const x1 = cx + r * Math.cos(a1 * Math.PI / 180), y1 = cy + r * Math.sin(a1 * Math.PI / 180)
                        return (
                          <g key={w}>
                            <path d={`M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`}
                              fill={WX_HEX[w]} opacity={cnt > 0 ? 0.8 : 0.1} />
                            <text x={cx + (r + 14) * Math.cos(((a0 + a1) / 2) * Math.PI / 180)}
                              y={cy + (r + 14) * Math.sin(((a0 + a1) / 2) * Math.PI / 180)}
                              textAnchor="middle" dominantBaseline="middle" fontSize={10} fill={cnt > 0 ? WX_HEX[w] : '#bbb19a'}>
                              {w}{cnt > 0 ? cnt : ''}
                            </text>
                          </g>
                        )
                      })
                    })()}
                    <circle cx={60} cy={60} r={22} fill={PAPER.card} stroke={PAPER.line} />
                    <text x={60} y={56} textAnchor="middle" fontSize={11} fill={PAPER.sub}>日主</text>
                    <text x={60} y={70} textAnchor="middle" fontSize={13} fontWeight={700} fill={WX_HEX[WX_OF[dayGan]] || PAPER.text} fontFamily="serif">{dayGan}</text>
                  </svg>
                  <div className="space-y-1.5 min-w-[160px]">
                    {WX_CYCLE.map(w => {
                      const d = wxDetail[w]
                      const max = Math.max(...WX_CYCLE.map(k => wxDetail[k].count), 1)
                      return (
                        <div key={w} className="flex items-center gap-2">
                          <span className="text-xs font-bold w-4" style={{ color: WX_HEX[w] }}>{w}</span>
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: PAPER.line }}>
                            <div className="h-full rounded-full" style={{ background: WX_HEX[w], width: `${(d.count / max) * 100}%` }} />
                          </div>
                          <span className="text-[10px] w-20 text-right" style={{ color: PAPER.sub }}>{d.count} · 干{d.gan}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[['命宫', mg, '#9a4f2a'], ['身宫', sg, '#3f6f8e'], ['胎元', ty, '#7a5c8e']].map(([n, v, c]) => (
                  <div key={n as string} className="rounded-lg p-2.5 text-center" style={{ background: PAPER.card, border: `1px solid ${PAPER.border}` }}>
                    <p className="text-[10px] mb-0.5" style={{ color: PAPER.sub }}>{n}</p>
                    <p className="text-sm font-bold font-serif" style={{ color: c as string }}>{v}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ 流通（五行流通 + 柱间刑冲合害配对） ═══ */}
          {view === 'peidui' && (
            <>
              <div className="rounded-lg p-3" style={{ background: PAPER.card, border: `1px solid ${PAPER.border}` }}>
                <p className="text-[11px] mb-2 text-center" style={{ color: PAPER.sub }}>五行流通 · 相生环</p>
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  {WX_CYCLE.map((w, i) => {
                    const next = WX_CYCLE[(i + 1) % 5]
                    const active = wxDetail[w].count > 0 && wxDetail[next].count > 0
                    return (
                      <span key={w} className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${wxDetail[w].count > 0 ? 'font-bold' : ''}`}
                          style={{ color: WX_HEX[w], borderColor: WX_HEX[w] + '88', background: wxDetail[w].count > 0 ? WX_HEX[w] + '18' : 'transparent' }}>
                          {w}
                        </span>
                        <span className="text-[10px]" style={{ color: active ? PAPER.sub : '#c0b79f' }}>→{next}{active ? '' : '(缺)'}</span>
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-lg p-1 select-none" style={{ background: PAPER.card, border: `1px solid ${PAPER.border}` }}>
                <p className="text-[11px] pt-1.5 pb-1 text-center" style={{ color: PAPER.sub }}>柱间刑冲合害全配对一览</p>
                <svg viewBox="0 0 400 210" className="w-full">
                  {pairs.map((pr, i) => {
                    const [aName, bName] = pr.pair.split('·')
                    const aIdx = NODE_PILLAR.indexOf(aName), bIdx = NODE_PILLAR.indexOf(bName)
                    const p1 = { x: COL_X[aIdx], y: 105 }, p2 = { x: COL_X[bIdx], y: 105 }
                    const dist = Math.abs(p2.x - p1.x)
                    const curve = dist > 170 ? 32 : dist > 90 ? 20 : 6
                    const mx = (p1.x + p2.x) / 2, my = 105 - curve
                    const c = pr.relations.length ? (REL_LIGHT[pr.relations[0].type] || '#888') : PAPER.line
                    return (
                      <g key={i}>
                        <path d={`M${p1.x},${p1.y} Q${mx},${my} ${p2.x},${p2.y}`} fill="none"
                          stroke={c} strokeWidth={pr.relations.length ? 1.5 : 0.9}
                          strokeDasharray={pr.relations.length ? undefined : '4 4'} />
                        {pr.relations.length > 0 && (
                          <g transform={`translate(${mx},${my})`}>
                            <rect x={-25} y={-9} width={50} height={17} rx={8.5} fill={PAPER.card} stroke={c} strokeWidth={0.7} />
                            <text textAnchor="middle" dominantBaseline="middle" fontSize={8.5} fill={c}>
                              {pr.relations[0].type}{pr.adjacent ? '' : '(隔)'}
                            </text>
                          </g>
                        )}
                      </g>
                    )
                  })}
                  {NODE_PILLAR.map((n, i) => (
                    <g key={n}>
                      <circle cx={COL_X[i]} cy={105} r={29} fill={PAPER.card} stroke={PAPER.line} strokeWidth={1.6} />
                      <text x={COL_X[i]} y={96} textAnchor="middle" fontSize={11} fill={PAPER.title} fontWeight={600} fontFamily="serif">{n}</text>
                      <text x={COL_X[i]} y={112} textAnchor="middle" fontSize={16} fontWeight={700} fill={PAPER.text} fontFamily="serif">{pills[i].gz}</text>
                      <text x={COL_X[i]} y={125} textAnchor="middle" fontSize={8.5} fill={PAPER.sub}>{pills[i].ssG}·{pills[i].ssZ}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pairs.map((pr, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: PAPER.card, border: `1px solid ${pr.relations.length ? PAPER.line : PAPER.border}` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold" style={{ color: PAPER.title }}>{pr.pair}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={pr.adjacent ? { background: '#f0dfc0', color: '#9a4f2a' } : { background: '#efe9d8', color: PAPER.sub }}>
                        {pr.adjacent ? '紧邻' : '隔位'}
                      </span>
                    </div>
                    {pr.relations.length > 0 ? (
                      <div className="space-y-1">
                        {pr.relations.map(r => (
                          <p key={r.id} className="text-[11px] leading-relaxed" style={{ color: PAPER.text }}>
                            <span className="text-[10px] px-1.5 py-0.5 rounded mr-1" style={{ background: (REL_LIGHT[r.type] || '#888') + '22', color: REL_LIGHT[r.type] || '#888' }}>{r.type}</span>
                            {r.sub}
                            {r.note && <span style={{ color: '#b26a3a' }}> · {r.note}</span>}
                          </p>
                        ))}
                      </div>
                    ) : <p className="text-[11px]" style={{ color: PAPER.sub }}>无明显刑冲合害，两柱关系平和</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ 宫位（人生阶段与亲属宫） ═══ */}
          {view === 'gongwei' && (
            <div className="space-y-3">
              <div className="hidden sm:flex items-center justify-between px-2">
                {stages.map((s, i) => (
                  <div key={s.idx} className="flex items-center flex-1 last:flex-none">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: isCurStage(s.idx) ? '#9a4f2a' : PAPER.line }} />
                    {i < stages.length - 1 && <div className="flex-1 h-px mx-2" style={{ background: PAPER.line }} />}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {stages.map(s => {
                  const isCur = isCurStage(s.idx)
                  return (
                    <div key={s.idx} className="rounded-lg p-3 flex flex-col"
                      style={{ background: PAPER.card, border: `1px solid ${isCur ? '#b26a3a' : PAPER.border}`, boxShadow: isCur ? '0 2px 10px rgba(178,106,58,0.15)' : 'none' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold font-serif" style={{ color: PAPER.title }}>{s.stage}</span>
                        <span className="text-[10px]" style={{ color: PAPER.sub }}>{s.range}</span>
                      </div>
                      {isCur && <p className="text-[9px] mb-1" style={{ color: '#b26a3a' }}>● 当前阶段</p>}
                      <p className="text-[10px] mb-2" style={{ color: PAPER.sub }}>{s.gongwei} · {s.role}</p>
                      <p className="font-serif text-sm mb-0.5" style={{ color: PAPER.text }}>{s.pill.gz} <span className="text-[10px]" style={{ color: PAPER.sub }}>纳音 {s.pill.ny}</span></p>
                      <p className="text-[10px] mb-2" style={{ color: PAPER.sub }}>干{s.pill.ssG} · 支{s.pill.ssZ} · 藏{s.pill.hd}</p>
                      {s.dayun.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {s.dayun.map((d, j) => (
                            <span key={j} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: '#e8e2cf', color: '#3f6f8e', border: `1px solid ${PAPER.line}` }}>{d.gz}（{d.age}岁）</span>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] leading-relaxed mt-auto" style={{ color: '#5a5245' }}>{s.brief}</p>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-center" style={{ color: PAPER.sub }}>六亲宫位：年柱=祖业/长辈，月柱=父母/兄弟，日柱=自身/配偶（日支为夫妻宫），时柱=子女/归宿。</p>
            </div>
          )}

          {/* ═══ 六亲（十神与宫位双维） ═══ */}
          {view === 'liuqin' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg" style={{ background: PAPER.card, border: `1px solid ${PAPER.border}` }}>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ background: '#efe8d4' }}>
                      <th className="p-2 border font-medium" style={{ borderColor: PAPER.line, color: PAPER.sub }}></th>
                      <th className="p-2 border font-serif" style={{ borderColor: PAPER.line, color: PAPER.title }}>天干（透）</th>
                      <th className="p-2 border font-serif" style={{ borderColor: PAPER.line, color: PAPER.title }}>本气</th>
                      <th className="p-2 border font-serif" style={{ borderColor: PAPER.line, color: PAPER.title }}>中气</th>
                      <th className="p-2 border font-serif" style={{ borderColor: PAPER.line, color: PAPER.title }}>余气</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pills.map((p, i) => {
                      const hd = p.hdSS
                      const cells = [
                        { gan: p.gan, ss: p.ssG },
                        { gan: hd[0]?.gan || '—', ss: hd[0]?.ss || '—' },
                        { gan: hd[1]?.gan || '—', ss: hd[1]?.ss || '—' },
                        { gan: hd[2]?.gan || '—', ss: hd[2]?.ss || '—' },
                      ]
                      return (
                        <tr key={i} style={i % 2 ? { background: '#faf6ea' } : undefined}>
                          <td className="p-2 border font-medium" style={{ borderColor: PAPER.line, color: PAPER.sub }}>{NODE_PILLAR[i]}</td>
                          {cells.map((c, j) => (
                            <td key={j} className="p-2 border text-center" style={{ borderColor: PAPER.line }}>
                              <span className="font-serif font-semibold" style={WX_OF[c.gan] ? { color: WX_HEX[WX_OF[c.gan]] } : { color: PAPER.sub }}>{c.gan}</span>
                              <span style={{ color: PAPER.sub }}>（{c.ss}）</span>
                              <span className="block text-[9px] mt-0.5" style={{ color: PAPER.sub }}>{liuqinOf(c.ss, gender).join('、') || '—'}</span>
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div>
                <p className="text-[11px] mb-2" style={{ color: PAPER.sub }}>十神力量计数（天干=1，藏干本气=0.6/中气=0.4/余气=0.2）</p>
                <div className="space-y-1.5">
                  {power.map((p, i) => {
                    const maxP = Math.max(...power.map(x => x.power), 1)
                    return (
                      <div key={p.group} className="flex items-center gap-2">
                        <span className="text-[11px] w-10 shrink-0" style={{ color: PAPER.text }}>{p.group}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: PAPER.line }}>
                          <div className="h-full rounded-full" style={{ background: p.power >= 3 ? '#9a4f2a' : p.power >= 1.5 ? '#3f6f8e' : '#c9bfa6', width: `${(p.power / maxP) * 100}%` }} />
                        </div>
                        <span className="text-[10px] w-8 text-right shrink-0" style={{ color: PAPER.sub }}>{p.power}</span>
                        <span className="text-[9px] hidden md:inline truncate max-w-[180px]" style={{ color: PAPER.sub }}>{p.detail.join(' ')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-lg p-3 text-[10px] leading-relaxed" style={{ background: '#efe8d4', color: PAPER.sub }}>
                六亲映射：比劫=兄弟；偏财=父，正印=母；{gender === '男' ? '男命以财星为妻（日支为妻宫），官杀为子女' : '女命以官杀为夫（日支为夫宫），食伤为子女'}；食伤为子女星（通用）。力量计数仅供格局参考，吉凶需结合旺衰喜忌综合判断。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
