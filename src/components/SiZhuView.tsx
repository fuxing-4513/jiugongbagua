'use client'

import { useMemo, useState } from 'react'
import {
  computeAllRelations, wuxingDetail, wuxingFlow, shenshaPower, liuqinOf,
  lifeStages, pillarPairs, calcMingGong, calcShenGong, calcTaiYuan,
  REL_COLOR, NODE_PILLAR, WX_CYCLE, type PillarLike, type BaziRelation,
} from '@/lib/bazi-relations'

// 节点坐标（viewBox 0 0 100 100，与 HTML 百分比定位严格对齐）
const GX = [12.5, 37.5, 62.5, 87.5]   // 四柱 x
const GY = 33                         // 天干 y
const ZY = 69                         // 地支 y
const LABEL_Y = 11

const WX_COLOR: Record<string, string> = { 金: 'text-yellow-400', 木: 'text-green-400', 水: 'text-blue-400', 火: 'text-red-400', 土: 'text-amber-400' }

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

  // 关系线（同 pair 多条时做微偏移避免重叠）
  const lineGroups = useMemo(() => {
    const map: Record<string, BaziRelation[]> = {}
    for (const r of relations) {
      const key = [r.a, r.b].sort().join('|')
      ;(map[key] = map[key] || []).push(r)
    }
    return map
  }, [relations])

  const nodeXY = (id: string) => {
    const i = parseInt(id.slice(1))
    return id.startsWith('g') ? { x: GX[i], y: GY } : { x: GX[i], y: ZY }
  }

  const linePath = (a: string, b: string, idx: number, cnt: number) => {
    const p1 = nodeXY(a), p2 = nodeXY(b)
    const sameY = Math.abs(p1.y - p2.y) < 1
    let { x: x1, y: y1 } = p1, { x: x2, y: y2 } = p2
    if (sameY) {
      const dy = (idx - (cnt - 1) / 2) * 1.6
      y1 += dy; y2 += dy
    }
    return `M${x1},${y1} L${x2},${y2}`
  }

  const tabBtn = (key: typeof subTab, label: string) => (
    <button onClick={() => { setSubTab(key); setSelected(null) }}
      className={`px-3 min-h-[32px] rounded-md text-xs transition-colors ${subTab === key ? 'bg-gold-600/20 text-gold-300 border border-gold-500/40' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>
      {label}
    </button>
  )

  return (
    <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gold-300 font-serif">四柱视角</h3>
        <div className="flex gap-1 flex-wrap">
          {tabBtn('qimai', '🕸 先天气脉')}
          {tabBtn('peidui', '⚔ 刑冲合害')}
          {tabBtn('jieduan', '🌱 人生阶段')}
          {tabBtn('shishen', '🧭 十神宫位')}
        </div>
      </div>

      {/* ═══ 先天气脉图 ═══ */}
      {subTab === 'qimai' && (
        <div className="space-y-4">
          <div className="relative w-full aspect-[4/3] sm:aspect-[2/1] select-none">
            {/* SVG 关系线 */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
              {Object.entries(lineGroups).map(([key, rels]) => {
                const [a, b] = key.split('|')
                return rels.map((r, idx) => {
                  const active = !selected || selRels.some(sr => sr.id === r.id)
                  return (
                    <line key={r.id} x1={nodeXY(a).x} y1={nodeXY(a).y} x2={nodeXY(b).x} y2={nodeXY(b).y}
                      stroke={REL_COLOR[r.type] || '#888'}
                      strokeWidth={active ? (selected ? 1.4 : 0.7) : 0.15}
                      strokeDasharray={r.type === '同柱' ? '2 1.4' : undefined}
                      opacity={active ? (selected ? 0.95 : 0.42) : 0.08}
                      pathLength={100}
                    />
                  )
                })
              })}
            </svg>

            {/* 柱名 */}
            {NODE_PILLAR.map((n, i) => (
              <div key={n} className="absolute -translate-x-1/2 -translate-y-1/2 text-[11px] text-gold-400 font-serif font-semibold"
                style={{ left: `${GX[i]}%`, top: `${LABEL_Y}%` }}>{n}</div>
            ))}

            {/* 天干节点 */}
            {pills.map((p, i) => {
              const id = `g${i}`
              const on = selected === id
              return (
                <button key={id} onClick={() => setSelected(on ? null : id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2 py-1 text-center transition-all ${on ? 'border-gold-400 bg-gold-600/25 shadow-[0_0_10px_rgba(251,191,36,0.5)] scale-110' : 'border-dark-500 bg-dark-700 hover:border-gold-500/60'}`}
                  style={{ left: `${GX[i]}%`, top: `${GY}%` }}>
                  <span className={`block text-base font-bold font-serif leading-none ${WX_COLOR[WX_OF_GAN[p.gan]] || 'text-gray-200'}`}>{p.gan}</span>
                  <span className="block text-[9px] text-gray-400 leading-tight mt-0.5">{p.ssG}</span>
                </button>
              )
            })}

            {/* 地支节点 */}
            {pills.map((p, i) => {
              const id = `z${i}`
              const on = selected === id
              return (
                <button key={id} onClick={() => setSelected(on ? null : id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2 py-1 text-center transition-all ${on ? 'border-gold-400 bg-gold-600/25 shadow-[0_0_10px_rgba(251,191,36,0.5)] scale-110' : 'border-dark-500 bg-dark-700 hover:border-gold-500/60'}`}
                  style={{ left: `${GX[i]}%`, top: `${ZY}%` }}>
                  <span className={`block text-base font-bold font-serif leading-none ${WX_COLOR[WX_OF_ZHI[p.zhi]] || 'text-amber-300'}`}>{p.zhi}</span>
                  <span className="block text-[9px] text-gray-400 leading-tight mt-0.5">{p.hd}</span>
                </button>
              )
            })}

            {/* 纳音 */}
            {pills.map((p, i) => (
              <div key={'ny' + i} className="absolute -translate-x-1/2 text-[9px] text-gray-500"
                style={{ left: `${GX[i]}%`, top: '92%' }}>{p.ny}</div>
            ))}
          </div>

          {/* 图例 + 关系明细 */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {Object.entries(REL_COLOR).map(([t, c]) => (
              <span key={t} className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                <span className="w-3 h-0.5 inline-block rounded" style={{ background: c }} />{t}
              </span>
            ))}
          </div>

          <div className="text-[10px] text-gray-500 text-center leading-relaxed">
            点击任意干支，高亮它牵动的全部关系（同柱生克、相邻生克、天干五合、地支六合/三合/六冲/三刑/六害/相破）。
            用=天干，外显的追求与取得资源的方式；体=地支，根基与藏蓄能量。取象与喜忌判读需完整命局报告，可回八字排盘查看。
          </div>

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

          {/* 五行分布（含藏干本气/中气/余气） */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {WX_CYCLE.map(w => {
              const d = wxDetail[w]
              const max = Math.max(...WX_CYCLE.map(k => wxDetail[k].count), 1)
              return (
                <div key={w} className="bg-dark-700/50 rounded-lg p-2 border border-dark-600">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${WX_COLOR[w]}`}>{w}</span>
                    <span className="text-[10px] text-gray-400">{d.count}个</span>
                  </div>
                  <div className="w-full h-1.5 bg-dark-600 rounded-full mt-1 overflow-hidden">
                    <div className={`h-full rounded-full ${w === '金' ? 'bg-yellow-500' : w === '木' ? 'bg-green-500' : w === '水' ? 'bg-blue-500' : w === '火' ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${(d.count / max) * 100}%` }} />
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1">干{d.gan} 本{d.ben} 中{d.zhong} 余{d.yu}</p>
                </div>
              )
            })}
          </div>

          {/* 五行流通 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-dark-700/50 rounded-lg p-3 border border-dark-600">
              <p className="text-[11px] text-gray-400 mb-1.5">相生环（存在=亮，缺失=暗）</p>
              <div className="flex flex-wrap gap-1">
                {flow.sheng.map((s, i) => (
                  <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border ${s.active ? 'bg-green-900/30 border-green-700/50 text-green-300' : 'bg-dark-800 border-dark-600 text-gray-600'}`}>
                    {s.from}→{s.to}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-3 border border-dark-600">
              <p className="text-[11px] text-gray-400 mb-1.5">相克环（存在=亮，缺失=暗）</p>
              <div className="flex flex-wrap gap-1">
                {flow.ke.map((s, i) => (
                  <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border ${s.active ? 'bg-red-900/30 border-red-700/50 text-red-300' : 'bg-dark-800 border-dark-600 text-gray-600'}`}>
                    {s.from}克{s.to}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 特殊宫位 */}
          <div className="grid grid-cols-3 gap-2">
            {[['命宫', mg, 'text-gold-300'], ['身宫', sg, 'text-blue-300'], ['胎元', ty, 'text-purple-300']].map(([n, v, c]) => (
              <div key={n as string} className="bg-dark-700/50 rounded-lg p-2.5 text-center border border-dark-600">
                <p className="text-[10px] text-gray-500 mb-0.5">{n}</p>
                <p className={`text-sm font-bold font-serif ${c}`}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 柱间刑冲合害全配对 ═══ */}
      {subTab === 'peidui' && (
        <div className="space-y-3">
          <p className="text-[11px] text-gray-500">四柱两两配对一览：紧邻（年月/月日/日时）力量最显；隔位（年日/年时/月时）刑冲合害力量递减。三刑为「恃势之刑」，力量强于一般相克。</p>
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

      {/* ═══ 人生阶段与亲属宫 ═══ */}
      {subTab === 'jieduan' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {stages.map(s => {
              const isCur = curAge != null && (
                (s.idx === 0 && curAge <= 15) ||
                (s.idx === 1 && curAge >= 16 && curAge <= 30) ||
                (s.idx === 2 && curAge >= 31 && curAge <= 45) ||
                (s.idx === 3 && curAge >= 46)
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
            )})}
          </div>
          <p className="text-[10px] text-gray-500 text-center">六亲宫位：年柱=祖业/长辈，月柱=父母/兄弟，日柱=自身/配偶（日支为夫妻宫），时柱=子女/归宿。</p>
        </div>
      )}

      {/* ═══ 十神与宫位双维 ═══ */}
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
                          <span className={`font-serif font-semibold ${WX_COLOR[WX_OF_GAN[c.gan]] || 'text-gray-300'}`}>{c.gan}</span>
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

// 五行映射（避免循环引用，本地维护）
const WX_OF_GAN: Record<string, string> = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'}
const WX_OF_ZHI: Record<string, string> = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}
