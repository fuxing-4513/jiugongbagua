'use client'

import { useMemo, useState } from 'react'
import {
  computeAllRelations, wuxingDetail, wuxingFlow, shenshaPower, liuqinOf,
  lifeStages, pillarPairs, calcMingGong, calcShenGong, calcTaiYuan,
  REL_COLOR, NODE_PILLAR, WX_CYCLE, WX_OF, type PillarLike, type BaziRelation,
} from '@/lib/bazi-relations'

// ── 五行色（深色主题下的鲜明色） ──
const WX_HEX: Record<string, string> = { 木: '#34d399', 火: '#f87171', 土: '#d6a354', 金: '#e2c044', 水: '#60a5fa' }

// ── 布局坐标（viewBox 0 0 400 250） ──
const COL_X = [55, 145, 255, 345]      // 四柱 x（年/月/日/时）
const GAN_Y = 78                        // 天干 y
const ZHI_Y = 178                       // 地支 y
const R = 24                            // 节点圆半径

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
  const [subTab, setSubTab] = useState<'qimai' | 'peidui' | 'jieduan' | 'shishen'>('qimai')
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
  const dayZhi = pills[2]?.zhi || ''

  // 节点坐标
  const nodeXY = (id: string) => {
    const i = parseInt(id.slice(1))
    return id.startsWith('g') ? { x: COL_X[i], y: GAN_Y } : { x: COL_X[i], y: ZHI_Y }
  }
  // 关系曲线（贝塞尔）：同柱=直线，相邻=浅弧，隔柱=大弧
  const linePath = (a: string, b: string) => {
    const p1 = nodeXY(a), p2 = nodeXY(b)
    const dx = p2.x - p1.x, dy = p2.y - p1.y
    const dist = Math.hypot(dx, dy)
    const curve = dist > 130 ? 42 : dist > 80 ? 24 : 8
    const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2
    const nx = -dy / dist, ny = dx / dist
    const cx = mx + nx * curve, cy = my + ny * curve
    return { d: `M${p1.x},${p1.y} Q${cx},${cy} ${p2.x},${p2.y}`, mx: cx, my: cy }
  }

  const tabBtn = (key: typeof subTab, label: string) => (
    <button onClick={() => { setSubTab(key); setSelected(null) }}
      className={`px-3 min-h-[32px] rounded-md text-xs transition-colors ${subTab === key ? 'bg-gold-600/20 text-gold-300 border border-gold-500/40' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>
      {label}
    </button>
  )

  // 节点绘制（圆形 + 五行色描边 + 十神小字）
  const renderNode = (id: string, ch: string, wx: string, ss: string, isDay: boolean) => {
    const { x, y } = nodeXY(id)
    const on = selected === id
    const active = !selected || selRels.some(r => r.a === id || r.b === id)
    const c = WX_HEX[wx] || '#888'
    return (
      <g key={id}
        onClick={() => setSelected(on ? null : id)}
        className="cursor-pointer"
        opacity={active ? 1 : 0.22}
        style={{ transition: 'opacity .2s' }}>
        <circle cx={x} cy={y} r={isDay ? R + 6 : R}
          fill={on ? `${c}33` : '#1a2333'}
          stroke={c} strokeWidth={on ? 2.6 : isDay ? 2.2 : 1.6}
          strokeDasharray={isDay ? undefined : undefined}
        />
        {isDay && <circle cx={x} cy={y} r={R + 11} fill="none" stroke={c} strokeWidth={0.7} strokeDasharray="3 3" opacity={0.7} />}
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize={isDay ? 24 : 19} fontWeight={700} fill={c} fontFamily="serif">{ch}</text>
        <text x={x} y={y + (isDay ? 18 : 14)} textAnchor="middle" fontSize={9} fill="#9aa4b5">{ss}</text>
      </g>
    )
  }

  return (
    <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gold-300 font-serif">四柱多视角</h3>
        <div className="flex gap-1 flex-wrap">
          {tabBtn('qimai', '🕸 先天气脉')}
          {tabBtn('peidui', '⚔ 刑冲合害')}
          {tabBtn('jieduan', '🌱 人生阶段')}
          {tabBtn('shishen', '🧭 十神宫位')}
        </div>
      </div>

      {/* ═══════════ 一、先天气脉 ═══════════ */}
      {subTab === 'qimai' && (
        <div className="space-y-4">
          {/* 主图：四柱干支关系网 */}
          <div className="relative select-none">
            <svg viewBox="0 0 400 250" className="w-full">
              {/* 关系线（曲线 + 箭头 + 标注） */}
              {relations.map(r => {
                const active = !selected || selRels.some(sr => sr.id === r.id)
                const { d, mx, my } = linePath(r.a, r.b)
                const c = REL_COLOR[r.type] || '#888'
                const sameCol = r.a.slice(1) === r.b.slice(1)
                return (
                  <g key={r.id} opacity={active ? (selected ? 1 : 0.75) : 0.1} style={{ transition: 'opacity .2s' }}>
                    <path d={d} fill="none" stroke={c}
                      strokeWidth={active ? (selected ? 2 : 1.2) : 0.6}
                      strokeDasharray={sameCol ? '5 3' : undefined}
                    />
                    {/* 箭头 */}
                    {!sameCol && (
                      <g transform={`translate(${mx},${my}) rotate(${Math.atan2(nodeXY(r.b).y - nodeXY(r.a).y, nodeXY(r.b).x - nodeXY(r.a).x) * 180 / Math.PI})`}>
                        <path d="M-5,-3.5 L4,0 L-5,3.5" fill="none" stroke={c} strokeWidth={0.9} />
                      </g>
                    )}
                    {/* 关系名标注（线中点，小胶囊） */}
                    {active && (
                      <g transform={`translate(${mx},${my})`}>
                        <rect x={-15} y={-8} width={30} height={15} rx={7.5}
                          fill="#0f1626" stroke={c} strokeWidth={0.6} opacity={0.92} />
                        <text textAnchor="middle" dominantBaseline="middle" fontSize={8} fill={c}>{r.type}</text>
                      </g>
                    )}
                  </g>
                )
              })}

              {/* 柱名 */}
              {NODE_PILLAR.map((n, i) => (
                <text key={n} x={COL_X[i]} y={22} textAnchor="middle" fontSize={11} fill="#d4af6a" fontWeight={600} fontFamily="serif">{n}</text>
              ))}

              {/* 天干节点 */}
              {pills.map((p, i) => renderNode(`g${i}`, p.gan, WX_OF[p.gan] || '土', p.ssG, i === 2))}
              {/* 地支节点 */}
              {pills.map((p, i) => renderNode(`z${i}`, p.zhi, WX_OF[p.zhi] || '土', p.ssZ, false))}

              {/* 用/体 标注 */}
              <text x={8} y={GAN_Y} textAnchor="start" fontSize={8.5} fill="#6b7688">用·天干</text>
              <text x={8} y={ZHI_Y} textAnchor="start" fontSize={8.5} fill="#6b7688">体·地支</text>
            </svg>

            {/* 图例 */}
            <div className="flex flex-wrap gap-1.5 justify-center mt-1">
              {Object.entries(REL_COLOR).map(([t, c]) => (
                <span key={t} className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                  <span className="w-3 h-0.5 inline-block rounded" style={{ background: c }} />{t}
                </span>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-gray-500 text-center leading-relaxed">
            点击任意干支，高亮它牵动的全部关系（同柱生克、相邻生克、天干五合、地支六合/三合/六冲/三刑/六害/相破）。用=天干，外显的追求与取得资源的方式；体=地支，根基与藏蓄能量。取象与喜忌判读需完整命局报告，可回八字排盘查看。
          </p>

          {/* 点击高亮明细 */}
          {selected && (
            <div className="bg-dark-700/60 rounded-lg p-3 border border-gold-500/20">
              <p className="text-xs text-gold-300 mb-2">
                {selected.startsWith('g') ? `天干 ${pills[parseInt(selected.slice(1))].gan}（${pills[parseInt(selected.slice(1))].ssG}）` : `地支 ${pills[parseInt(selected.slice(1))].zhi}（${pills[parseInt(selected.slice(1))].ssZ}）`} 牵动 {selRels.length} 条关系：
              </p>
              <div className="space-y-1">
                {selRels.map(r => (
                  <p key={r.id} className="text-[11px] text-gray-300 leading-relaxed">
                    <span className="text-[10px] px-1.5 py-0.5 rounded mr-1" style={{ background: REL_COLOR[r.type] + '22', color: REL_COLOR[r.type] }}>{r.type}</span>
                    {r.sub} <span className="text-gray-500">（{r.pillars}）</span>
                    {r.note && <span className="text-amber-400/80"> · {r.note}</span>}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 五行分布（环形 + 计数，参考图「五行分布」） */}
          <div className="bg-dark-700/40 rounded-xl border border-dark-600 p-3">
            <p className="text-[11px] text-gray-400 mb-2 text-center">五行分布（明干 + 藏干本气/中气/余气）</p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {/* 五行环形图 */}
              <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0">
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
                          fill={WX_HEX[w]} opacity={cnt > 0 ? 0.85 : 0.12} />
                        <text x={cx + (r + 15) * Math.cos(((a0 + a1) / 2) * Math.PI / 180)}
                          y={cy + (r + 15) * Math.sin(((a0 + a1) / 2) * Math.PI / 180)}
                          textAnchor="middle" dominantBaseline="middle" fontSize={10} fill={cnt > 0 ? WX_HEX[w] : '#555'}>
                          {w}{cnt > 0 ? cnt : ''}
                        </text>
                      </g>
                    )
                  })
                })()}
                <circle cx={60} cy={60} r={22} fill="#0f1626" stroke="#2a3547" />
                <text x={60} y={56} textAnchor="middle" fontSize={11} fill="#9aa4b5">日主</text>
                <text x={60} y={70} textAnchor="middle" fontSize={13} fontWeight={700} fill={WX_HEX[WX_OF[dayGan]] || '#fff'} fontFamily="serif">{dayGan}</text>
              </svg>
              {/* 计数明细 */}
              <div className="space-y-1.5 min-w-[160px]">
                {WX_CYCLE.map(w => {
                  const d = wxDetail[w]
                  const max = Math.max(...WX_CYCLE.map(k => wxDetail[k].count), 1)
                  return (
                    <div key={w} className="flex items-center gap-2">
                      <span className="text-xs font-bold w-4" style={{ color: WX_HEX[w] }}>{w}</span>
                      <div className="flex-1 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ background: WX_HEX[w], width: `${(d.count / max) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400 w-20 text-right">{d.count} · 干{d.gan}</span>
                    </div>
                  )
                })}
                <p className="text-[9px] text-gray-600 pt-1">缺 {WX_CYCLE.filter(k => wxDetail[k].count === 0).join('、') || '无'}（明面缺，藏干中气/余气可补）</p>
              </div>
            </div>
          </div>

          {/* 五行流通（相生环） */}
          <div className="bg-dark-700/40 rounded-xl border border-dark-600 p-3">
            <p className="text-[11px] text-gray-400 mb-2 text-center">五行流通 · 相生环</p>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {WX_CYCLE.map((w, i) => {
                const next = WX_CYCLE[(i + 1) % 5]
                const active = wxDetail[w].count > 0 && wxDetail[next].count > 0
                return (
                  <span key={w} className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full border ${wxDetail[w].count > 0 ? 'font-bold' : ''}`}
                      style={{ color: WX_HEX[w], borderColor: WX_HEX[w] + '66', background: wxDetail[w].count > 0 ? WX_HEX[w] + '1a' : 'transparent' }}>
                      {w}
                    </span>
                    <span className={`text-[10px] ${active ? 'text-gray-300' : 'text-gray-700'}`}>→{next} {active ? '' : '(缺)'}</span>
                  </span>
                )
              })}
            </div>
          </div>

          {/* 特殊宫位 */}
          <div className="grid grid-cols-3 gap-2">
            {[['命宫', mg, '#d4af6a'], ['身宫', sg, '#60a5fa'], ['胎元', ty, '#c084fc']].map(([n, v, c]) => (
              <div key={n as string} className="bg-dark-700/50 rounded-lg p-2.5 text-center border border-dark-600">
                <p className="text-[10px] text-gray-500 mb-0.5">{n}</p>
                <p className="text-sm font-bold font-serif" style={{ color: c as string }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ 二、柱间刑冲合害全配对 ═══════════ */}
      {subTab === 'peidui' && (
        <div className="space-y-3">
          {/* 四柱 2×2 布局 + 六对配对连线 */}
          <div className="relative select-none">
            <svg viewBox="0 0 400 240" className="w-full">
              {/* 六对配对弧线 */}
              {pairs.map((pr, i) => {
                const [aName, bName] = pr.pair.split('·')
                const aIdx = NODE_PILLAR.indexOf(aName), bIdx = NODE_PILLAR.indexOf(bName)
                const p1 = { x: COL_X[aIdx], y: 120 }, p2 = { x: COL_X[bIdx], y: 120 }
                const dx = p2.x - p1.x, dist = Math.abs(dx)
                const curve = dist > 170 ? 34 : dist > 90 ? 20 : 6
                const mx = (p1.x + p2.x) / 2, my = 120 - curve
                return (
                  <g key={i}>
                    <path d={`M${p1.x},${p1.y} Q${mx},${my} ${p2.x},${p2.y}`} fill="none"
                      stroke={pr.relations.length ? REL_COLOR[pr.relations[0].type] : '#2a3547'}
                      strokeWidth={pr.relations.length ? 1.4 : 0.8}
                      strokeDasharray={pr.relations.length ? undefined : '4 4'} />
                    {pr.relations.length > 0 && (
                      <g transform={`translate(${mx},${my})`}>
                        <rect x={-24} y={-9} width={48} height={17} rx={8.5} fill="#0f1626" stroke={REL_COLOR[pr.relations[0].type]} strokeWidth={0.6} />
                        <text textAnchor="middle" dominantBaseline="middle" fontSize={8.5} fill={REL_COLOR[pr.relations[0].type]}>
                          {pr.relations[0].type}{pr.adjacent ? '' : '(隔)'}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
              {/* 四柱节点 */}
              {NODE_PILLAR.map((n, i) => (
                <g key={n}>
                  <circle cx={COL_X[i]} cy={120} r={30} fill="#1a2333" stroke="#3a4a63" strokeWidth={1.4} />
                  <text x={COL_X[i]} y={110} textAnchor="middle" fontSize={11} fill="#d4af6a" fontWeight={600} fontFamily="serif">{n}</text>
                  <text x={COL_X[i]} y={128} textAnchor="middle" fontSize={17} fontWeight={700} fill="#e5e7eb" fontFamily="serif">{pills[i].gz}</text>
                  <text x={COL_X[i]} y={142} textAnchor="middle" fontSize={8.5} fill="#9aa4b5">{pills[i].ssG}·{pills[i].ssZ}</text>
                </g>
              ))}
            </svg>
          </div>
          <p className="text-[10px] text-gray-500 text-center">紧邻（年月/月日/日时）力量最显；隔位（年日/年时/月时）刑冲合害力量递减。三刑为「恃势之刑」，力量强于一般相克。</p>

          {/* 配对明细 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pairs.map((pr, i) => (
              <div key={i} className={`bg-dark-700/50 rounded-lg p-3 border ${pr.relations.length ? 'border-dark-500' : 'border-dark-700'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gold-300">{pr.pair}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${pr.adjacent ? 'bg-amber-900/40 text-amber-300' : 'bg-dark-800 text-gray-500 border border-dark-600'}`}>
                    {pr.adjacent ? '紧邻' : '隔位'}
                  </span>
                </div>
                {pr.relations.length > 0 ? (
                  <div className="space-y-1">
                    {pr.relations.map(r => (
                      <p key={r.id} className="text-[11px] text-gray-300 leading-relaxed">
                        <span className="text-[10px] px-1.5 py-0.5 rounded mr-1" style={{ background: REL_COLOR[r.type] + '22', color: REL_COLOR[r.type] }}>{r.type}</span>
                        {r.sub}
                        {r.note && <span className="text-amber-400/80"> · {r.note}</span>}
                      </p>
                    ))}
                  </div>
                ) : <p className="text-[11px] text-gray-600">无明显刑冲合害，两柱关系平和</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ 三、人生阶段与亲属宫 ═══════════ */}
      {subTab === 'jieduan' && (
        <div className="space-y-3">
          {/* 时间轴连接线 */}
          <div className="hidden sm:flex items-center justify-between px-2">
            {stages.map((s, i) => (
              <div key={s.idx} className="flex items-center flex-1 last:flex-none">
                <div className={`w-2.5 h-2.5 rounded-full ${curAge != null && (
                  (s.idx === 0 && curAge <= 15) || (s.idx === 1 && curAge >= 16 && curAge <= 30) ||
                  (s.idx === 2 && curAge >= 31 && curAge <= 45) || (s.idx === 3 && curAge >= 46)
                ) ? 'bg-gold-400' : 'bg-dark-500'}`} />
                {i < stages.length - 1 && <div className="flex-1 h-px bg-dark-500/60 mx-2" />}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {stages.map(s => {
              const isCur = curAge != null && (
                (s.idx === 0 && curAge <= 15) || (s.idx === 1 && curAge >= 16 && curAge <= 30) ||
                (s.idx === 2 && curAge >= 31 && curAge <= 45) || (s.idx === 3 && curAge >= 46)
              )
              return (
                <div key={s.idx} className={`bg-dark-700/50 rounded-lg p-3 border flex flex-col ${isCur ? 'border-gold-500/60 shadow-[0_0_10px_rgba(251,191,36,0.15)]' : 'border-dark-600'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gold-300 font-serif">{s.stage}</span>
                    <span className="text-[10px] text-gray-500">{s.range}</span>
                  </div>
                  {isCur && <p className="text-[9px] text-gold-400 mb-1">● 当前阶段</p>}
                  <p className="text-[10px] text-gray-500 mb-2">{s.gongwei} · {s.role}</p>
                  <p className="font-serif text-sm text-gray-200 mb-0.5">{s.pill.gz} <span className="text-[10px] text-gray-500">纳音 {s.pill.ny}</span></p>
                  <p className="text-[10px] text-gray-400 mb-2">干{s.pill.ssG} · 支{s.pill.ssZ} · 藏{s.pill.hd}</p>
                  {s.dayun.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {s.dayun.map((d, j) => (
                        <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-dark-800 border border-dark-600 text-cyan-300">{d.gz}（{d.age}岁）</span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-300 leading-relaxed mt-auto">{s.brief}</p>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-gray-500 text-center">六亲宫位：年柱=祖业/长辈，月柱=父母/兄弟，日柱=自身/配偶（日支为夫妻宫），时柱=子女/归宿。</p>
        </div>
      )}

      {/* ═══════════ 四、十神与宫位双维 ═══════════ */}
      {subTab === 'shishen' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-dark-700">
                  <th className="p-2 border border-dark-600 text-gray-500 w-16"></th>
                  <th className="p-2 border border-dark-600 text-gold-400 font-serif">天干（透）</th>
                  <th className="p-2 border border-dark-600 text-gold-400 font-serif">本气</th>
                  <th className="p-2 border border-dark-600 text-gold-400 font-serif">中气</th>
                  <th className="p-2 border border-dark-600 text-gold-400 font-serif">余气</th>
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
                    <tr key={i} className={i % 2 ? 'bg-dark-750' : ''}>
                      <td className="p-2 border border-dark-600 text-gray-400 font-medium">{NODE_PILLAR[i]}</td>
                      {cells.map((c, j) => (
                        <td key={j} className="p-2 border border-dark-600 text-center">
                          <span className={`font-serif font-semibold ${WX_OF[c.gan] ? '' : 'text-gray-300'}`} style={WX_OF[c.gan] ? { color: WX_HEX[WX_OF[c.gan]] } : undefined}>{c.gan}</span>
                          <span className="text-gray-400">（{c.ss}）</span>
                          <span className="block text-[9px] text-gray-500 mt-0.5">{liuqinOf(c.ss, gender).join('、') || '—'}</span>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 十神力量计数 */}
          <div>
            <p className="text-[11px] text-gray-400 mb-2">十神力量计数（天干=1，藏干本气=0.6/中气=0.4/余气=0.2）</p>
            <div className="space-y-1.5">
              {power.map((p, i) => {
                const maxP = Math.max(...power.map(x => x.power), 1)
                return (
                  <div key={p.group} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-300 w-10 shrink-0">{p.group}</span>
                    <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.power >= 3 ? 'bg-gold-500' : p.power >= 1.5 ? 'bg-blue-500' : 'bg-dark-500'}`} style={{ width: `${(p.power / maxP) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 w-8 text-right shrink-0">{p.power}</span>
                    <span className="text-[9px] text-gray-600 hidden md:inline truncate max-w-[180px]">{p.detail.join(' ')}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-dark-700/40 rounded-lg p-3 text-[10px] text-gray-500 leading-relaxed">
            六亲映射：比劫=兄弟；偏财=父，正印=母；{gender === '男' ? '男命以财星为妻（日支为妻宫），官杀为子女' : '女命以官杀为夫（日支为夫宫），食伤为子女'}；食伤为子女星（通用）。力量计数仅供格局参考，吉凶需结合旺衰喜忌综合判断。
          </div>
        </div>
      )}
    </div>
  )
}
