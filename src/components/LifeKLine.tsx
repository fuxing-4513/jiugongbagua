'use client'

// 人生 K 线（Life K-Line）——大运能量周期曲线
// 模型：以日主为中心，逐大运干支按十神关系计分（比劫印=助力上升 / 食伤财=施展输出 / 官杀=压力挑战）
// 透明声明：九宫五行能量参考模型——用于观察周期节奏，不构成确定性预测
import { ssM, wxM, hG } from '@/lib/bazi-engine'

interface Dy { gz: string; age: number; startYear: number }
const R = '甲乙丙丁戊己庚辛壬癸'

function scoreFor(riGan: string, gz: string): number {
  const tg = gz[0]
  const zh = gz[1]
  // 干 + 支本气两个五行 → 十神 → 能量分
  const parts = [tg, hG[zh] || '']
  let s = 0
  for (const p of parts) {
    if (!p) continue
    const rel = ssM[riGan]?.[p] || ''
    if (rel.includes('比肩') || rel.includes('劫财')) s += 2
    else if (rel.includes('正印') || rel.includes('偏印')) s += 1.6
    else if (rel.includes('食神') || rel.includes('伤官')) s += 1.2
    else if (rel.includes('正财') || rel.includes('偏财')) s += 0.8
    else s -= 1.2 // 官杀
  }
  return Math.max(-2.4, Math.min(2.4, s / 2))
}

export default function LifeKLine({ riGan, dayun, curAge, birthYear }: { riGan: string; dayun: Dy[]; curAge: number; birthYear: number }) {
  if (!dayun || dayun.length === 0) return null
  const W = 820, H = 300, PAD = { l: 46, r: 16, t: 26, b: 38 }
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b

  // 点：起点（age 0 起）→ 每运中位
  const pts: { age: number; score: number; gz: string }[] = [{ age: 0, score: 0, gz: '' }]
  for (const d of dayun) {
    const mid = d.age + 5
    pts.push({ age: mid, score: scoreFor(riGan, d.gz), gz: d.gz })
  }
  const lastAge = Math.max(90, (pts[pts.length - 1]?.age || 70) + 5)
  pts.push({ age: lastAge, score: pts[pts.length - 1]?.score || 0, gz: '' })

  const xOf = (a: number) => PAD.l + (a / 90) * iw
  const yOf = (s: number) => PAD.t + ih / 2 - (s / 2.6) * (ih / 2)
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.age).toFixed(1)},${yOf(p.score).toFixed(1)}`).join(' ')
  const area = `${line} L${xOf(lastAge).toFixed(1)},${PAD.t + ih} L${xOf(0).toFixed(1)},${PAD.t + ih} Z`
  // 当前点（最近处）
  const curP = pts.reduce((a, b) => (Math.abs(b.age - curAge) < Math.abs(a.age - curAge) ? b : a))
  // 高/低点（转折标记）
  let hi = pts[0], lo = pts[0]
  for (const p of pts) { if (p.score > hi.score) hi = p; if (p.score < lo.score) lo = p }

  return (
    <div className="rounded-2xl border border-gold-300/40 dark:border-gold-500/20 bg-white/90 dark:bg-[#131210]/80 p-4 md:p-5">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
        <h3 className="text-base font-serif font-bold text-gray-900 dark:text-gray-50">📈 人生 K 线 · 大运能量周期</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400">易截图 · 易传播</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label="人生K线——大运能量周期图">
        {/* 中轴（能量零线） */}
        <line x1={PAD.l} y1={PAD.t + ih / 2} x2={W - PAD.r} y2={PAD.t + ih / 2} stroke="#d8c9a8" strokeWidth={1} strokeDasharray="4 5" opacity={0.5} />
        {/* 网格横线 */}
        {[-2, -1, 0, 1, 2].map(v => (
          <g key={v}>
            <line x1={PAD.l} y1={yOf(v)} x2={W - PAD.r} y2={yOf(v)} stroke="#00000008" strokeWidth={1} />
            <text x={PAD.l - 8} y={yOf(v) + 3} textAnchor="end" fontSize={9} fill="#aaa">{v > 0 ? `+${v}` : v}</text>
          </g>
        ))}
        {/* 年份轴 */}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(a => (
          <g key={a}>
            <line x1={xOf(a)} y1={PAD.t} x2={xOf(a)} y2={PAD.t + ih} stroke="#00000006" strokeWidth={1} />
            <text x={xOf(a)} y={H - 14} textAnchor="middle" fontSize={10} fill="#999">{a}岁</text>
          </g>
        ))}
        {/* 面积 + 曲线 */}
        <path d={area} fill="url(#klineGrad)" opacity={0.25} />
        <path d={line} fill="none" stroke="#b08a3c" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
        <defs>
          <linearGradient id="klineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b08a3c" />
            <stop offset="100%" stopColor="#b08a3c" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* 转折点 */}
        {pts.filter(p => p.gz).map((p, i) => (
          <circle key={i} cx={xOf(p.age)} cy={yOf(p.score)} r={3.2} fill="#fff" stroke="#b08a3c" strokeWidth={1.8} />
        ))}
        {/* 高点：机会窗口 */}
        {hi.gz && (
          <g>
            <circle cx={xOf(hi.age)} cy={yOf(hi.score)} r={5.5} fill="#c0392b" opacity={0.85} />
            <text x={xOf(hi.age)} y={yOf(hi.score) - 12} textAnchor="middle" fontSize={11} fontWeight={700} fill="#c0392b">▲ 机会窗口 {hi.age} 岁前后</text>
          </g>
        )}
        {/* 低点：蓄势 */}
        {lo.gz && (
          <g>
            <circle cx={xOf(lo.age)} cy={yOf(lo.score)} r={4.5} fill="#4a6fa5" opacity={0.85} />
            <text x={xOf(lo.age)} y={yOf(lo.score) + 18} textAnchor="middle" fontSize={11} fontWeight={700} fill="#4a6fa5">▼ 蓄势期 {lo.age} 岁前后</text>
          </g>
        )}
        {/* 当前年龄 */}
        <g>
          <line x1={xOf(curAge)} y1={PAD.t} x2={xOf(curAge)} y2={PAD.t + ih} stroke="#e74c3c" strokeWidth={1.4} strokeDasharray="3 4" opacity={0.7} />
          <circle cx={xOf(curP.age)} cy={yOf(curP.score)} r={4} fill="#e74c3c" />
          <text x={xOf(curAge)} y={PAD.t - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill="#e74c3c">你 · {curAge} 岁</text>
        </g>
      </svg>

      {/* 大运注记（当前运高亮） */}
      <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
        {dayun.map((d, i) => (
          <span key={i} className={`text-[10px] px-2 py-1 rounded-full border ${curAge >= d.age && curAge < d.age + 10 ? 'border-gold-500/60 bg-gold-500/10 text-gold-700 dark:text-gold-300 font-medium' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
            {d.age}岁 {d.gz}
          </span>
        ))}
      </div>
      <p className="text-center text-[9.5px] text-gray-400 dark:text-gray-500 mt-2.5 leading-relaxed">
        九宫五行能量参考模型：以日主为中心，按大运干支的十神关系绘制的周期节奏（印比=助力 · 食伤财=施展 · 官杀=磨砺）。
        用于观察人生阶段与时机窗口——传统模型参考，不构成确定性预测。
      </p>
    </div>
  )
}
