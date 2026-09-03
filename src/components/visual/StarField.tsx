/**
 * StarField —— 星盘点线（星座连线装饰）
 * 确定性伪随机（模块级纯函数），SSR 与客户端渲染结果一致，无水合闪烁。
 * 用法：<div className="absolute inset-0 overflow-hidden"><StarField className="absolute inset-0 w-full h-full" /></div>
 */

/** 确定性伪随机：0..1 */
function rnd(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const W = 1200
const H = 560
const STAR_N = 96

interface Star { x: number; y: number; r: number; o: number; tw: boolean }
interface Edge { x1: number; y1: number; x2: number; y2: number; o: number }

const stars: Star[] = Array.from({ length: STAR_N }, (_, i) => ({
  x: Math.round(rnd(i) * W * 10) / 10,
  y: Math.round(rnd(i + 911) * H * 10) / 10,
  r: Math.round((0.7 + rnd(i + 222) * 1.6) * 10) / 10,
  o: Math.round((0.3 + rnd(i + 333) * 0.7) * 100) / 100,
  tw: i % 7 === 0,
}))

const edges: Edge[] = (() => {
  const out: Edge[] = []
  for (let i = 0; i < STAR_N; i++) {
    for (let j = i + 1; j < STAR_N; j++) {
      const dx = stars[i].x - stars[j].x
      const dy = stars[i].y - stars[j].y
      const d2 = dx * dx + dy * dy
      if (d2 < 150 * 150 && d2 > 0) {
        out.push({
          x1: stars[i].x,
          y1: stars[i].y,
          x2: stars[j].x,
          y2: stars[j].y,
          o: Math.round((0.05 + 0.16 * (1 - Math.sqrt(d2) / 150)) * 100) / 100,
        })
      }
    }
  }
  return out.sort(() => 0.5 - rnd(out.length + 7)) // 数量少时随机序即可，视觉无碍
})()

export default function StarField({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      {edges.map((e, i) => (
        <line
          key={`l${i}`}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke="var(--jg-accent)"
          strokeWidth={0.6}
          opacity={e.o}
        />
      ))}
      {stars.map((s, i) => (
        <circle
          key={`s${i}`}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={i % 5 === 0 ? 'var(--jg-gold)' : 'var(--jg-text-2)'}
          opacity={s.o}
          className={s.tw ? 'jg-pulse-soft' : undefined}
          style={s.tw ? { animationDelay: `${(i % 9) * 0.4}s` } : undefined}
        />
      ))}
    </svg>
  )
}
