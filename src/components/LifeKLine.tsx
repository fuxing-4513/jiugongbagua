'use client'

// 人生图谱（Life Graph）——大运四维能量曲线（规范 2.0）
// 模型：以日主为中心，逐大运干支按十神关系分四维计分——
//   事业 = 印比（助力）+ 官杀（地位压力释放）     财富 = 财星 + 食伤（生财通路）
//   感情 = 异性星（男财女官）                     人生 = 四维均值（总能量）
// 透明声明：九宫参考模型——用于观察周期节奏，不构成确定性预测
import { ssM, hG } from '@/lib/bazi-engine'

interface Dy { gz: string; age: number; startYear: number }
const SERIES: { key: string; name: string; color: string }[] = [
  { key: 'career', name: '事业', color: '#B08A3C' },
  { key: 'wealth', name: '财富', color: '#8A9A78' },
  { key: 'love', name: '感情', color: '#A86F73' },
  { key: 'life', name: '人生', color: '#6E7880' },
]

function dimScores(riGan: string, gz: string): Record<string, number> {
  const rels: string[] = []
  const tg = gz[0]
  const zh = gz[1]
  for (const p of [tg, hG[zh] || '']) if (p) rels.push(ssM[riGan]?.[p] || '')
  let career = 0, wealth = 0, love = 0
  for (const rel of rels) {
    if (!rel) continue
    if (rel.includes('印') || rel.includes('比肩') || rel.includes('劫财')) career += 2.2
    if (rel.includes('官') || rel.includes('杀')) { career += 0.8; love += 1.6 }
    if (rel.includes('财')) { wealth += 2.4; love += 1.4 }
    if (rel.includes('食神') || rel.includes('伤官')) wealth += 1.6
  }
  // 归一（双柱 → /2 → 范围 ~0-2.4）
  career /= 2; wealth /= 2; love /= 2
  const life = (career + wealth + love) / 3 + 0.5
  return { career, wealth, love, life }
}

export default function LifeGraph({ riGan, dayun, curAge, birthYear }: { riGan: string; dayun: Dy[]; curAge: number; birthYear: number }) {
  if (!dayun || dayun.length === 0) return null
  const W = 860, H = 340, PAD = { l: 40, r: 16, t: 30, b: 40 }
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b

  const pts: { age: number; dims: Record<string, number>; gz: string }[] = []
  for (const d of dayun) pts.push({ age: d.age + 5, dims: dimScores(riGan, d.gz), gz: d.gz })
  const lastAge = 90
  const yOf = (s: number) => PAD.t + ih - (Math.min(3, Math.max(0, s)) / 3) * ih

  return (
    <div className="p-5" style={{ background: 'var(--paper)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
        <h3 className="text-[18px] font-serif text-[#181818]" style={{ fontWeight: 500 }}>你的人生图谱</h3>
        <div className="flex gap-4">
          {SERIES.map(sr => (
            <span key={sr.key} className="flex items-center gap-1.5 text-[11px]" style={{ color: '#68645C' }}>
              <span className="w-4 h-px inline-block" style={{ background: sr.color }} />{sr.name}
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label="人生图谱——大运四维能量曲线">
        {[0, 1, 2, 3].map(v => (
          <g key={v}>
            <line x1={PAD.l} y1={yOf(v)} x2={W - PAD.r} y2={yOf(v)} stroke="#DED8C9" strokeWidth={0.5} />
          </g>
        ))}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(a => (
          <g key={a}>
            <line x1={PAD.l + (a / 90) * iw} y1={PAD.t} x2={PAD.l + (a / 90) * iw} y2={PAD.t + ih} stroke="#DED8C9" strokeWidth={0.5} opacity={0.6} />
            <text x={PAD.l + (a / 90) * iw} y={H - 16} textAnchor="middle" fontSize={11} fill="#9B968B">{birthYear + a}</text>
          </g>
        ))}
        {SERIES.map(sr => {
          const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${PAD.l + (p.age / 90) * iw},${yOf(p.dims[sr.key])}`).join(' ')
          return <path key={sr.key} d={line} fill="none" stroke={sr.color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" opacity={0.92} />
        })}
        {/* 当前年龄 */}
        <line x1={PAD.l + (curAge / 90) * iw} y1={PAD.t} x2={PAD.l + (curAge / 90) * iw} y2={PAD.t + ih} stroke="#B23A3A" strokeWidth={1} strokeDasharray="3 4" opacity={0.8} />
        <text x={PAD.l + (curAge / 90) * iw} y={PAD.t - 8} textAnchor="middle" fontSize={11} fill="#B23A3A">当前 · {birthYear + curAge}</text>
        {/* 大运底注 */}
        {pts.map((p, i) => (
          <text key={i} x={PAD.l + (p.age / 90) * iw} y={PAD.t + ih + 18} textAnchor="middle" fontSize={10} fill="#9B968B">{p.gz}</text>
        ))}
      </svg>
      <p className="text-center text-[10px] leading-relaxed mt-2" style={{ color: '#9B968B' }}>
        九宫参考模型：依大运干支十神分四维绘制的周期节奏（事业=印比官杀 · 财富=财星食伤 · 感情=异性星 · 人生=综合）——用于观察人生阶段与时机窗口，不构成确定性预测。
      </p>
    </div>
  )
}
